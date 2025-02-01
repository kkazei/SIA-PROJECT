import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        console.log("mongo_uri: ", process.env.MONGO_URI)
       const conn = await mongoose.connect(process.env.MONGO_URI)
       console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error("MongoDB connection failed")
        process.exit(1)
    }
}