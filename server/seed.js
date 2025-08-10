const { connectDB } = require('./src/config/database');
const seedDatabase = require('./src/seeders/index');

const runSeeder = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando seeder:', error);
    process.exit(1);
  }
};

runSeeder();
