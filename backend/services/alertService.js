const { Alert, Sensor, SensorReading, DMA } = require('../models');
const { Op } = require('sequelize');

/**
 * Alert generation service
 * Rule-based alert logic based on sensor readings
 */
class AlertService {
  constructor(io) {
    this.io = io;
  }

  // Thresholds for different sensor types
  thresholds = {
    pressure: {
      low: 30, // PSI
      high: 80, // PSI
      critical_low: 20,
      critical_high: 100
    },
    flow: {
      low: 500, // L/min
      high: 3000, // L/min
      critical_low: 200,
      critical_high: 4000
    },
    level: {
      low: 5, // meters
      high: 12, // meters
      critical_low: 3,
      critical_high: 15
    }
  };

  /**
   * Check sensor reading and generate alert if threshold exceeded
   */
  async checkSensorReading(sensor, reading) {
    if (!sensor.sensorType || !reading.value) return null;

    const thresholds = this.thresholds[sensor.sensorType];
    if (!thresholds) return null;

    let alertType = null;
    let severity = 'medium';
    let title = '';

    // Check thresholds
    if (reading.value < thresholds.critical_low) {
      alertType = sensor.sensorType === 'pressure' ? 'low_pressure' : 'sensor_failure';
      severity = 'critical';
      title = `CRITICAL: ${sensor.sensorType.toUpperCase()} sensor ${sensor.sensorId} reading extremely low (${reading.value.toFixed(2)})`;
    } else if (reading.value < thresholds.low) {
      alertType = sensor.sensorType === 'pressure' ? 'low_pressure' : 'sensor_failure';
      severity = 'high';
      title = `HIGH: ${sensor.sensorType.toUpperCase()} sensor ${sensor.sensorId} reading low (${reading.value.toFixed(2)})`;
    } else if (reading.value > thresholds.critical_high) {
      alertType = sensor.sensorType === 'pressure' ? 'high_pressure' : 'sensor_failure';
      severity = 'critical';
      title = `CRITICAL: ${sensor.sensorType.toUpperCase()} sensor ${sensor.sensorId} reading extremely high (${reading.value.toFixed(2)})`;
    } else if (reading.value > thresholds.high) {
      alertType = sensor.sensorType === 'pressure' ? 'high_pressure' : 'sensor_failure';
      severity = 'high';
      title = `HIGH: ${sensor.sensorType.toUpperCase()} sensor ${sensor.sensorId} reading high (${reading.value.toFixed(2)})`;
    }

    if (!alertType) return null;

    // Check if similar alert already exists (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingAlert = await Alert.findOne({
      where: {
        sensorId: sensor.sensorId,
        type: alertType,
        status: { [Op.in]: ['open', 'acknowledged'] },
        createdAt: { [Op.gte]: oneHourAgo }
      }
    });

    if (existingAlert) {
      // Update existing alert instead of creating duplicate
      return existingAlert;
    }

    // Create new alert
    const alert = await Alert.create({
      type: alertType,
      severity: severity,
      sensorId: sensor.sensorId,
      dmaId: sensor.dmaId,
      title: title,
      description: `${sensor.sensorType} sensor reading: ${reading.value.toFixed(2)}`,
      location: sensor.dmaId ? `DMA ${sensor.dmaId}` : 'Unknown',
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      status: 'open'
    });

    // Emit WebSocket event
    if (this.io) {
      this.io.emit('new_alert', {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        sensorId: alert.sensorId,
        dmaId: alert.dmaId,
        createdAt: alert.createdAt
      });
    }

    return alert;
  }

  /**
   * Check all sensors for alerts
   */
  async checkAllSensors() {
    try {
      const sensors = await Sensor.findAll({
        where: { status: 'active' },
        include: [{
          model: SensorReading,
          as: 'readings',
          limit: 1,
          order: [['recordedAt', 'DESC']],
          required: false
        }]
      });

      const alerts = [];
      for (const sensor of sensors) {
        if (sensor.readings && sensor.readings.length > 0) {
          const latestReading = sensor.readings[0];
          const alert = await this.checkSensorReading(sensor, latestReading);
          if (alert) alerts.push(alert);
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking sensors:', error);
      return [];
    }
  }
}

module.exports = AlertService;
