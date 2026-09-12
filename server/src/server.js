import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seeder.js';

import dashboardRoutes from './routes/dashboardRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow all origins & methods with preflight
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Explicit Header Fallback Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LUFO Clothing CRM Backend API',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});


// Start Server & Connect Database
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 LUFO Clothing CRM API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`=================================================\n`);
  });
};

startServer();
