import mongoose, { Schema } from "mongoose";
// const imgSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//    images: [
//     {
//   fieldname: String,
//   originalname: String,
//   encoding: String,
//   mimetype: String,
//   path: String,        // Cloudinary URL
//   size: Number,
//   filename: String,
//     }
//    ]
  
// });
const imgSchema = new mongoose.Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  path: String,        // Cloudinary URL
  size: Number,
  filename: String,
});
const Image = mongoose.model("Image", imgSchema);


const groupImageSchema = new mongoose.Schema({
uuid:{
  type: String,
  required: true,
},
 title: String,
  description: String,
  images: [imgSchema],
    createdAt: {
    type: Date,
    default: Date.now,
  },
})
const groupImage = mongoose.model("groupImage", groupImageSchema);
export default groupImage;