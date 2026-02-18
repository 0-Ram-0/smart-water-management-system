const express = require('express');
const router = express.Router();
const { authenticate, authorize, ROLES } = require('../config/auth');
const { sequelize } = require('../models');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Optimized SCADA dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // 1) KPI counters and high-level aggregates (single SQL round-trip)
    const [kpiRows] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM pipelines) AS total_pipelines,
        (SELECT COUNT(*) FROM sensors) AS total_sensors,
        (SELECT COUNT(*) FROM dmas) AS total_dmas,
        (SELECT COUNT(*) FROM alerts WHERE status IN ('open','acknowledged','in_progress')) AS active_alerts,
        (SELECT COUNT(*) FROM alerts) AS total_alerts,
        (SELECT COUNT(*) FROM tanks) AS total_tanks,
        (SELECT COUNT(*) FROM sources) AS total_sources,
        COALESCE((
          SELECT AVG(sr.value)
          FROM sensor_readings sr
          JOIN sensors s ON s.sensor_id = sr.sensor_id
          WHERE s.sensor_type = 'pressure'
        ), 0) AS avg_pressure,
        COALESCE((
          SELECT AVG(sr.value)
          FROM sensor_readings sr
          JOIN sensors s ON s.sensor_id = sr.sensor_id
          WHERE s.sensor_type = 'flow'
        ), 0) AS avg_flow
    `);

    const kpis = kpiRows[0] || {
      total_pipelines: 0,
      total_sensors: 0,
      total_dmas: 0,
      total_tanks: 0,
      total_sources: 0,
      active_alerts: 0,
      total_alerts: 0,
      avg_pressure: 0,
      avg_flow: 0
    };

    // 2) Latest reading per sensor (NO per-sensor queries, safe DISTINCT ON)
    const [latestReadings] = await sequelize.query(`
      SELECT DISTINCT ON (sr.sensor_id)
        sr.sensor_id,
        s.sensor_type,
        s.dma_id,
        d.dma_name,
        sr.value,
        sr.recorded_at
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      LEFT JOIN dmas d ON d.dma_id = s.dma_id
      ORDER BY sr.sensor_id, sr.recorded_at DESC
    `);

    // 3) Time-series trends (pressure / flow / level) - aggregated
    const [pressureTrend] = await sequelize.query(`
      SELECT
        date_trunc('hour', sr.recorded_at) AS ts,
        AVG(sr.value) AS avg_value
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      WHERE s.sensor_type = 'pressure'
      GROUP BY ts
      ORDER BY ts
    `);

    const [flowTrend] = await sequelize.query(`
      SELECT
        date_trunc('hour', sr.recorded_at) AS ts,
        AVG(sr.value) AS avg_value
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      WHERE s.sensor_type = 'flow'
      GROUP BY ts
      ORDER BY ts
    `);

    const [levelTrend] = await sequelize.query(`
      SELECT
        date_trunc('hour', sr.recorded_at) AS ts,
        AVG(sr.value) AS avg_value
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      WHERE s.sensor_type = 'level'
      GROUP BY ts
      ORDER BY ts
    `);

    // 4) DMA-wise aggregates
    const [dmaPressure] = await sequelize.query(`
      SELECT
        s.dma_id,
        d.dma_name,
        AVG(sr.value) AS avg_pressure
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      LEFT JOIN dmas d ON d.dma_id = s.dma_id
      WHERE s.sensor_type = 'pressure'
      GROUP BY s.dma_id, d.dma_name
      ORDER BY d.dma_name NULLS LAST
    `);

    const [dmaFlow] = await sequelize.query(`
      SELECT
        s.dma_id,
        d.dma_name,
        AVG(sr.value) AS avg_flow
      FROM sensor_readings sr
      JOIN sensors s ON s.sensor_id = sr.sensor_id
      LEFT JOIN dmas d ON d.dma_id = s.dma_id
      WHERE s.sensor_type = 'flow'
      GROUP BY s.dma_id, d.dma_name
      ORDER BY d.dma_name NULLS LAST
    `);

    // 5) Latest 10 alerts with sensor + DMA info
    const [activeAlerts] = await sequelize.query(`
      SELECT
        a.id,
        a.type,
        a.severity,
        a.title,
        a.status,
        a.location,
        a."createdAt" AS "createdAt",
        a.sensor_id AS "sensorId",
        a.dma_id AS "dmaId",
        s.sensor_type AS "sensorType",
        d.dma_name AS "dmaName"
      FROM alerts a
      LEFT JOIN sensors s ON s.sensor_id = a.sensor_id
      LEFT JOIN dmas d ON d.dma_id = a.dma_id
      ORDER BY a."createdAt" DESC
      LIMIT 10
    `);

    res.json({
      kpis: {
        pipelines: Number(kpis.total_pipelines || 0),
        sensors: Number(kpis.total_sensors || 0),
        dmas: Number(kpis.total_dmas || 0),
        tanks: Number(kpis.total_tanks || 0),
        sources: Number(kpis.total_sources || 0),
        alerts: {
          total: Number(kpis.total_alerts || 0),
          active: Number(kpis.active_alerts || 0)
        },
        avgPressure: Number(kpis.avg_pressure || 0),
        avgFlow: Number(kpis.avg_flow || 0)
      },
      latestReadings,
      trends: {
        pressure: pressureTrend,
        flow: flowTrend,
        level: levelTrend
      },
      dmaStats: {
        pressureByDma: dmaPressure,
        flowByDma: dmaFlow
      },
      activeAlerts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
