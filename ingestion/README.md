# CTOWN_1GB_24H Parquet Ingestion

Ingests CTOWN water network parquet data into the Smart Water Management PostgreSQL database.

## Prerequisites

1. **Python 3.8+** with pip
2. **PostgreSQL 18** with PostGIS enabled
3. **Database** `smart_water_management` with tables: `zones`, `dmas`, `pipelines`, `sensors`, `sensor_readings`
4. **CTOWN_1GB_24H** folder in project root (already present)

## Installation

```bash
cd ingestion
pip install -r requirements.txt
```

## Database Setup

Ensure you have zones and DMAs before running:

```sql
-- Example: Create a zone and DMA if empty
INSERT INTO zones (zone_name, geom)
SELECT 'Solapur Central', ST_SetSRID(ST_MakePoint(75.9064, 17.6599), 4326)
WHERE NOT EXISTS (SELECT 1 FROM zones LIMIT 1);

INSERT INTO dmas (dma_name, zone_id, geom)
SELECT 'DMA Central', z.zone_id, ST_Buffer(z.geom::geography, 5000)::geometry
FROM zones z LIMIT 1
WHERE NOT EXISTS (SELECT 1 FROM dmas LIMIT 1);
```

## Configuration

Set database credentials via environment variables (or create `backend/.env`):

```bash
DB_HOST=localhost
DB_PORT=5433
DB_NAME=smart_water_management
DB_USER=postgres
DB_PASSWORD=your_password
```

## Running the Script

```bash
# From project root
python ingestion/ctown_parquet_ingestion.py

# Or from ingestion folder
cd ingestion
python ctown_parquet_ingestion.py
```

## Safe Run Checklist

1. **Backup** your database before first run
2. **Verify** zones and DMAs exist
3. **Test** with a small subset first (optional: set `SCENARIO_ID` and limit files)
4. **Re-run** is safe: duplicate prevention via unique constraint `(sensor_id, recorded_at)`

## What the Script Does

1. **Scans** CTOWN_1GB_24H for parquet files
2. **Maps** each file to sensor type: pressure, flow, demand, level, head
3. **Creates pipelines** from `pipe_length` and `pipe_diameter` (static)
4. **Creates sensors** for each entity (J*, P*, T*) if not exists
5. **Inserts readings** into `sensor_readings` with timestamps (24-hour cycle, scenario 0)
6. **Uses PostGIS** for synthetic geometry around Solapur (17.6599, 75.9064)

## Schema Compatibility

The script auto-detects pipeline table columns. Supported:

- `pipelines`: `pipeline_id`, `dma_id`, `geom`, `length`, `diameter` or `diameter_mm`
- `sensors`: `sensor_id`, `sensor_type`, `dma_id`, `pipeline_id`, `latitude`, `longitude`, `geom`, `status`
- `sensor_readings`: `reading_id`, `sensor_id`, `value`, `recorded_at`

## Duplicate Prevention

- **Sensors**: Uses `status = 'ctown_{entity}_{type}'` as logical key; re-run reuses existing sensors
- **Readings**: Requires unique index on `(sensor_id, recorded_at)`. Script creates it if missing.

## Troubleshooting

| Error | Solution |
|-------|----------|
| No DMAs found | Create zones and DMAs first |
| Connection refused | Check DB_HOST, DB_PORT, PostgreSQL running |
| Column does not exist | Verify pipeline/sensor table schema |
| Unique constraint violation | Readings already exist; safe to ignore (ON CONFLICT DO NOTHING) |
