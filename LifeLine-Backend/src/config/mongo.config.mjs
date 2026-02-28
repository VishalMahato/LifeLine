import mongoose from 'mongoose';

/**
 * MongoDB Configuration
 * Handles connection to MongoDB with proper error handling
 */

let hasAttachedListeners = false;

const mongoStateLabel = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getMongoStatus = () => mongoStateLabel[mongoose.connection.readyState] || 'unknown';

const isDBConnected = () => mongoose.connection.readyState === 1;

const attachConnectionListeners = () => {
  if (hasAttachedListeners) {
    return;
  }

  hasAttachedListeners = true;

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });
};

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeline';

    // Connection options for better performance and reliability
    const options = {
      // Automatically create indexes
      autoIndex: true,

      // Server selection timeout (5 seconds)
      serverSelectionTimeoutMS: 5000,

      // Socket timeout (45 seconds)
      socketTimeoutMS: 45000,

      // Connection name for debugging
      dbName: 'lifeline',
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    attachConnectionListeners();

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Graceful shutdown - close MongoDB connection
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      return;
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

export { connectDB, disconnectDB, getMongoStatus, isDBConnected };
export default connectDB;
