import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, getMongoStatus, isDBConnected } from './config/mongo.config.mjs';
import authRoutes from './api/Auth/v1/Auth.routes.mjs';
import userRoutes from './api/User/User.routes.mjs';
import helperRoutes from './api/Helper/Helper.routes.mjs';
import medicalRoutes from './api/Medical/Medical.routes.mjs';
import locationRoutes from './api/Location/Location.routes.mjs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbConnected = isDBConnected();

  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'LifeLine Backend is running',
    timestamp: new Date().toISOString(),
    database: getMongoStatus(),
  });
});

// Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 10000);
const MONGODB_REQUIRED = process.env.MONGODB_REQUIRED === 'true';
let dbReconnectTimer;

const scheduleDBReconnect = () => {
  if (dbReconnectTimer) {
    return;
  }

  dbReconnectTimer = setTimeout(async () => {
    dbReconnectTimer = null;
    await connectDBWithRetry();
  }, DB_RETRY_DELAY_MS);
};

const connectDBWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn(
      `⚠️ MongoDB unavailable. Retrying in ${DB_RETRY_DELAY_MS / 1000}s. Reason: ${error.message}`,
    );
    scheduleDBReconnect();

    if (MONGODB_REQUIRED) {
      throw error;
    }
  }
};

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️ MongoDB required: ${MONGODB_REQUIRED}`);
    });

    await connectDBWithRetry();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
