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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Add debug for CORS and cookies in production
const allowedOrigins = [
  'http://localhost:5173',
  'https://sia-project.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`Origin blocked: ${origin}`);
      return callback(null, false);
    }
    console.log(`Origin allowed: ${origin}`);
    return callback(null, true);
  },
  credentials: true 
}));

app.use(express.json()); // to parse json data: req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure session middleware with MongoDB store
app.use(session({
  secret: process.env.JWT_SECRET || '',
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
import fs from 'fs';
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

// Start server
app.listen(PORT, () => {
    connectDb();
    console.log(`Server is running at http://localhost:${PORT}`);
});