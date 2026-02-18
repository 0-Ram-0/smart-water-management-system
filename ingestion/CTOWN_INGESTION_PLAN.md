# CTOWN_1GB_24H Parquet Ingestion Plan

## Overview

This document describes the plan for ingesting CTOWN (EPANET-style water network) parquet data into the Smart Water Management System PostgreSQL database.

## Dataset Structure

**Location:** `CTOWN_1GB_24H/` (28 parquet files)

### File Categories

| Category | Files | Entity Type | Columns | Description |
|----------|-------|-------------|---------|-------------|
| **a) Pressure** | `node_pressure-0-dynamic_output.parquet` | Junctions (J*) | J1, J2, J511... | Pressure at nodes (m) |
| **b) Flow** | `link_flowrate-0-dynamic_output.parquet` | Pipes (P*) | P1, P2, P10... | Flow rate in pipes (L/s) |
| **c) Demand** | `node_demand-0-dynamic_output.parquet`, `junction_base_demand-0-dynamic_input.parquet` | Junctions (J*) | J1, J2... | Demand at junctions |
| **d) Level** | `tank_init_level-0-static_input.parquet` | Tanks (T*) | T1, T2, T3... | Tank water level (m) - static |
| **e) Head** | `node_head-0-dynamic_output.parquet` | Junctions (J*) | J1, J2... | Hydraulic head at nodes (m) |

### Additional Dynamic Outputs (optional)

- `link_friction_factor-0-dynamic_output.parquet` - Friction factor (P*)
- `link_headloss-0-dynamic_output.parquet` - Head loss (P*)
- `link_velocity-0-dynamic_output.parquet` - Velocity (P*)

### Static Pipeline Data

- `pipe_length-0-static_input.parquet` - Pipe lengths (m)
- `pipe_diameter-0-static_input.parquet` - Pipe diameters (mm)

## Mapping to Database Tables

| CTOWN Data | Target Table | Action |
|------------|--------------|--------|
| pipe_length, pipe_diameter | pipelines | Create pipelines for each P* |
| node_pressure, node_demand, node_head | sensor_readings | Create pressure/demand/head sensors per J* |
| link_flowrate | sensor_readings | Create flow sensors per P* (linked to pipeline) |
| tank_init_level | sensor_readings | Create level sensors per T* |

## Key Design Decisions

1. **Scenario:** Use `scenario_id=0` only (24-hour cycle) to avoid massive duplication
2. **Timestamp:** `time_id` 0-23 maps to hourly timestamps (base date + hour)
3. **Base Date:** Configurable (default: 2026-01-30 for Solapur dummy data)
4. **DMA Assignment:** Fetch DMAs from DB; distribute entities round-robin
5. **Geometry:** Synthetic PostGIS points/lines around Solapur center (17.6599, 75.9064)
6. **Chunking:** Read parquet in chunks; batch INSERT (10,000 rows per batch)
7. **Duplicates:** Use `ON CONFLICT DO NOTHING` or `(sensor_id, recorded_at)` uniqueness

## Data Volume (scenario_id=0)

- **Pipelines:** ~429 pipes
- **Junctions:** ~396 junctions
- **Tanks:** 7 tanks
- **Readings per sensor:** 24 (hourly)
- **Total readings:** ~(396*3 + 429 + 7)*24 ≈ 35,000+ rows
