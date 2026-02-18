const models = require('../models');
const { Op } = require('sequelize');

/**
 * Seed demo data for sensors and sensor readings
 * Creates sample sensors and initial readings for dashboard display
 */
async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo sensor data...');

    const { Sensor, SensorReading, DMA } = models;

    // Get existing DMAs
    const dmas = await DMA.findAll({ limit: 4 });
    if (dmas.length === 0) {
      console.log('⚠️  No DMAs found. Please create DMAs first.');
      process.exit(1);
    }

    // Create sample sensors
    const sensorTypes = ['pressure', 'flow', 'level'];
    const sensors = [];

    for (let i = 0; i < 15; i++) {
      const dma = dmas[i % dmas.length];
      const sensorType = sensorTypes[i % sensorTypes.length];
      
      // Solapur coordinates with slight variations
      const baseLat = 17.6599;
      const baseLng = 75.9064;
      const lat = baseLat + (Math.random() - 0.5) * 0.1;
      const lng = baseLng + (Math.random() - 0.5) * 0.1;

      const sensor = await Sensor.create({
        sensorType: sensorType,
        dmaId: dma.dmaId,
        latitude: lat,
        longitude: lng,
        status: 'active'
      });

      sensors.push(sensor);
      console.log(`✅ Created sensor ${sensor.sensorId}: ${sensorType} in ${dma.dmaName}`);
    }

    // Create initial readings for each sensor
    console.log('\n📊 Creating initial sensor readings...');
    for (const sensor of sensors) {
      let baseValue;
      let variation;

      switch (sensor.sensorType) {
        case 'pressure':
          baseValue = 45; // PSI
          variation = 10;
          break;
        case 'flow':
          baseValue = 1200; // L/min
          variation = 300;
          break;
        case 'level':
          baseValue = 8.5; // meters
          variation = 2;
          break;
        default:
          baseValue = 50;
          variation = 10;
      }

      // Create readings for last 24 hours (one per hour)
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const value = baseValue + (Math.random() - 0.5) * variation;

        await SensorReading.create({
          sensorId: sensor.sensorId,
          value: value,
          recordedAt: timestamp
        });
      }
    }

    // Create some sample alerts
    console.log('\n🚨 Creating sample alerts...');
    const { Alert } = models;
    
    const alertTypes = ['low_pressure', 'leak', 'sensor_failure'];
    const severities = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 5; i++) {
      const sensor = sensors[Math.floor(Math.random() * sensors.length)];
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      await Alert.create({
        type: alertType,
        severity: severity,
        sensorId: sensor.sensorId,
        dmaId: sensor.dmaId,
        title: `${alertType.replace('_', ' ').toUpperCase()} detected at Sensor ${sensor.sensorId}`,
        description: `Alert detected in ${sensor.sensorType} sensor`,
        location: `DMA ${sensor.dmaId}`,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        status: 'open'
      });
    }

    console.log('\n✅ Demo data seeding completed!');
    console.log(`   - Created ${sensors.length} sensors`);
    console.log(`   - Created ${sensors.length * 24} sensor readings`);
    console.log(`   - Created 5 sample alerts`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;
