const sequelize = require('../config/database');
const models = require('../models');

/**
 * Test database connection and verify tables exist
 */
async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Test querying existing tables
    console.log('\n📊 Checking existing tables...');
    
    const { Zone, DMA, Sensor, SensorReading, Pipeline } = models;

    // Test Zone
    const zoneCount = await Zone.count();
    console.log(`✅ Zones table: ${zoneCount} records found`);

    // Test DMA
    const dmaCount = await DMA.count();
    console.log(`✅ DMAs table: ${dmaCount} records found`);
    
    if (dmaCount > 0) {
      const dmas = await DMA.findAll({ limit: 3 });
      console.log('   Sample DMAs:');
      dmas.forEach(dma => {
        console.log(`   - ${dma.dmaName} (Zone ID: ${dma.zoneId})`);
      });
    }

    // Test Sensor
    const sensorCount = await Sensor.count();
    console.log(`✅ Sensors table: ${sensorCount} records found`);

    // Test SensorReading
    const readingCount = await SensorReading.count();
    console.log(`✅ Sensor Readings table: ${readingCount} records found`);

    // Test Pipeline
    const pipelineCount = await Pipeline.count();
    console.log(`✅ Pipelines table: ${pipelineCount} records found`);

    console.log('\n✅ All tables accessible! Models are properly configured.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Original error:', error.original.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;
