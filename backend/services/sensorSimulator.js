const { Sensor, SensorReading } = require('../models');
const AlertService = require('./alertService');

/**
 * Sensor Data Simulator Service
 * Generates realistic sensor readings and triggers alerts
 */
class SensorSimulator {
  constructor(io, alertService) {
    this.io = io;
    this.alertService = alertService;
    this.interval = null;
    this.isRunning = false;
  }

  // Base values for different sensor types
  baseValues = {
    pressure: 45, // PSI
    flow: 1200, // L/min
    level: 8.5 // meters
  };

  // Variation ranges
  variations = {
    pressure: 10,
    flow: 300,
    level: 2
  };

  /**
   * Generate a realistic sensor reading
   */
  generateReading(sensor) {
    const base = this.baseValues[sensor.sensorType] || 50;
    const variation = this.variations[sensor.sensorType] || 10;

    // Add some randomness with slight drift
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const value = base + (randomFactor * variation);

    // Ensure value is positive
    return Math.max(0, value);
  }

  /**
   * Simulate sensor reading for a single sensor
   */
  async simulateSensorReading(sensor) {
    try {
      const value = this.generateReading(sensor);

      // Create reading
      const reading = await SensorReading.create({
        sensorId: sensor.sensorId,
        value: value,
        recordedAt: new Date()
      });

      // Check for alerts
      if (this.alertService) {
        await this.alertService.checkSensorReading(sensor, reading);
      }

      // Emit WebSocket update
      if (this.io) {
        this.io.emit('sensor_reading', {
          sensorId: sensor.sensorId,
          sensorType: sensor.sensorType,
          value: value,
          recordedAt: reading.recordedAt
        });
      }

      return reading;
    } catch (error) {
      console.error(`Error simulating reading for sensor ${sensor.sensorId}:`, error);
      return null;
    }
  }

  /**
   * Simulate readings for all active sensors
   */
  async simulateAllSensors() {
    try {
      const sensors = await Sensor.findAll({
        where: { status: 'active' }
      });

      const readings = [];
      for (const sensor of sensors) {
        const reading = await this.simulateSensorReading(sensor);
        if (reading) readings.push(reading);
      }

      console.log(`✅ Simulated ${readings.length} sensor readings`);
      return readings;
    } catch (error) {
      console.error('Error simulating sensors:', error);
      return [];
    }
  }

  /**
   * Start the simulation service
   * @param {number} intervalMinutes - Interval between readings in minutes (default: 5)
   */
  start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('⚠️  Sensor simulator already running');
      return;
    }

    this.isRunning = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Run immediately
    this.simulateAllSensors();

    // Then run at intervals
    this.interval = setInterval(() => {
      this.simulateAllSensors();
    }, intervalMs);

    console.log(`🚀 Sensor simulator started (interval: ${intervalMinutes} minutes)`);
  }

  /**
   * Stop the simulation service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Sensor simulator stopped');
  }

  /**
   * Get simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.interval ? 'active' : 'inactive'
    };
  }
}

module.exports = SensorSimulator;
