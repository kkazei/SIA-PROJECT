import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import apartmentRoutes from "./routes/apartment.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDb } from "./db/connectDb.js";
import multer from "multer";
import postRoutes from "./routes/post.route.js";
import qrRoutes from "./routes/qr.route.js";
import maintenanceRoutes from "./routes/maintenance.route.js";
import tenantRoutes from "./routes/tenant.route.js";
import userRoutes from "./routes/user.route.js";
import applicationRoutes from "./routes/application.route.js";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo"; // Add this import
import passport from "./config/passport.js";
import inquiryRoute from './routes/inquiry.route.js';
import paymentRoutes from "./routes/payment.route.js";
import leaseRoutes from './routes/lease.route.js';
import adminRoutes from './routes/admin.route.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/socketAuth.js';
import fs from 'fs';
import messageRoutes from './routes/message.routes.js';
import messageHandler from './socketHandlers/messageHandler.js';
import { checkRentPaymentsDue } from './schedulers/rentReminders.js';
import cron from 'node-cron';
import { verifyToken, authorize } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Get allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, 'https://sia-project-a5xr.onrender.com']
  : ['http://localhost:5173'];

// Create HTTP server using the Express app
const server = http.createServer(app);

// Create Socket.IO server with improved CORS settings
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.log(`Origin ${origin} not allowed by CORS`);
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000
});

// Apply Socket.IO middleware
io.use(socketAuthMiddleware);

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true 
}));
app.use(express.json()); // to parse json data: req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure session middleware with MongoDB store
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 24 hours in seconds
    autoRemove: 'native'
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up file upload directories
const setupUploadDirectories = () => {
  const dirs = ['uploads', 'uploads/maintenance', 'uploads/posts', 'uploads/payment_proofs'];
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

// Ensure upload directories exist
setupUploadDirectories();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/qr", qrRoutes);  // Add QR routes
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes); 
app.use("/api/applications", applicationRoutes); 
app.use('/api/admin', adminRoutes);

// Add this before mounting the route
console.log('Setting up inquiry routes...');
app.use('/api/inquiries', inquiryRoute);
console.log('Inquiry routes set up successfully');

// Use payment routes
app.use('/api/payments', paymentRoutes);
console.log('Payment routes initialized');

// Use lease routes
app.use('/api/leases', leaseRoutes);

// Add this line to register message routes
app.use('/api/messages', messageRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Production setup
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  // Add user to a room with their ID for direct messaging
  socket.join(socket.user.id);
  
  // Register message handlers
  messageHandler(io, socket);
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Schedule rent reminder checks to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('Running rent due reminder check...');
    try {
        const result = await checkRentPaymentsDue();
        console.log('Rent reminder check completed:', result);
    } catch (error) {
        console.error('Error running rent reminder check:', error);
    }
});

// You can also add an endpoint to manually trigger this check for testing:
app.get('/api/admin/check-rent-reminders', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const result = await checkRentPaymentsDue();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
server.listen(PORT, () => {
    connectDb();
    console.log(`Server is running at http://localhost:${PORT}`);
});