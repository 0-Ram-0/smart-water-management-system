const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate } = require('../config/auth');
const { Sensor, SensorReading, DMA, sequelize } = require('../models');

// Get all sensors
router.get('/', authenticate, async (req, res) => {
  try {
    const sensors = await Sensor.findAll({
      include: [{
        model: DMA,
        as: 'dma',
        attributes: ['dmaId', 'dmaName'],
        required: false
      }],
      order: [['sensorId', 'ASC']]
    });

    res.json(sensors.map(s => ({
      sensorId: s.sensorId,
      sensorType: s.sensorType,
      dmaId: s.dmaId,
      dmaName: s.dma?.dmaName,
      latitude: s.latitude,
      longitude: s.longitude,
      status: s.status || 'active'
    })));
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Get latest reading for all sensors (optimized, no per-sensor queries)
router.get('/latest-all', authenticate, async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT DISTINCT ON (sensor_id)
        sensor_id,
        value,
        recorded_at
      FROM sensor_readings
      ORDER BY sensor_id, recorded_at DESC
    `);

    const result = rows.map(row => ({
      sensorId: row.sensor_id,
      value: Number(row.value),
      recordedAt: row.recorded_at
    }));

    res.json(result);
  } catch (error) {
    console.error('Get latest-all sensor readings error:', error);
    res.status(500).json({ error: 'Failed to fetch latest readings for all sensors' });
  }
});

// Get sensor by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id, {
      include: [{
        model: DMA,
        as: 'dma',
        attributes: ['dmaId', 'dmaName'],
        required: false
      }]
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json({
      sensorId: sensor.sensorId,
      sensorType: sensor.sensorType,
      dmaId: sensor.dmaId,
      dmaName: sensor.dma?.dmaName,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      status: sensor.status || 'active'
    });
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor' });
  }
});

// Get sensor readings
router.get('/:id/readings', authenticate, async (req, res) => {
  try {
    const { limit = 100, startDate, endDate } = req.query;
    
    const where = { sensorId: req.params.id };
    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt[Op.gte] = new Date(startDate);
      if (endDate) where.recordedAt[Op.lte] = new Date(endDate);
    }

    const readings = await SensorReading.findAll({
      where,
      order: [['recordedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(readings.map(r => ({
      readingId: r.readingId,
      sensorId: r.sensorId,
      value: r.value,
      recordedAt: r.recordedAt
    })));
  } catch (error) {
    console.error('Get sensor readings error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get latest reading for a sensor
router.get('/:id/latest', authenticate, async (req, res) => {
  try {
    const reading = await SensorReading.findOne({
      where: { sensorId: req.params.id },
      order: [['recordedAt', 'DESC']]
    });

    if (!reading) {
      return res.status(404).json({ error: 'No readings found for this sensor' });
    }

    res.json({
      readingId: reading.readingId,
      sensorId: reading.sensorId,
      value: reading.value,
      recordedAt: reading.recordedAt
    });
  } catch (error) {
    console.error('Get latest reading error:', error);
    res.status(500).json({ error: 'Failed to fetch latest reading' });
  }
});

module.exports = router;
