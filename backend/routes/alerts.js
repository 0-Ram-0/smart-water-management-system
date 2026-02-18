const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate } = require('../config/auth');
const { Alert, Sensor, SensorReading, DMA, User } = require('../models');

// Get all alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, severity, type, limit = 50 } = req.query;
    
    const where = {};
    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
      where.status = statusList.length > 1 ? { [Op.in]: statusList } : statusList[0];
    }
    if (severity) {
      const severityList = severity.split(',').map(s => s.trim()).filter(Boolean);
      where.severity = severityList.length > 1 ? { [Op.in]: severityList } : severityList[0];
    }
    if (type) {
      const typeList = type.split(',').map(t => t.trim()).filter(Boolean);
      where.type = typeList.length > 1 ? { [Op.in]: typeList } : typeList[0];
    }

    const alerts = await Alert.findAll({
      where,
      include: [
        {
          model: Sensor,
          as: 'sensor',
          attributes: ['sensorId', 'sensorType'],
          required: false
        },
        {
          model: DMA,
          as: 'dma',
          attributes: ['dmaId', 'dmaName'],
          required: false
        },
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'fullName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(alerts.map(a => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      title: a.title,
      description: a.description,
      location: a.location,
      latitude: a.latitude,
      longitude: a.longitude,
      status: a.status,
      sensorId: a.sensorId,
      sensorType: a.sensor?.sensorType,
      dmaId: a.dmaId,
      dmaName: a.dma?.dmaName,
      acknowledgedBy: a.acknowledgedByUser?.fullName,
      acknowledgedAt: a.acknowledgedAt,
      resolvedAt: a.resolvedAt,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    })));
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [
        {
          model: Sensor,
          as: 'sensor',
          attributes: ['sensorId', 'sensorType'],
          required: false
        },
        {
          model: DMA,
          as: 'dma',
          attributes: ['dmaId', 'dmaName'],
          required: false
        }
      ]
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      location: alert.location,
      latitude: alert.latitude,
      longitude: alert.longitude,
      status: alert.status,
      sensorId: alert.sensorId,
      dmaId: alert.dmaId,
      createdAt: alert.createdAt
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Update alert status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, acknowledgedBy } = req.body;
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'acknowledged' && acknowledgedBy) {
        updateData.acknowledgedBy = acknowledgedBy;
        updateData.acknowledgedAt = new Date();
      }
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
    }

    await alert.update(updateData);
    
    // Emit WebSocket update
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_updated', {
        id: alert.id,
        status: alert.status,
        updatedAt: alert.updatedAt
      });
    }

    res.json(alert);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Create alert manually
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, severity, sensorId, dmaId, title, description, location, latitude, longitude } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }

    const alert = await Alert.create({
      type,
      severity: severity || 'medium',
      sensorId,
      dmaId,
      title,
      description,
      location,
      latitude,
      longitude,
      status: 'open'
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_alert', {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        sensorId: alert.sensorId,
        dmaId: alert.dmaId,
        createdAt: alert.createdAt
      });
    }

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Assign alert to engineer (creates task)
router.post('/:id/assign', authenticate, async (req, res) => {
  try {
    const { engineerId } = req.body;
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Update alert status
    await alert.update({
      status: 'acknowledged',
      acknowledgedBy: req.user.userId
    });

    // Create task (will be implemented in task routes)
    const { Task } = require('../models');
    const task = await Task.create({
      taskCode: `TASK_${Date.now()}`,
      title: `Resolve: ${alert.title}`,
      description: alert.description,
      type: 'repair',
      priority: alert.severity === 'critical' ? 'urgent' : alert.severity,
      assignedTo: engineerId,
      assignedBy: req.user.userId,
      alertId: alert.id,
      location: alert.location,
      latitude: alert.latitude,
      longitude: alert.longitude,
      status: 'assigned'
    });

    // Emit WebSocket update
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_assigned', {
        alertId: alert.id,
        taskId: task.id,
        engineerId
      });
    }

    res.json({ alert, task });
  } catch (error) {
    console.error('Assign alert error:', error);
    res.status(500).json({ error: 'Failed to assign alert' });
  }
});

module.exports = router;
