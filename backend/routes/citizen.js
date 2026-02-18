const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate, authorize, ROLES } = require('../config/auth');
const { Complaint, Bill, DMASchedule, DMA } = require('../models');

// All citizen routes require authentication and citizen role
router.use(authenticate);
router.use(authorize(ROLES.CITIZEN));

// Dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's complaints
    const complaints = await Complaint.count({
      where: { citizenId: userId }
    });
    const openComplaints = await Complaint.count({
      where: {
        citizenId: userId,
        status: { [Op.in]: ['submitted', 'acknowledged', 'in_progress'] }
      }
    });

    // Get user's bills
    const bills = await Bill.count({
      where: { citizenId: userId }
    });
    const pendingBills = await Bill.count({
      where: {
        citizenId: userId,
        status: { [Op.in]: ['pending', 'overdue'] }
      }
    });

    // Get active water supply schedules (for user's area - simplified)
    const today = new Date().toISOString().split('T')[0];
    const activeSchedules = await DMASchedule.findAll({
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
      limit: 5
    });

    res.json({
      complaints: { total: complaints, open: openComplaints },
      bills: { total: bills, pending: pendingBills },
      activeSchedules: activeSchedules.map(s => ({
        dmaName: s.dma?.dmaName,
        startTime: s.startTime,
        duration: s.duration
      }))
    });
  } catch (error) {
    console.error('Citizen dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get water supply schedule
router.get('/water-supply', async (req, res) => {
  try {
    const { date } = req.query;
    const scheduleDate = date || new Date().toISOString().split('T')[0];

    const schedules = await DMASchedule.findAll({
      where: {
        scheduleDate,
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

    res.json(schedules.map(s => ({
      id: s.id,
      dmaName: s.dma?.dmaName,
      scheduleDate: s.scheduleDate,
      startTime: s.startTime,
      duration: s.duration,
      status: s.status
    })));
  } catch (error) {
    console.error('Get water supply schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

module.exports = router;
