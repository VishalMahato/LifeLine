import mongoose from 'mongoose';

/**
 * MongoDB Configuration
 * Handles connection to MongoDB with proper error handling
 */

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

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Graceful shutdown - close MongoDB connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

export { connectDB, disconnectDB };
export default connectDB;