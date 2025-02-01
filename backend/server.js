import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse json data: req.body

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    connectDb();
    console.log('Server is running at http://localhost:5000');
});


