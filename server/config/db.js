const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/study_space_finder';
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Please make sure MongoDB is running locally on 127.0.0.1:27017 or provide MONGODB_URI in .env`);
  }
};

module.exports = connectDB;
