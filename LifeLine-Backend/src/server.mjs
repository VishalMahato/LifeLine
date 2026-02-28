import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/mongo.config.mjs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'LifeLine Backend is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes will be imported here
// Example: app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        });

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