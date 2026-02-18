const models = require('../models');
const { ROLES } = require('../config/auth');

/**
 * Seed database with dummy users (Indian names)
 * Creates admin, engineers, and citizens
 */
async function seedUsers() {
  try {
    console.log('🌱 Seeding users with Indian names...');

    const { User } = models;

    // Indian names for different roles
    const users = [
      // Admin
      {
        username: 'admin',
        email: 'admin@solapur.gov.in',
        password: 'admin123',
        role: ROLES.ADMIN,
        fullName: 'Rajesh Kumar',
        phone: '+91-9876543210',
        address: 'Solapur Municipal Corporation, Solapur',
        employeeId: 'EMP001',
        isActive: true
      },
      // Engineers
      {
        username: 'engineer1',
        email: 'priya.sharma@solapur.gov.in',
        password: 'engineer123',
        role: ROLES.ENGINEER,
        fullName: 'Priya Sharma',
        phone: '+91-9876543211',
        address: 'Zone 1, Solapur',
        employeeId: 'EMP002',
        isActive: true
      },
      {
        username: 'engineer2',
        email: 'amit.patel@solapur.gov.in',
        password: 'engineer123',
        role: ROLES.ENGINEER,
        fullName: 'Amit Patel',
        phone: '+91-9876543212',
        address: 'Zone 2, Solapur',
        employeeId: 'EMP003',
        isActive: true
      },
      {
        username: 'engineer3',
        email: 'kavita.singh@solapur.gov.in',
        password: 'engineer123',
        role: ROLES.ENGINEER,
        fullName: 'Kavita Singh',
        phone: '+91-9876543213',
        address: 'Zone 3, Solapur',
        employeeId: 'EMP004',
        isActive: true
      },
      // Citizens
      {
        username: 'citizen1',
        email: 'rahul.desai@gmail.com',
        password: 'citizen123',
        role: ROLES.CITIZEN,
        fullName: 'Rahul Desai',
        phone: '+91-9876543220',
        address: '123 Main Street, Solapur',
        isActive: true
      },
      {
        username: 'citizen2',
        email: 'anita.reddy@gmail.com',
        password: 'citizen123',
        role: ROLES.CITIZEN,
        fullName: 'Anita Reddy',
        phone: '+91-9876543221',
        address: '456 Park Avenue, Solapur',
        isActive: true
      },
      {
        username: 'citizen3',
        email: 'vikram.iyer@gmail.com',
        password: 'citizen123',
        role: ROLES.CITIZEN,
        fullName: 'Vikram Iyer',
        phone: '+91-9876543222',
        address: '789 Gandhi Road, Solapur',
        isActive: true
      },
      {
        username: 'citizen4',
        email: 'meera.nair@gmail.com',
        password: 'citizen123',
        role: ROLES.CITIZEN,
        fullName: 'Meera Nair',
        phone: '+91-9876543223',
        address: '321 Nehru Nagar, Solapur',
        isActive: true
      },
      {
        username: 'citizen5',
        email: 'suresh.menon@gmail.com',
        password: 'citizen123',
        role: ROLES.CITIZEN,
        fullName: 'Suresh Menon',
        phone: '+91-9876543224',
        address: '654 Shivaji Chowk, Solapur',
        isActive: true
      }
    ];

    let created = 0;
    let skipped = 0;

    for (const userData of users) {
      const existing = await User.findOne({
        where: {
          username: userData.username
        }
      });

      if (!existing) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.username} (${userData.fullName}) - ${userData.role}`);
        created++;
      } else {
        console.log(`ℹ️  User already exists: ${userData.username}`);
        skipped++;
      }
    }

    console.log(`\n✅ User seeding completed: ${created} created, ${skipped} skipped`);
    console.log('\n📋 Login Credentials:');
    console.log('Admin:');
    console.log('  Username: admin / Password: admin123');
    console.log('\nEngineers:');
    console.log('  Username: engineer1 / Password: engineer123');
    console.log('  Username: engineer2 / Password: engineer123');
    console.log('  Username: engineer3 / Password: engineer123');
    console.log('\nCitizens:');
    console.log('  Username: citizen1 / Password: citizen123');
    console.log('  Username: citizen2 / Password: citizen123');
    console.log('  (and more...)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
