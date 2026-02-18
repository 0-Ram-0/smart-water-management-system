const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate } = require('../config/auth');
const { DMA, Zone, Sensor, DMASchedule, User } = require('../models');

// Get all DMAs
router.get('/', authenticate, async (req, res) => {
  try {
    const dmas = await DMA.findAll({
      include: [{
        model: Zone,
        as: 'zone',
        attributes: ['zoneId', 'zoneName'],
        required: false
      }],
      order: [['dmaId', 'ASC']]
    });

    res.json(dmas.map(dma => ({
      dmaId: dma.dmaId,
      dmaName: dma.dmaName,
      zoneId: dma.zoneId,
      zoneName: dma.zone?.zoneName
    })));
  } catch (error) {
    console.error('Get DMAs error:', error);
    res.status(500).json({ error: 'Failed to fetch DMAs' });
  }
});

// Get DMA by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const dma = await DMA.findByPk(req.params.id, {
      include: [
        {
          model: Zone,
          as: 'zone',
          attributes: ['zoneId', 'zoneName'],
          required: false
        },
        {
          model: Sensor,
          as: 'sensors',
          attributes: ['sensorId', 'sensorType', 'latitude', 'longitude', 'status'],
          required: false
        }
      ]
    });

    if (!dma) {
      return res.status(404).json({ error: 'DMA not found' });
    }

    res.json({
      dmaId: dma.dmaId,
      dmaName: dma.dmaName,
      zoneId: dma.zoneId,
      zoneName: dma.zone?.zoneName,
      sensors: dma.sensors || []
    });
  } catch (error) {
    console.error('Get DMA error:', error);
    res.status(500).json({ error: 'Failed to fetch DMA' });
  }
});

// Get pipelines (placeholder - will be enhanced later)
router.get('/pipelines', authenticate, async (req, res) => {
  try {
    // For now, return empty array - pipelines will be implemented later
    res.json([]);
  } catch (error) {
    console.error('Get pipelines error:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Get DMA schedules
router.get('/:id/schedules', authenticate, async (req, res) => {
  try {
    const schedules = await DMASchedule.findAll({
      where: { dmaId: req.params.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName'],
        required: false
      }],
      order: [['scheduleDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(schedules.map(s => ({
      id: s.id,
      dmaId: s.dmaId,
      scheduleDate: s.scheduleDate,
      startTime: s.startTime,
      duration: s.duration,
      status: s.status,
      createdBy: s.createdBy,
      creatorName: s.creator?.fullName,
      notes: s.notes,
      createdAt: s.createdAt
    })));
  } catch (error) {
    console.error('Get DMA schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Create DMA schedule
router.post('/:id/schedules', authenticate, async (req, res) => {
  try {
    const { scheduleDate, startTime, duration, notes } = req.body;
    const dmaId = req.params.id;

    if (!scheduleDate || !startTime || !duration) {
      return res.status(400).json({ error: 'scheduleDate, startTime, and duration are required' });
    }

    const schedule = await DMASchedule.create({
      dmaId,
      scheduleDate,
      startTime,
      duration: parseInt(duration),
      notes,
      createdBy: req.user.userId,
      status: 'scheduled'
    });

    res.status(201).json({
      id: schedule.id,
      dmaId: schedule.dmaId,
      scheduleDate: schedule.scheduleDate,
      startTime: schedule.startTime,
      duration: schedule.duration,
      status: schedule.status
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Get active schedules (currently running)
router.get('/schedules/active', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    const schedules = await DMASchedule.findAll({
      where: {
        scheduleDate: today,
        status: { [Op.in]: ['scheduled', 'active'] }
      },
      include: [{
        model: DMA,
        as: 'dma',
        attributes: ['dmaId', 'dmaName'],
        required: true
      }],
      order: [['startTime', 'ASC']]
    });

    // Filter and calculate active schedules
    const activeSchedules = schedules
      .map(schedule => {
        const start = schedule.startTime;
        const [startHour, startMin] = start.split(':').map(Number);
        const endMin = startMin + schedule.duration;
        const endHour = startHour + Math.floor(endMin / 60);
        const finalEndMin = endMin % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(finalEndMin).padStart(2, '0')}`;
        
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMin;
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + finalEndMin;

        const isActive = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        const isUpcoming = currentMinutes < startMinutes;

        return {
          ...schedule.toJSON(),
          dmaName: schedule.dma?.dmaName,
          endTime,
          isActive,
          isUpcoming
        };
      })
      .filter(s => s.isActive || s.isUpcoming);

    res.json(activeSchedules);
  } catch (error) {
    console.error('Get active schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch active schedules' });
  }
});

// Update schedule status
router.patch('/schedules/:scheduleId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const schedule = await DMASchedule.findByPk(req.params.scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    await schedule.update({ status });
    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

module.exports = router;
