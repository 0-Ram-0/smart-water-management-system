const sequelize = require('../config/database');
const models = require('../models');

/**
 * Initialize database - create tables and sync models
 * This script will create all tables based on Sequelize models
 */
async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (create tables)
    // force: false - won't drop existing tables
    // alter: true - will alter tables to match models (use with caution in production)
    await sequelize.sync({ 
      force: false,  // Set to true to drop and recreate all tables (DANGEROUS!)
      alter: false   // Set to true to alter tables to match models
    });
    
    console.log('✅ All models synchronized successfully');
    console.log('📊 Database tables created/verified');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
