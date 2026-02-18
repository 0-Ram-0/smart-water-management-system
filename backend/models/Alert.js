const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('leak', 'low_pressure', 'high_pressure', 'sensor_failure', 'quality_issue', 'other'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  sensorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sensor_id',
    references: {
      model: 'sensors',
      key: 'sensor_id'
    }
  },
  dmaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'dma_id',
    references: {
      model: 'dmas',
      key: 'dma_id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'acknowledged', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  acknowledgedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'alerts',
  timestamps: true
});

module.exports = Alert;
