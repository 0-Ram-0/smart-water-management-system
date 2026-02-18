const models = require('../models');
const { ROLES } = require('../config/auth');

/**
 * Seed database with initial data
 * Creates default admin user and sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    const { User, DMA, Sensor } = models;

    // Create default admin user
    const adminExists = await User.findOne({ where: { role: ROLES.ADMIN } });
    if (!adminExists) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@solapur.gov.in',
        password: 'admin123', // Will be hashed by model hook
        role: ROLES.ADMIN,
        fullName: 'System Administrator',
        employeeId: 'EMP001',
        phone: '+91-1234567890',
        isActive: true
      });
      console.log('✅ Default admin user created:', admin.username);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Check existing DMAs (user has already created them via SQL)
    const dmaCount = await DMA.count();
    if (dmaCount > 0) {
      console.log(`ℹ️  ${dmaCount} DMAs already exist in database`);
      const dmas = await DMA.findAll({ limit: 3 });
      console.log('   Existing DMAs:');
      dmas.forEach(dma => {
        console.log(`   - ${dma.dmaName} (ID: ${dma.dmaId})`);
      });
    } else {
      console.log('ℹ️  No DMAs found. You can create them via SQL or they will be created by the system.');
    }

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
