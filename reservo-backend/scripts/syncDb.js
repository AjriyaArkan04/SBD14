require('dotenv').config();
const { sequelize, connectDB } = require('../config/database');

// Import semua model agar Sequelize mendeteksinya
const { User, Restaurant, Table, Reservation } = require('../models');

const syncDb = async () => {
  try {
    console.log('🔄 Connecting to database...\n');
    await connectDB();

    console.log('📝 Creating/Updating tables...\n');
    
    // alter: true → update kolom yang berubah tanpa drop table
    await sequelize.sync({ alter: true });
    
    console.log('✅ All models synchronized successfully.\n');

    // Show tables info
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables in database:');
    if (tables[0].length === 0) {
      console.log('   (No tables found)');
    } else {
      tables[0].forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }

    console.log('\n✨ Database setup complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. npm run dev     (start development server)');
    console.log('   2. Test API at http://localhost:5000/api/health');
    console.log('   3. Check database with: node scripts/testConnection.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check .env file - make sure all DB_* variables are set');
    console.error('  2. Verify connection to Neon is working');
    console.error('  3. Check internet connection');
    process.exit(1);
  }
};

syncDb();