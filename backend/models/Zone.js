const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
  zoneId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'zone_id'
  },
  zoneName: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'zone_name'
  },
  geom: {
    type: DataTypes.JSON,   // 🔥 changed from GEOMETRY to JSON
    allowNull: true,
    comment: 'Polygon coordinates stored as GeoJSON'
  }
}, {
  tableName: 'zones',
  timestamps: false,
  underscored: false
});

module.exports = Zone;
