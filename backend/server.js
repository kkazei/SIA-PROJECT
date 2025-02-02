import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDb } from "./db/connectDb.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); // to parse json data: req.body
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use("/api/auth", authRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}


app.listen(PORT, () => {
    connectDb();
    console.log('Server is running at http://localhost:5000');
});


