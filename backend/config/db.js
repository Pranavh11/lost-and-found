const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
  
  try {
    // Attempt standard connection to local/remote MongoDB
    // We set a 2-second connection timeout so we fall back quickly if offline
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`====================================================`);
    console.log(`✅ Connected to external MongoDB successfully!`);
    console.log(`🗄️  Host: ${conn.connection.host}`);
    console.log(`====================================================`);
  } catch (error) {
    console.warn(`\n⚠️ External MongoDB connection failed at ${mongoUri}.`);
    console.warn(`👉 Booting In-Memory MongoDB Server fallback to run program error-free...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '7.0.15'
        }
      });
      const uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`====================================================`);
      console.log(`✅ In-Memory MongoDB Connected Successfully!`);
      console.log(`🗄️  In-Memory URI: ${uri}`);
      console.log(`====================================================`);
      
      // Auto-seed the database in-memory so the app is fully populated
      console.log('🔄 Seeding in-memory collections...');
      const seed = require('../seedData');
      await seed(false); // pass false so it doesn't process.exit(0)
      console.log('✅ In-memory database auto-seeded successfully!');
    } catch (memError) {
      console.error(`❌ In-Memory MongoDB Server boot failed!`);
      console.error(memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
