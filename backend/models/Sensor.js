const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sensor = sequelize.define('Sensor', {
  sensorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'sensor_id'
  },
  sensorType: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'sensor_type',
    comment: 'pressure, flow, level, quality, etc.'
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
  pipelineId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pipeline_id',
    references: {
      model: 'pipelines',
      key: 'pipeline_id'
    }
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  geom: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
    comment: 'PostGIS geometry for sensor location'
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'active, inactive, maintenance, faulty, etc.'
  }
}, {
  tableName: 'sensors',
  timestamps: false,
  underscored: false
});

module.exports = Sensor;
