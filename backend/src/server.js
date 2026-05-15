require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { Cycle, User } = require('./models');

const PORT = process.env.PORT || 5000;

const seedData = async () => {
  // ── Seed sample cycles ──
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

  // ── Seed default admin user ──
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecocycle.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '9579180893',
    });
    console.log(`✅ Admin user created → Email: ${adminEmail} | Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  } else {
    console.log(`ℹ️  Admin already exists → ${adminEmail}`);
  }
};

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced');
    await seedData();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`   Fix: Run this command to free the port:`);
        console.error(`   Windows:  netstat -ano | findstr :${PORT}  → then  taskkill /PID <PID> /F`);
        console.error(`   Mac/Linux: lsof -ti:${PORT} | xargs kill -9\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
