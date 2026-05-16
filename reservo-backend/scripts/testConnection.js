const { sequelize, connectDB } = require('./config/database');

async function testConnection() {
  console.log('🔄 Testing database connection...\n');

  try {
    // Test connection
    await connectDB();

    console.log('✅ Connection successful!\n');

    // Get database info
    const result = await sequelize.query(`
      SELECT version();
    `);

    console.log('📊 Database Information:');
    console.log('━'.repeat(50));
    console.log(result[0][0].version);
    console.log('━'.repeat(50));

    // List all tables
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tables in Database:');
    if (tables[0].length === 0) {
      console.log('   (No tables yet. Run: npm run sync-db)');
    } else {
      tables[0].forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }

    console.log('\n✨ Everything looks good!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('  1. Check .env file - make sure DB_* variables are correct');
    console.error('  2. Verify Neon credentials are correct');
    console.error('  3. Check internet connection');
    console.error('  4. Ensure SSL mode is enabled for Neon');
    process.exit(1);
  }
}

testConnection();
