import express from "express";
const app = express();
const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("website is working properly");
})
//todo importing dbConnection

import dbConnect from "./config/mongdb.js";
console.log(dbConnect());
//todo Importing mongoSchema

import Image from "./models/image.js";

//todo Importing ejs file

import ejs from "ejs";
import path from "path";
import exp from "constants";
//todo if you using import you have to write this extra means have to define explicitly;
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//setting ejs templating engine
app.set("view engine", "ejs");
//setting views directory
app.set("views", path.join(__dirname, "views"));
// Serving static files(css, js, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

//todo Adding the cloudinary;

import {storage} from "./config/cloudinary.js";
import { cloudinary } from "./config/cloudinary.js";

//In cloudinary integrating multer for image.
import multer from "multer";
import fs from "fs";

//todo Starting code;

//todo Adding photos on cloudinary
const upload = multer({storage :storage});

//upload 

app.get("/upload", async(req, res)=>{
    res.render("upload.ejs");
})
app.post("/upload", upload.single("imgupload"), async(req, res)=>{
  if(!req.file){
    return res.status(400).send("No file uploaded");
  }
 const imgUrl = req.file.path;
 const description = req.body.description;
 console.log("Uploaded file details is ", req.file);
 //Adding image detail 
 const data = {
  fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      path: req.file.path,         // Cloudinary URL
      size: req.file.size,
      filename: req.file.filename,
      description: description 
 }
 const newImage = new Image(data);
 await newImage.save();
 res.send("Image uploaded successfully");
}
)
//showAll

//delete all
app.get("/delete", async(req, res)=>{
  try{
    const result = await Image.deleteMany({});
    console.log("deleted successfully");
  }
  catch(err){
    console.log(err);
  }

})


app.get("/showAll", async(req, res)=>{
    const allImages =await Image.find({});
  res.render("showAll.ejs", {images: allImages});
})
 app.get("/donateUs", async (req, res)=>{
    res.render("donate.ejs");
 })
 app.get("/vision", async (req, res)=>{
    res.render("vision.ejs");
 })
app.get("/home",(req, res)=>{
  res.render("home.ejs");
})