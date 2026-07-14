import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';

// Configs and Middlewares
import connectDB from './config/db.js';
import notFoundHandler from './middlewares/notFoundMiddleware.js';
import errorHandler from './middlewares/errorMiddleware.js';

import validateEnv from './config/envValidator.js';
// Validate required environment keys immediately on startup
validateEnv();

import { registerAuthEventHandlers } from './services/authEventHandlers.js';
import { registerRoommateEventHandlers } from './modules/roommate/events/roommateEventHandlers.js';
import { registerNotificationEventHandlers } from './modules/notification/events/notificationEventHandlers.js';
import notificationService from './modules/notification/services/notificationService.js';

// Initialize auth event listeners
registerAuthEventHandlers();
registerRoommateEventHandlers();
registerNotificationEventHandlers();

// Connect to MongoDB Atlas
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Basic Socket connection handler (infrastructure setup)
io.use((socket, next) => {
  // Extraction verification will occur in authentication phase.
  // For setup, we allow connection and mock userId if query header provides one.
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (userId) {
    socket.userId = userId;
  }
  next();
});

io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id} (User: ${socket.userId || 'Guest'})`);

  // Register modular chat socket event handlers
  registerChatSocketHandlers(io, socket);
  // Register notifications socket handlers
  registerNotificationSocketHandlers(io, socket);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// Pass io reference to notifications service
notificationService.initializeSocket(io);

// Attach io to request object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Standard Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000", "http://127.0.0.1:5000", "ws://127.0.0.1:5000"],
        frameAncestors: ["'self'", "http://localhost:5173", "http://127.0.0.1:5173", process.env.FRONTEND_URL].filter(Boolean),
      },
    },
    frameguard: false,
  })
);
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Limit each IP to 10000 requests in dev, 100 in prod
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayMate Server is running smoothly',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import modularPropertyRoutes from './modules/property/routes/propertyRoutes.js';
import modularRoommateRoutes from './modules/roommate/routes/roommateRoutes.js';
import modularChatRoutes from './modules/chat/routes/chatRoutes.js';
import { registerChatSocketHandlers } from './modules/chat/socket/chatSocket.js';
import { registerNotificationSocketHandlers } from './modules/notification/socket/notificationSocket.js';
import modularReviewRoutes from './modules/review/routes/reviewRoutes.js';
import modularNotificationRoutes from './modules/notification/routes/notificationRoutes.js';

// Platform Module Imports
import monitoringMiddleware from './modules/platform/monitoring/monitoringMiddleware.js';
import errorMonitoringMiddleware from './modules/platform/monitoring/errorMonitoringMiddleware.js';
import cacheMiddleware from './modules/platform/cache/cacheMiddleware.js';
import platformRoutes from './modules/platform/routes/platformRoutes.js';
import jobScheduler from './modules/platform/jobs/jobScheduler.js';

// Payment Module Imports
import paymentRoutes from './modules/payment/routes/paymentRoutes.js';
import registerPaymentEventHandlers from './modules/payment/events/paymentEventHandlers.js';

// Location Module Imports
import locationRoutes from './modules/location/routes/locationRoutes.js';

// Start Background Job Scheduler immediately on startup
jobScheduler.startScheduler();
registerPaymentEventHandlers();

// Mount global request latencies observation
app.use(monitoringMiddleware);

// App level routes mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/uploads', uploadRoutes);

// High-traffic GET caching mounts (selective/non-invasive)
app.use('/api/v1/properties', cacheMiddleware(60), modularPropertyRoutes);
app.use('/api/v1/roommates', cacheMiddleware(60), modularRoommateRoutes);
app.use('/api/v1/reviews', cacheMiddleware(60), modularReviewRoutes);

app.use('/api/v1/chat', modularChatRoutes);
app.use('/api/v1/notifications', modularNotificationRoutes);
app.use('/api/v1/platform', platformRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/location', locationRoutes);

// Public SEO Sitemaps & robots configuration
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\nSitemap: http://localhost:5000/sitemap.xml");
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://localhost:5173/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>http://localhost:5173/properties</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>http://localhost:5173/roommates</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`);
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to StayMate REST API v1',
  });
});

import { protect, checkAccess } from './middlewares/authMiddleware.js';

// Testing Hybrid RBAC + PBAC Middleware Gating
app.get(
  '/api/test-auth',
  protect,
  checkAccess({ permissions: ['property:create'] }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted! You possess authorization clearances for listing properties.',
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        customPermissions: req.user.customPermissions,
      },
    });
  }
);

// Error handlers (centralized platform logging middleware registered first)
app.use(errorMonitoringMiddleware);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`StayMate Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export { app, io };
// reload trigger

