#!/usr/bin/env python3
"""
CTOWN_1GB_24H Parquet Ingestion Script
=====================================
Ingests CTOWN water network parquet data into PostgreSQL/PostGIS database.
Maps pressure, flow, demand, level, and head data to sensors and sensor_readings.
Uses scenario_id=0 for 24-hour time-series. No hardcoded IDs; fetches from DB.
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

# Load .env from project root (backend folder)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / "backend" / ".env")
except ImportError:
    pass

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# -----------------------------------------------------------------------------
# CONFIGURATION - Adjust for your environment
# -----------------------------------------------------------------------------
CTOWN_FOLDER = Path(__file__).parent.parent / "CTOWN_1GB_24H"
SCENARIO_ID = 0  # Use first scenario only (24-hour cycle)
BASE_DATE = datetime(2026, 1, 30)  # Solapur dummy data date
BATCH_SIZE = 5000  # Rows per INSERT batch
CHUNK_ROWS = 50000  # Parquet read chunk size (for large files)

# Database - uses env vars (same as backend)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5433")),
    "dbname": os.getenv("DB_NAME", "smart_water_management"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "RA101728vu"),
}

# Solapur center for synthetic geometry
SOLAPUR_CENTER = (17.6599, 75.9064)  # (lat, lng)

# Parquet file mapping: filename -> (sensor_type, entity_prefix)
# node_demand used (output); junction_base_demand skipped to avoid duplicate demand
DYNAMIC_FILES = {
    "node_pressure-0-dynamic_output.parquet": ("pressure", "J"),
    "node_demand-0-dynamic_output.parquet": ("demand", "J"),
    "node_head-0-dynamic_output.parquet": ("head", "J"),
    "link_flowrate-0-dynamic_output.parquet": ("flow", "P"),
}
STATIC_LEVEL_FILE = "tank_init_level-0-static_input.parquet"
PIPE_LENGTH_FILE = "pipe_length-0-static_input.parquet"
PIPE_DIAMETER_FILE = "pipe_diameter-0-static_input.parquet"


def get_conn():
    """Create database connection."""
    return psycopg2.connect(**DB_CONFIG)


def extract_entity_id(col_name: str) -> Optional[str]:
    """Extract CTOWN entity ID from column (e.g. J511 -> J511, P1 -> P1)."""
    m = re.match(r"^(J|P|T)(\d+)$", str(col_name), re.I)
    return col_name if m else None


def get_value_columns(df: pd.DataFrame, prefix: str) -> List[str]:
    """Get columns matching entity prefix (J, P, or T)."""
    return [c for c in df.columns if c.startswith(prefix) and extract_entity_id(c)]


def create_synthetic_point(lat: float, lng: float, index: int) -> str:
    """Create WKT point with small offset for uniqueness."""
    offset = (index % 100) * 0.001
    lng_offset = lng + (index * 0.0001) % 0.01
    lat_offset = lat + offset * 0.5
    return f"SRID=4326;POINT({lng_offset} {lat_offset})"


def create_synthetic_linestring(lat: float, lng: float, length_m: float) -> str:
    """Create WKT linestring from length (approx. N-S direction)."""
    delta = length_m / 111000.0
    return f"SRID=4326;LINESTRING({lng} {lat}, {lng} {lat + delta})"


# -----------------------------------------------------------------------------
# Step 1: Fetch existing IDs from database
# -----------------------------------------------------------------------------
def fetch_dma_ids(conn) -> List[int]:
    """Fetch all dma_id from dmas table."""
    with conn.cursor() as cur:
        cur.execute("SELECT dma_id FROM dmas ORDER BY dma_id")
        return [r[0] for r in cur.fetchall()]


def get_pipeline_columns(conn) -> List[str]:
    """Detect pipeline table columns."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'pipelines' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        return [r[0] for r in cur.fetchall()]


# -----------------------------------------------------------------------------
# Step 2: Create pipelines from pipe static data
# -----------------------------------------------------------------------------
def ingest_pipelines(conn, dma_ids: List[int]) -> Dict[str, int]:
    """
    Create pipelines from pipe_length and pipe_diameter.
    Returns mapping: CTOWN pipe ID (e.g. P1) -> pipeline_id.
    """
    if not dma_ids:
        print("  [SKIP] No DMAs found. Pipelines need dma_id.")
        return {}

    pipe_length_path = CTOWN_FOLDER / PIPE_LENGTH_FILE
    pipe_diameter_path = CTOWN_FOLDER / PIPE_DIAMETER_FILE
    if not pipe_length_path.exists() or not pipe_diameter_path.exists():
        print("  [SKIP] Pipe static files not found.")
        return {}

    df_len = pd.read_parquet(pipe_length_path)
    df_dia = pd.read_parquet(pipe_diameter_path)
    df_len_0 = df_len[df_len["scenario_id"] == SCENARIO_ID].iloc[0]
    df_dia_0 = df_dia[df_dia["scenario_id"] == SCENARIO_ID].iloc[0]

    pipe_cols = get_value_columns(df_len, "P")
    lat, lng = SOLAPUR_CENTER
    cols = get_pipeline_columns(conn)
    has_dma = "dma_id" in cols
    has_length = "length" in cols
    diam_col = "diameter_mm" if "diameter_mm" in cols else ("diameter" if "diameter" in cols else None)
    has_geom = "geom" in cols

    mapping = {}
    with conn.cursor() as cur:
        for i, pipe_id in enumerate(pipe_cols):
            length = float(df_len_0[pipe_id])
            diameter = float(df_dia_0[pipe_id])
            dma_id = dma_ids[i % len(dma_ids)] if has_dma and dma_ids else None
            geom = create_synthetic_linestring(lat, lng, length)

            if not has_geom:
                continue

            # Build INSERT based on available columns
            if has_dma and dma_id is not None and diam_col:
                if has_length:
                    cur.execute(
                        f"INSERT INTO pipelines (dma_id, geom, length, {diam_col}) "
                        "VALUES (%s, ST_GeomFromEWKT(%s), %s, %s) RETURNING pipeline_id",
                        (dma_id, geom, length, int(diameter)),
                    )
                else:
                    cur.execute(
                        f"INSERT INTO pipelines (dma_id, geom, {diam_col}) "
                        "VALUES (%s, ST_GeomFromEWKT(%s), %s) RETURNING pipeline_id",
                        (dma_id, geom, int(diameter)),
                    )
            elif diam_col:
                cur.execute(
                    f"INSERT INTO pipelines (geom, {diam_col}) "
                    "VALUES (ST_GeomFromEWKT(%s), %s) RETURNING pipeline_id",
                    (geom, int(diameter)),
                )
            else:
                cur.execute(
                    "INSERT INTO pipelines (geom) VALUES (ST_GeomFromEWKT(%s)) RETURNING pipeline_id",
                    (geom,),
                )

            row = cur.fetchone()
            if row:
                mapping[pipe_id] = row[0]

    conn.commit()
    print(f"  Created {len(mapping)} pipelines")
    return mapping


# -----------------------------------------------------------------------------
# Step 3: Create or get sensors for each entity
# -----------------------------------------------------------------------------
def get_or_create_sensor(
    conn,
    cur,
    sensor_cache: Dict[Tuple[str, str], int],
    ctown_id: str,
    sensor_type: str,
    dma_ids: List[int],
    pipeline_mapping: Dict[str, int],
    entity_index: int,
) -> int:
    """
    Get sensor_id from cache or create new sensor (check DB first to avoid duplicates).
    Returns sensor_id.
    """
    key = (ctown_id, sensor_type)
    if key in sensor_cache:
        return sensor_cache[key]

    # Check if sensor already exists (from previous run) - use status as logical key
    status_key = f"ctown_{ctown_id}_{sensor_type}"
    cur.execute(
        "SELECT sensor_id FROM sensors WHERE sensor_type = %s AND status = %s LIMIT 1",
        (sensor_type, status_key),
    )
    row = cur.fetchone()
    if row:
        sensor_cache[key] = row[0]
        return row[0]

    # Create new sensor
    dma_id = dma_ids[entity_index % len(dma_ids)] if dma_ids and dma_ids[0] is not None else None
    pipeline_id = pipeline_mapping.get(ctown_id) if ctown_id.startswith("P") else None
    lat, lng = SOLAPUR_CENTER
    geom = create_synthetic_point(lat, lng, entity_index)
    lat_val = lat + (entity_index % 100) * 0.001
    lng_val = lng + (entity_index * 0.0001) % 0.01

    cur.execute(
        """
        INSERT INTO sensors (sensor_type, dma_id, pipeline_id, latitude, longitude, geom, status)
        VALUES (%s, %s, %s, %s, %s, ST_GeomFromEWKT(%s), %s)
        RETURNING sensor_id
        """,
        (sensor_type, dma_id, pipeline_id, lat_val, lng_val, geom, status_key),
    )
    sensor_id = cur.fetchone()[0]
    sensor_cache[key] = sensor_id
    return sensor_id


# -----------------------------------------------------------------------------
# Step 4: Ingest dynamic time-series into sensor_readings
# -----------------------------------------------------------------------------
def ingest_dynamic_file(
    conn,
    filepath: Path,
    sensor_type: str,
    entity_prefix: str,
    dma_ids: List[int],
    pipeline_mapping: Dict[str, int],
    sensor_cache: Dict[Tuple[str, str], int],
) -> int:
    """
    Ingest one dynamic parquet file into sensor_readings.
    Returns count of rows inserted.
    """
    df = pd.read_parquet(filepath)
    df = df[df["scenario_id"] == SCENARIO_ID].copy()
    if df.empty:
        return 0

    value_cols = get_value_columns(df, entity_prefix)
    if not value_cols:
        return 0

    # Build (entity_id, recorded_at, value) tuples
    rows_to_insert = []
    for _, row in df.iterrows():
        time_id = int(row["time_id"])
        recorded_at = BASE_DATE + timedelta(hours=time_id)
        for col in value_cols:
            val = row[col]
            if pd.isna(val):
                continue
            rows_to_insert.append((col, recorded_at, float(val)))

    if not rows_to_insert:
        return 0

    entity_to_idx = {e: i for i, e in enumerate(value_cols)}
    total_inserted = 0

    with conn.cursor() as cur:
        # Pre-create sensors for all entities in this file
        for entity_id in value_cols:
            idx = entity_to_idx.get(entity_id, 0)
            get_or_create_sensor(
                conn, cur, sensor_cache, entity_id, sensor_type, dma_ids, pipeline_mapping, idx
            )
        conn.commit()

        # Batch insert readings
        for chunk_start in range(0, len(rows_to_insert), BATCH_SIZE):
            chunk = rows_to_insert[chunk_start : chunk_start + BATCH_SIZE]
            batch_data = []
            for entity_id, recorded_at, value in chunk:
                sensor_id = sensor_cache.get((entity_id, sensor_type))
                if sensor_id is None:
                    idx = entity_to_idx.get(entity_id, 0)
                    sensor_id = get_or_create_sensor(
                        conn, cur, sensor_cache, entity_id, sensor_type, dma_ids, pipeline_mapping, idx
                    )
                batch_data.append((sensor_id, value, recorded_at))

            execute_values(
                cur,
                """
                INSERT INTO sensor_readings (sensor_id, value, recorded_at)
                VALUES %s
                ON CONFLICT (sensor_id, recorded_at) DO NOTHING
                """,
                batch_data,
                template="(%s, %s, %s)",
            )
            total_inserted += len(batch_data)

    conn.commit()
    return total_inserted


# -----------------------------------------------------------------------------
# Step 5: Ingest tank level (static -> single reading per tank)
# -----------------------------------------------------------------------------
def ingest_tank_level(
    conn,
    dma_ids: List[int],
    sensor_cache: Dict[Tuple[str, str], int],
    pipeline_mapping: Dict[str, int],
) -> int:
    """Ingest tank_init_level as level sensor readings (one per tank)."""
    path = CTOWN_FOLDER / STATIC_LEVEL_FILE
    if not path.exists():
        return 0

    df = pd.read_parquet(path)
    df_0 = df[df["scenario_id"] == SCENARIO_ID].iloc[0]
    tank_cols = get_value_columns(df, "T")
    if not tank_cols:
        return 0

    rows = []
    with conn.cursor() as cur:
        for i, tank_id in enumerate(tank_cols):
            value = float(df_0[tank_id])
            sensor_id = get_or_create_sensor(
                conn, cur, sensor_cache, tank_id, "level", dma_ids, pipeline_mapping, i + 10000
            )
            recorded_at = BASE_DATE
            rows.append((sensor_id, value, recorded_at))

        execute_values(
            cur,
            "INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES %s ON CONFLICT (sensor_id, recorded_at) DO NOTHING",
            rows,
            template="(%s, %s, %s)",
        )

    conn.commit()
    return len(rows)


# -----------------------------------------------------------------------------
# Step 6: Ensure unique constraint for duplicate prevention
# -----------------------------------------------------------------------------
def ensure_unique_constraint(conn) -> bool:
    """
    Create unique index on (sensor_id, recorded_at) if not exists.
    Required for ON CONFLICT DO NOTHING. Returns True if constraint exists/created.
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'sensor_readings' AND indexname = 'sensor_readings_sensor_recorded_unique'
        """)
        if cur.fetchone():
            print("  Unique constraint (sensor_id, recorded_at) already exists")
            return True
        try:
            cur.execute("""
                CREATE UNIQUE INDEX sensor_readings_sensor_recorded_unique
                ON sensor_readings (sensor_id, recorded_at)
            """)
            conn.commit()
            print("  Created unique constraint (sensor_id, recorded_at)")
            return True
        except psycopg2.Error as e:
            conn.rollback()
            print(f"  WARNING: Could not create unique constraint: {e}")
            print("  Duplicate inserts may occur on re-run.")
            return False


# -----------------------------------------------------------------------------
# Main ingestion flow
# -----------------------------------------------------------------------------
def main():
    """Run full ingestion pipeline."""
    print("=" * 60)
    print("CTOWN_1GB_24H Parquet Ingestion")
    print("=" * 60)

    if not CTOWN_FOLDER.exists():
        print(f"ERROR: CTOWN folder not found: {CTOWN_FOLDER}")
        sys.exit(1)

    conn = get_conn()
    try:
        # Step 1: Fetch DMAs
        print("\n[1] Fetching DMAs...")
        dma_ids = fetch_dma_ids(conn)
        if not dma_ids:
            print("  ERROR: No DMAs found. Create zones and DMAs first.")
            print("  Run: INSERT INTO zones (zone_name, geom) VALUES (...);")
            print("       INSERT INTO dmas (dma_name, zone_id, geom) VALUES (...);")
            sys.exit(1)

        # Step 2: Pipelines
        print("\n[2] Ingesting pipelines...")
        pipeline_mapping = ingest_pipelines(conn, dma_ids)

        # Step 3: Ensure unique constraint
        print("\n[3] Ensuring duplicate prevention...")
        ensure_unique_constraint(conn)

        # Step 4: Dynamic time-series
        print("\n[4] Ingesting dynamic sensor data...")
        sensor_cache = {}
        total_readings = 0

        for filename, (sensor_type, prefix) in DYNAMIC_FILES.items():
            filepath = CTOWN_FOLDER / filename
            if not filepath.exists():
                print(f"  [SKIP] {filename}")
                continue
            n = ingest_dynamic_file(
                conn, filepath, sensor_type, prefix, dma_ids, pipeline_mapping, sensor_cache
            )
            total_readings += n
            print(f"  {filename}: {n} readings")

        # Step 5: Tank level
        print("\n[5] Ingesting tank level...")
        n_tank = ingest_tank_level(conn, dma_ids, sensor_cache, pipeline_mapping)
        total_readings += n_tank
        print(f"  Tank level: {n_tank} readings")

        print("\n" + "=" * 60)
        print(f"DONE. Total sensor_readings: {total_readings}")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
