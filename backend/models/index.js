const sequelize = require('../config/database');
const User = require('./User');
const Zone = require('./Zone');
const Pipeline = require('./Pipeline');
const Sensor = require('./Sensor');
const SensorReading = require('./SensorReading');
const DMA = require('./DMA');
const Alert = require('./Alert');
const Task = require('./Task');
const Complaint = require('./Complaint');
const Bill = require('./Bill');
const Payment = require('./Payment');
const DMASchedule = require('./DMASchedule');

// Define associations
// User associations
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'tasks' });
User.hasMany(Complaint, { foreignKey: 'citizenId', as: 'complaints' });
User.hasMany(Bill, { foreignKey: 'citizenId', as: 'bills' });

// Zone associations
Zone.hasMany(DMA, { foreignKey: 'zoneId', sourceKey: 'zoneId', as: 'dmas' });

// DMA associations
DMA.belongsTo(Zone, { foreignKey: 'zoneId', targetKey: 'zoneId', as: 'zone' });
DMA.hasMany(Sensor, { foreignKey: 'dmaId', sourceKey: 'dmaId', as: 'sensors' });
DMA.hasMany(Alert, { foreignKey: 'dmaId', sourceKey: 'dmaId', as: 'alerts' });
DMA.hasMany(DMASchedule, { foreignKey: 'dmaId', sourceKey: 'dmaId', as: 'schedules' });

// Pipeline associations
Pipeline.hasMany(Sensor, { foreignKey: 'pipelineId', sourceKey: 'pipelineId', as: 'sensors' });

// Sensor associations
Sensor.belongsTo(DMA, { foreignKey: 'dmaId', targetKey: 'dmaId', as: 'dma' });
Sensor.belongsTo(Pipeline, { foreignKey: 'pipelineId', targetKey: 'pipelineId', as: 'pipeline' });
Sensor.hasMany(SensorReading, { foreignKey: 'sensorId', sourceKey: 'sensorId', as: 'readings' });
SensorReading.belongsTo(Sensor, { foreignKey: 'sensorId', targetKey: 'sensorId', as: 'sensor' });

// Alert associations
Alert.belongsTo(Sensor, { foreignKey: 'sensorId', targetKey: 'sensorId', as: 'sensor' });
Alert.belongsTo(DMA, { foreignKey: 'dmaId', targetKey: 'dmaId', as: 'dma' });
Alert.belongsTo(User, { foreignKey: 'acknowledgedBy', targetKey: 'id', as: 'acknowledgedByUser' });

// Task associations
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'engineer' });
Task.belongsTo(Alert, { foreignKey: 'alertId', as: 'alert' });
Task.belongsTo(Complaint, { foreignKey: 'complaintId', as: 'complaint' });

// Complaint associations
Complaint.belongsTo(User, { foreignKey: 'citizenId', as: 'citizen' });
Complaint.hasMany(Task, { foreignKey: 'complaintId', as: 'tasks' });

// Bill associations
Bill.belongsTo(User, { foreignKey: 'citizenId', as: 'citizen' });
Bill.hasMany(Payment, { foreignKey: 'billId', as: 'payments' });

// Payment associations
Payment.belongsTo(Bill, { foreignKey: 'billId', as: 'bill' });

// DMA Schedule associations
DMASchedule.belongsTo(DMA, { foreignKey: 'dmaId', targetKey: 'dmaId', as: 'dma' });
DMASchedule.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Zone,
  Pipeline,
  Sensor,
  SensorReading,
  DMA,
  Alert,
  Task,
  Complaint,
  Bill,
  Payment,
  DMASchedule
};
