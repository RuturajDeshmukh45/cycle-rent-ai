require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { Cycle } = require('./models');

const PORT = process.env.PORT || 5000;

const seedData = async () => {
  const count = await Cycle.count();
  if (count === 0) {
    await Cycle.bulkCreate([
      { name: 'City Cruiser 1', location: 'City Center', latitude: 18.5204, longitude: 73.8567, price_per_hour: 15, cycle_type: 'standard', status: 'available', description: 'Smooth city ride' },
      { name: 'Mountain Blaze 1', location: 'University Road', latitude: 18.5314, longitude: 73.8446, price_per_hour: 25, cycle_type: 'mountain', status: 'available', description: 'Rugged mountain cycle' },
      { name: 'E-Rider 1', location: 'Railway Station', latitude: 18.5295, longitude: 73.8742, price_per_hour: 30, cycle_type: 'electric', status: 'available', description: 'Electric assist cycle' },
      { name: 'City Cruiser 2', location: 'Shopping Mall', latitude: 18.5089, longitude: 73.8089, price_per_hour: 15, cycle_type: 'standard', status: 'available', description: 'Quick city ride' },
      { name: 'Park Glider', location: 'Park Entrance', latitude: 18.5240, longitude: 73.8547, price_per_hour: 12, cycle_type: 'standard', status: 'available', description: 'Perfect for parks' },
      { name: 'E-Rider 2', location: 'Tech Park', latitude: 18.5460, longitude: 73.9306, price_per_hour: 28, cycle_type: 'electric', status: 'available', description: 'Long range electric' },
    ]);
    console.log('✅ Sample cycles seeded');
  }
};

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced');
    await seedData();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
