const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGODB_URI missing. Running in in-memory store mode (no MongoDB connection).');
    return;
  }

  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Connection Details:');
    console.log('   Database Name:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port || 'N/A (Atlas)');
    console.log('   Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('   📊 View your data at: https://cloud.mongodb.com');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    throw error;
  }
}

module.exports = connectDB;


