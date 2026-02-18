const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DMA = sequelize.define('DMA', {
  dmaId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'dma_id'
  },
  dmaName: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'dma_name'
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'zone_id',
    references: {
      model: 'zones',
      key: 'zone_id'
    }
  },
  geom: {
    type: DataTypes.GEOMETRY('POLYGON', 4326),
    allowNull: true,
    comment: 'PostGIS geometry for DMA boundary'
  }
}, {
  tableName: 'dmas',
  timestamps: false,
  underscored: false
});

module.exports = DMA;
