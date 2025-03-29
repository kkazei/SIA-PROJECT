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
import maintenanceRoutes from "./routes/maintenance.route.js";
import tenantRoutes from "./routes/tenant.route.js";
import userRoutes from "./routes/user.route.js";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "./config/passport.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json()); // to parse json data: req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure session middleware (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up file upload directories
const setupUploadDirectories = () => {
  const dirs = ['uploads', 'uploads/qr-codes', 'uploads/maintenance', 'uploads/posts'];
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
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);  


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