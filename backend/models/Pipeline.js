const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pipeline = sequelize.define('Pipeline', {
  pipelineId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'pipeline_id'
  },
  pipelineType: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'pipeline_type',
    comment: 'main / distribution'
  },
  material: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diameterMm: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'diameter_mm'
  },
  geom: {
  type: DataTypes.JSON,
  allowNull: true,
  comment: 'Pipeline coordinates stored as GeoJSON'
}

}, {
  tableName: 'pipelines',
  timestamps: false,
  underscored: false
});

module.exports = Pipeline;
