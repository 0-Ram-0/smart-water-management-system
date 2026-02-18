const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate, authorize, ROLES } = require('../config/auth');
const { User, Task, Alert } = require('../models');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Get all engineers
router.get('/', async (req, res) => {
  try {
    const engineers = await User.findAll({
      where: { role: ROLES.ENGINEER },
      attributes: ['id', 'username', 'fullName', 'email', 'phone', 'employeeId', 'isActive'],
      include: [{
        model: Task,
        as: 'tasks',
        attributes: ['id', 'status', 'priority'],
        required: false
      }]
    });

    const engineersWithStats = engineers.map(engineer => {
      const tasks = engineer.tasks || [];
      const activeTasks = tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      return {
        id: engineer.id,
        username: engineer.username,
        fullName: engineer.fullName,
        email: engineer.email,
        phone: engineer.phone,
        employeeId: engineer.employeeId,
        isActive: engineer.isActive,
        stats: {
          totalTasks: tasks.length,
          activeTasks,
          completedTasks
        },
        availability: engineer.isActive ? 'available' : 'unavailable'
      };
    });

    res.json(engineersWithStats);
  } catch (error) {
    console.error('Get engineers error:', error);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
});

// Get engineer by ID
router.get('/:id', async (req, res) => {
  try {
    const engineer = await User.findOne({
      where: { id: req.params.id, role: ROLES.ENGINEER },
      attributes: ['id', 'username', 'fullName', 'email', 'phone', 'employeeId', 'isActive', 'address'],
      include: [{
        model: Task,
        as: 'tasks',
        include: [{
          model: Alert,
          as: 'alert',
          attributes: ['id', 'type', 'severity', 'title'],
          required: false
        }],
        required: false
      }]
    });

    if (!engineer || engineer.role !== ROLES.ENGINEER) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    res.json(engineer);
  } catch (error) {
    console.error('Get engineer error:', error);
    res.status(500).json({ error: 'Failed to fetch engineer' });
  }
});

// Update engineer availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { isActive } = req.body;
    const engineer = await User.findByPk(req.params.id);

    if (!engineer || engineer.role !== ROLES.ENGINEER) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    await engineer.update({ isActive: isActive !== undefined ? isActive : true });
    res.json({ id: engineer.id, isActive: engineer.isActive, availability: engineer.isActive ? 'available' : 'unavailable' });
  } catch (error) {
    console.error('Update engineer availability error:', error);
    res.status(500).json({ error: 'Failed to update engineer availability' });
  }
});

module.exports = router;
