
import dotenv from "dotenv";
dotenv.config();

//todo Connecting mongoose

import mongoose from "mongoose";
const dbUrl = process.env.mongoUrl;
let dbConnect = async ()=>{
   await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));
}

export default dbConnect;