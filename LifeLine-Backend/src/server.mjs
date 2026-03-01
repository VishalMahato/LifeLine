import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB, getMongoStatus, isDBConnected } from './config/mongo.config.mjs';
import authRoutes from './api/Auth/v1/Auth.routes.mjs';
import userRoutes from './api/User/User.routes.mjs';
import helperRoutes from './api/Helper/Helper.routes.mjs';
import medicalRoutes from './api/Medical/Medical.routes.mjs';
import locationRoutes from './api/Location/Location.routes.mjs';
import emergencyRoutes from './api/Emergency/Emergency.routes.mjs';

// Load environment variables without noisy runtime tips
dotenv.config({ quiet: true });
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(runtimeDir, 'uploads')));

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

// Use API routes (keep current and v1 aliases)
app.use('/api/auth', authRoutes);
app.use('/api/auth/v1', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users/v1', userRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/helpers/v1', helperRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/medical/v1', medicalRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/locations/v1', locationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/emergency/v1', emergencyRoutes);

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

const registerShutdownHandlers = (server) => {
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

export const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`MongoDB required: ${MONGODB_REQUIRED}`);
    });

    await connectDBWithRetry();

    registerShutdownHandlers(server);
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
};

const isDirectExecution = () => {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (process.env.NODE_ENV !== 'test' && isDirectExecution()) {
  startServer().catch(() => process.exit(1));
}

export { app };
export default app;
