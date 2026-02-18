const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DMASchedule = sequelize.define('DMASchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dmaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'dma_id',
    references: {
      model: 'dmas',
      key: 'dma_id'
    }
  },
  scheduleDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'schedule_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
    comment: 'Schedule status'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dma_schedules',
  timestamps: true,
  underscored: false
});

module.exports = DMASchedule;
