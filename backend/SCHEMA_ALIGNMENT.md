# Database Schema Alignment

## Overview

Your database schema has been manually created using SQL with PostGIS support. The Sequelize models have been updated to match your existing schema structure.

## Existing Tables (Created via SQL)

### ✅ Zones
- `zone_id` (SERIAL PRIMARY KEY)
- `zone_name` (TEXT)
- `geom` (GEOMETRY(POLYGON, 4326))

### ✅ DMAs
- `dma_id` (SERIAL PRIMARY KEY)
- `dma_name` (TEXT)
- `zone_id` (INT, REFERENCES zones)
- `geom` (GEOMETRY(POLYGON, 4326))

### ✅ Pipelines
- `pipeline_id` (SERIAL PRIMARY KEY)
- `pipeline_type` (TEXT) - main / distribution
- `material` (TEXT)
- `diameter_mm` (INT)
- `geom` (GEOMETRY(LINESTRING, 4326))

### ✅ Sensors
- `sensor_id` (SERIAL PRIMARY KEY)
- `sensor_type` (TEXT)
- `dma_id` (INT, REFERENCES dmas)
- `pipeline_id` (INT, REFERENCES pipelines)
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `geom` (GEOMETRY(POINT, 4326))
- `status` (TEXT)

### ✅ Sensor Readings
- `reading_id` (BIGSERIAL PRIMARY KEY)
- `sensor_id` (INT, REFERENCES sensors)
- `value` (DOUBLE PRECISION)
- `recorded_at` (TIMESTAMP DEFAULT now())

## Models Updated

All Sequelize models have been updated to match your schema:
- ✅ `Zone` model - matches `zones` table
- ✅ `Pipeline` model - matches `pipelines` table
- ✅ `DMA` model - matches `dmas` table (uses `dma_id`, `dma_name`, `zone_id`)
- ✅ `Sensor` model - matches `sensors` table (uses `sensor_id`, `sensor_type`)
- ✅ `SensorReading` model - matches `sensor_readings` table (uses `reading_id`, `recorded_at`)

## Tables Still Needed (Will be created by Sequelize)

These tables don't exist yet and will be created when you run `npm run db:init`:

### Users Table
- For authentication and user management
- Required for: Admin, Engineer, Citizen roles

### Alerts Table
- For system alerts (leak, low pressure, etc.)
- Links to sensors and DMAs

### Tasks Table
- For engineer task assignment
- Links to alerts and complaints

### Complaints Table
- For citizen complaints
- Links to users (citizens)

### Bills Table
- For water billing
- Links to users (citizens)

### Payments Table
- For payment records
- Links to bills

## Testing the Connection

Run this command to test if models can access your existing tables:

```bash
npm run db:test
```

This will:
- Test database connection
- Count records in existing tables
- Display sample data
- Verify all models are properly configured

## Next Steps

1. **Test the connection:**
   ```bash
   npm run db:test
   ```

2. **Create remaining tables (if needed):**
   ```bash
   npm run db:init
   ```
   Note: This will only create tables that don't exist. Your existing tables won't be modified.

3. **Seed initial data:**
   ```bash
   npm run db:seed
   ```
   This creates the default admin user.

## Important Notes

- ✅ Your existing tables (`zones`, `dmas`, `pipelines`, `sensors`, `sensor_readings`) are preserved
- ✅ Models use `field` mapping to match your snake_case column names
- ✅ PostGIS geometry fields are properly configured
- ✅ Foreign key relationships are correctly mapped
- ⚠️ The `db:init` script will NOT drop or modify your existing tables (force: false)

## Model Field Mappings

| Sequelize Model Field | Database Column | Notes |
|----------------------|----------------|-------|
| `zoneId` | `zone_id` | Primary key |
| `dmaId` | `dma_id` | Primary key |
| `dmaName` | `dma_name` | Text field |
| `sensorId` | `sensor_id` | Primary key |
| `sensorType` | `sensor_type` | Text field |
| `pipelineId` | `pipeline_id` | Primary key |
| `readingId` | `reading_id` | Primary key (BIGINT) |
| `recordedAt` | `recorded_at` | Timestamp |

All models use `field` mapping to ensure Sequelize camelCase works with your snake_case database columns.
