const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ All tables synced.');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Sync error:', err);
  });