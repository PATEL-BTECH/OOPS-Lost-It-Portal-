/**
 * MongoDB Atlas / Mongoose Connection Manager
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  if (!config.mongoUri) {
    console.warn('⚠️  [MongoDB Warning] MONGO_URI is not defined in server/.env.');
    console.warn('   Add your MongoDB Atlas connection string to connect to the database.');
    return false;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: true
    });

    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    console.info('💡 [Hint] Check your IP Whitelist (Network Access 0.0.0.0/0) in MongoDB Atlas and verify your database user password.');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [MongoDB] Lost connection to MongoDB.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 [MongoDB] Reconnected to MongoDB.');
});

module.exports = {
  connectDB,
  mongoose
};
