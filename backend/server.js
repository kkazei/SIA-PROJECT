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
import { fileURLToPath } from "url";
import tenantAnnouncementsRoutes from "./routes/tenant-announcements.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Multer setup for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

app.use("/api/auth", authRoutes);
app.use("/api", tenantRoutes); // Assuming your tenant routes are not prefixed with /tenant
app.use("/api", apartmentRoutes);
app.use("/api/tenant-announcements", tenantAnnouncementsRoutes);
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/maintenance", maintenanceRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDb();
    console.log(`Server is running at http://localhost:${PORT}`);
});
