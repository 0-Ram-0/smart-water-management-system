const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate, authorize, ROLES } = require('../config/auth');
const { Complaint, User, Task } = require('../models');

// Get all complaints (role-based filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, limit = 50 } = req.query;
    const where = {};

    // Citizens can only see their own complaints
    if (req.user.role === ROLES.CITIZEN) {
      where.citizenId = req.user.userId;
    }

    if (status) where.status = status;
    if (category) where.category = category;

    const complaints = await Complaint.findAll({
      where,
      include: [
        {
          model: User,
          as: 'citizen',
          attributes: ['id', 'fullName', 'phone'],
          required: false
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'assignedTo'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(complaints.map(c => ({
      id: c.id,
      complaintCode: c.complaintCode,
      category: c.category,
      title: c.title,
      description: c.description,
      location: c.location,
      latitude: c.latitude,
      longitude: c.longitude,
      status: c.status,
      priority: c.priority,
      images: c.images,
      citizenId: c.citizenId,
      citizenName: c.citizen?.fullName,
      tasks: c.tasks || [],
      createdAt: c.createdAt,
      resolvedAt: c.resolvedAt
    })));
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get complaint by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'citizen',
          attributes: ['id', 'fullName', 'phone'],
          required: false
        },
        {
          model: Task,
          as: 'tasks',
          include: [{
            model: User,
            as: 'engineer',
            attributes: ['id', 'fullName', 'employeeId'],
            required: false
          }],
          required: false
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check permissions
    if (req.user.role === ROLES.CITIZEN && complaint.citizenId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Create complaint
router.post('/', authenticate, authorize(ROLES.CITIZEN), async (req, res) => {
  try {
    const { category, title, description, location, latitude, longitude, images } = req.body;

    if (!category || !title || !description || !location) {
      return res.status(400).json({ error: 'Category, title, description, and location are required' });
    }

    const complaint = await Complaint.create({
      complaintCode: `COMP_${Date.now()}`,
      citizenId: req.user.userId,
      category,
      title,
      description,
      location,
      latitude,
      longitude,
      images: images || [],
      status: 'submitted',
      priority: 'medium'
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_complaint', {
        id: complaint.id,
        title: complaint.title,
        category: complaint.category,
        location: complaint.location,
        createdAt: complaint.createdAt
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Update complaint status (admin only)
router.patch('/:id', authenticate, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
      }
    }

    await complaint.update(updateData);
    res.json(complaint);
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

module.exports = router;
