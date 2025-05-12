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
import messageRoutes from './routes/message.route.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Adjust to match your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active connections
const activeUsers = new Map();

// Socket.io middleware to authenticate users
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  // Verify token using your existing auth middleware
  // This is a simplified example - you should adapt your actual auth middleware
  if (!token) {
    return next(new Error("Authentication error"));
  }
  
  try {
    // Import your JWT verification logic here
    import('./middleware/auth.middleware.js').then(({ verifyToken }) => {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    }).catch(err => {
      next(new Error("Authentication error"));
    });
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.user?.id);
  
  // Store user connection
  if (socket.user) {
    activeUsers.set(socket.user.id, socket.id);
  }
  
  // Handle join conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.user?.id} joined conversation ${conversationId}`);
  });
  
  // Handle leave conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.user?.id} left conversation ${conversationId}`);
  });

  // Improve the send_message handler
  socket.on('send_message', async (messageData) => {
    try {
      console.log('Socket message received:', messageData);
      
      // Import message controller to save the message
      const { saveMessage } = await import('./controllers/message.controller.js');
      const savedMessage = await saveMessage({
        ...messageData,
        sender_id: socket.user.id
      });
      
      console.log('Message saved, emitting to room:', messageData.conversation_id);
      
      // Emit to conversation room
      io.to(messageData.conversation_id).emit('receive_message', savedMessage);
      
      // Also emit specifically to receiver if they're online but not in the room
      const receiverId = messageData.receiver_id;
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        console.log(`Emitting notification to receiver ${receiverId}`);
        io.to(receiverSocketId).emit('new_message_notification', {
          message: savedMessage,
          from: socket.user
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle mark as read
  socket.on('mark_as_read', async ({ conversationId, messageIds }) => {
    try {
      const { markMessagesAsRead } = await import('./controllers/message.controller.js');
      await markMessagesAsRead(conversationId, messageIds);
      
      // Notify the conversation that messages were read
      io.to(conversationId).emit('messages_read', {
        conversationId,
        messageIds,
        readBy: socket.user.id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      user: socket.user.id,
      conversationId
    });
  });
  
  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user_stopped_typing', {
      user: socket.user.id,
      conversationId
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.id);
    if (socket.user) {
      activeUsers.delete(socket.user.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
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
app.use('/api/messages', messageRoutes);


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
server.listen(PORT, () => {
    connectDb();
    console.log(`Server is running at http://localhost:${PORT}`);
});