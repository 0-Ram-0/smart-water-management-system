const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate, authorize, ROLES } = require('../config/auth');
const { Task, User, Alert, Complaint } = require('../models');

// Get all tasks (with filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, assignedTo, type, limit = 50 } = req.query;
    const where = {};

    // Role-based filtering
    if (req.user.role === ROLES.ENGINEER) {
      where.assignedTo = req.user.userId;
    } else if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'engineer',
          attributes: ['id', 'fullName', 'employeeId'],
          required: false
        },
        {
          model: Alert,
          as: 'alert',
          attributes: ['id', 'type', 'severity', 'title'],
          required: false
        },
        {
          model: Complaint,
          as: 'complaint',
          attributes: ['id', 'title', 'category'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(tasks.map(t => ({
      id: t.id,
      taskCode: t.taskCode,
      title: t.title,
      description: t.description,
      type: t.type,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedTo,
      engineer: t.engineer?.fullName,
      engineerId: t.engineer?.employeeId,
      alertId: t.alertId,
      complaintId: t.complaintId,
      location: t.location,
      latitude: t.latitude,
      longitude: t.longitude,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      notes: t.notes,
      createdAt: t.createdAt
    })));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'engineer',
          attributes: ['id', 'fullName', 'employeeId', 'phone'],
          required: false
        },
        {
          model: Alert,
          as: 'alert',
          required: false
        },
        {
          model: Complaint,
          as: 'complaint',
          required: false
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === ROLES.ENGINEER && task.assignedTo !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', authenticate, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { title, description, type, priority, assignedTo, alertId, complaintId, location, latitude, longitude, dueDate } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'Title and assignedTo are required' });
    }

    const task = await Task.create({
      taskCode: `TASK_${Date.now()}`,
      title,
      description,
      type: type || 'other',
      priority: priority || 'medium',
      assignedTo,
      assignedBy: req.user.userId,
      alertId,
      complaintId,
      location,
      latitude,
      longitude,
      dueDate,
      status: 'assigned'
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_task', {
        id: task.id,
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === ROLES.ENGINEER && task.assignedTo !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    await task.update(updateData);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('task_updated', {
        id: task.id,
        status: task.status,
        updatedAt: task.updatedAt
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
