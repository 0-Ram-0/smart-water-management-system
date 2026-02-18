const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorReading = sequelize.define('SensorReading', {
  readingId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'reading_id'
  },
  sensorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sensor_id',
    references: {
      model: 'sensors',
      key: 'sensor_id'
    }
  },
  value: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Sensor reading value'
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'recorded_at'
  }
}, {
  tableName: 'sensor_readings',
  timestamps: false,
  underscored: false,
  indexes: [
    {
      fields: ['sensor_id', 'recorded_at'],
      name: 'sensor_recorded_at_idx'
    },
    {
      fields: ['recorded_at'],
      name: 'recorded_at_idx'
    }
  ]
});

module.exports = SensorReading;
