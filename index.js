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

import groupImage from "./models/image.js";
import Report from "./models/report.js";

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
app.use(express.urlencoded({ extended: true })); // for taking the parameter from req.body;
//todo Adding the cloudinary;

import {storage} from "./config/cloudinary.js";
import { cloudinary } from "./config/cloudinary.js";

//In cloudinary integrating multer for image.
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

//todo Importing the session and passport for authentication.
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userConfig from "./config/userConfig.js";
import  "./config/userConfig.js";
import {User, GoogleAut} from "./models/user.js";
// import googleAuth from "./config/googleAuth.js"; 
//todo instead of above line i directly import googleAuth.
import "./config/googleAuth.js";
import { profile } from "console";
app.use(session({
  secret: process.env.secretKey,
  resave: false,
  saveUninitialized: false,
  
}));
app.use(passport.initialize());
app.use(passport.session());

//todo Starting code;

//todo Creating the login and logout route and isLoggedIN authentication.
//todo Signup
 app.get("/signup", (req, res)=>{
  res.render("signup.ejs");
 })
  app.post("/signup",async (req, res, next) =>{
    try{

      const {username, password} = req.body;
         const isUserExist = await User.findOne({username});
          if(isUserExist){
            console.log("user already exist ");
            res.redirect("/signup");
          }else{

            const newUser = new User ({username, password});
            await newUser.save();
             req.login(newUser , (err) =>{
               if(err) return next(err);
               console.log(req.user);
               return res.redirect("/");
             });
          }
    }
    catch(err){
      console.log("Signup error: ", err);
      res.redirect("/signup");
    }
  })
//todo Login 
app.get("/login", (req, res)=>{
   res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  // failureFlash: true,
}));
//logout
app.get("/logout", (req, res)=>{
  req.logOut(err => {
      if(err) return next(err);
      res.redirect("/vision");
  })
})
//isLoggedIn() authentication.
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

//todo Middleware so that req.user be sent to navbar.ejs template,

app.use((req, res, next)=>{
  res.locals.currUser = req.user;
  next();
});

//todo Adding photos on cloudinary
const upload = multer({storage :storage});


//upload 
app.get("/upload", async(req, res)=>{
    res.render("upload.ejs");
})
let lastUsedUUID = null;
app.post("/upload", upload.array("imgupload", 20), async(req, res)=>{
  if(!req.files){
    return res.status(400).send("No file uploaded");
  }
//  const imgUrl = req.file.path;
 const {title, description} = req.body;
 console.log("Uploaded file details is ", req.files);

  // Map uploaded images
  const imageData = req.files.map((file) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    path: file.path, // Cloudinary URL
    size: file.size,
    filename: file.filename,
  }));
  try{

    if (title) {
          // New group
          const newUUID = uuidv4();
          lastUsedUUID = newUUID;
    
          const newGroup = new groupImage({
            uuid: newUUID,
            title,
            description,
            images: imageData,
          });
    
          await newGroup.save();
          return res.status(200).send("New group with images created successfully");
        } else {
          // Append to last used group
          if (!lastUsedUUID) {
            return res.status(400).send("Please add title and description to add");
          }
           const existingGroup = await groupImage.findOne({ uuid: lastUsedUUID });
             if (!existingGroup) {
            return res.status(404).send("Please add tittle and description to upload");
          }
    
          existingGroup.images.push(...imageData); // new images are being pushed.
          await existingGroup.save();
          return res.status(200).send("Images added to existing group successfully");
        }
  }catch(err){
    console.log("Error occured in uploading", err);
  }
}
)

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
    const allImages =await groupImage.find({});
  res.render("showAll.ejs", {list: allImages});
})
 app.get("/donateUs", async (req, res)=>{
    res.render("donate.ejs");
 })
 //todo Report Us the problem 
 app.get("/report", (req, res)=>{
   res.render("report.ejs");
 })
app.post("/report", upload.single("image"), async (req, res) => {
  // console.log(req.file); // Cloudinary image info
  // console.log(req.body); // latitude, longitude, description, etc.
  // Now save req.file.path (image URL), req.body.latitude, req.body.longitude to MongoDB
  let {path} = req.file;
  let {description, latitude, longitude} = req.body;
  let data = ({
    latitude: latitude,
    longitude: longitude,
    description: description,
    image: path,
  })
  let ReportedData = await new Report(data);
 await ReportedData.save();
 console.log("Reported data is : \n", ReportedData);
  res.send("Report submitted!");
});
 //todo See reports 
  app.get("/view/reports", async(req, res)=>{
     try {
    const reports = await Report.find({});
    res.render("viewReports.ejs", { reports });
  } catch (error) {
    console.error("Failed to load reports:", error);
    res.status(500).send("Error loading reports");
  }
  }) 

 app.get("/vision", async (req, res)=>{
    res.render("vision.ejs");
 })
app.get("/about", (req, res)=>{
   res.render("about.ejs");
})
app.get("/",   async (req, res)=>{
  res.render("home.ejs"); 
})
//todo User google authentication

//todo Start Google OAuth
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route
 app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google",
  }),
  (req, res) => {
    // Successful auth
    console.log("google profile is: ", profile);
    res.redirect("/"); // or wherever you want
  }
);

