import mongoose from "mongoose";
const imgSchema = new mongoose.Schema({
    fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  path: String,        // Cloudinary URL
  size: Number,
  filename: String,
  description: String
});

const Image = mongoose.model("Image", imgSchema);
export default Image;