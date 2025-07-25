
//todo Adding the cloudinary;

import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import {CloudinaryStorage} from "multer-storage-cloudinary"
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.CLOUD_SECRET,
  port: process.env.PORT
});

const storage = new CloudinaryStorage ({
    cloudinary: cloudinary,
    params: {
      folder: 'AdiYuvan',
      allowed_formats: ["png", "jpg", "jpeg"],
       transformation: [{ width: 800, height: 800, crop: "limit" }]
    },
})

export  {cloudinary, storage};