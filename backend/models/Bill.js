const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Bill identifier (e.g., BILL_2024_001)'
  },
  citizenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  connectionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Water connection identifier'
  },
  billingPeriod: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Billing period (e.g., "2024-01")'
  },
  previousReading: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currentReading: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  unitsConsumed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  baseCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  consumptionCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'bills',
  timestamps: true
});

module.exports = Bill;
