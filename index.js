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
import methodOverride from "method-override";
app.use(methodOverride('_method'));
//todo Adding the cloudinary;

import {storage} from "./config/cloudinary.js";
import { cloudinary } from "./config/cloudinary.js";

//In cloudinary integrating multer for image.
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
//todo Importing the session and passport for authentication.
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userConfig from "./config/userConfig.js";
import  "./config/userConfig.js";
import {User} from "./models/user.js";
import { isAdmin, isLoggedIn } from "./config/middleware.js";
//todo instead of above line i directly import googleAuth.
import { profile } from "console";
import { title } from "process";
import {transporter} from "./config/nodemailer.js";
app.use(session({
  secret: process.env.secretKey,
  resave: false,
  saveUninitialized: false,
  
}));
app.use(passport.initialize());
app.use(passport.session());

//todo Starting code;


//todo Middleware so that req.user be sent to navbar.ejs template,

app.use((req, res, next)=>{
  res.locals.currUser = req.user;
  next();
});

//todo Promoting AdiYuvan as admin 
//  await User.findOneAndUpdate({email: "adiyuvanfoundation@gmail.com"},{role: "admin"});

//todo Adding photos on cloudinary
const upload = multer({storage :storage});


//upload 
app.get("/upload",isAdmin, async(req, res)=>{
    res.render("upload.ejs");
})
let lastUsedUUID = null;
app.post("/upload", isAdmin, upload.array("imgupload", 20), async(req, res)=>{
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
 app.get("/report",isLoggedIn, (req, res)=>{
   res.render("report.ejs");
 })
app.post("/report",isLoggedIn, upload.single("image"), async (req, res) => {
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
  app.get("/view/reports",isAdmin, async(req, res)=>{
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
  res.render("about.ejs"); 
})

//todo Promoting as admin 
app.get("/admin/promote", isAdmin, (req, res) => {
  res.render("admin.ejs", { user: req.user });
});

// Promote another user
app.post("/admin/promote", isAdmin, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");
    user.role = "admin";
    await user.save();

    res.send(`${email} is now an admin.`);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

//todo edit and delete route
 app.get("/edit/showAll/:id", isLoggedIn, isAdmin, async(req, res)=>{
const id = req.params.id;
  let toEdit = await groupImage.findById(id);
    if(!toEdit){
      console.log("no list had found");
    }
    else{
      res.render("editShowAll.ejs", {list: toEdit, id});
    }
 })
app.patch("/edit/showAll/:id",isLoggedIn, isAdmin, async (req, res)=>{
  const id = req.params.id;
   let {description, title} = req.body;
      await groupImage.findByIdAndUpdate(id, {description, title});
      res.redirect("/showAll");
})

//todo function extractPublicId

function extractPublicId(imagePath) {
  // Assuming the Cloudinary URL looks like:
  // https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg

  const parts = imagePath.split('/');
  const filenameWithExtension = parts[parts.length - 1]; // e.g., filename.jpg
  const filename = filenameWithExtension.split('.')[0];  // e.g., filename
  return filename; // This is usually your public_id (if you're not using folders)
}


//Deleting image in showall
app.delete("/delete/showAll/:imageId", isLoggedIn, isAdmin, async (req, res) => {
  const { imageId } = req.params;
  // Find the document containing the image
  const parentDoc = await groupImage.findOne({ "images._id": imageId });

  if (!parentDoc) {
    return res.status(404).send("Image not found");
  }
  // Optional: Delete from Cloudinary if needed
  const imageToDelete = parentDoc.images.id(imageId);
  const cloudinaryPublicId = extractPublicId(imageToDelete.path); // Write a function to extract public_id if needed
  await cloudinary.uploader.destroy(cloudinaryPublicId);
  // Pull the image from the array
  await groupImage.updateOne(
    { _id: parentDoc._id },
    { $pull: { images: { _id: imageId } } }
  );
  res.redirect("/showAll");
});
app.delete("/dlt/showAll/:id", isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const group = await groupImage.findById(id);

  if (!group) {
    req.flash("error", "Event not found");
    return res.redirect("/showAll");
  }

  // Delete images from Cloudinary
  for (let img of group.images) {
    if (img.filename) {
       const publicId = extractPublicId(img.path);
      await cloudinary.uploader.destroy(publicId);
    }
  }

  // Delete the event from MongoDB
  await groupImage.findByIdAndDelete(id);

  res.redirect("/showAll");
});

//todo Deleting the indivisual report of reports 
app.delete("/view/reports/dlt/:id", isLoggedIn, isAdmin, async(req, res)=>{
   const {id} = req.params;
    let toDlt = await Report.findById(id);
    if(!toDlt) res.send("Report does not exist");
    else console.log(toDlt);
      const publicId = extractPublicId(toDlt.image);
      await cloudinary.uploader.destroy(publicId);
       await Report.findByIdAndDelete(id);
       res.redirect("/view/reports");
})

//todo Deletiing Promote Admin

app.get("/remove/admin", isLoggedIn, isAdmin, async(req, res) =>{
  res.render("removeAdmin.ejs");
})
app.post("/remove/admin", isLoggedIn, isAdmin, async (req, res)=>{
 try {
   let {email} = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");
     if(user && user.role == "admin"){
       user.role = "user";
       await user.save();
       res.send(`${email} is removed from admin post.`);
     }
      else{
        res.send("User is already not a admin ");
      }
  } catch (err) {
    res.status(500).send("Server error");
  }
});


//todo User google authentication

//todo Start Google OAuth and local login 
// Show form
app.get("/complete/profile", isLoggedIn, (req, res) => {
  // If user already has password and username, skip
  if (req.user.password && req.user.username) {
    return res.redirect("/");
  }
  res.render("complete_profile.ejs");
});

// Handle form submission
app.post("/complete/profile", isLoggedIn, async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) {
    return res.redirect("/complete/profile"); // or show message
  }

  req.user.username = username;
  req.user.password = password; // Will be hashed in schema
  await req.user.save();

  res.redirect("/");
});


// Login Page
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("login.ejs");
});

// Handle Local Login
app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

// Logout
app.get("/logout", async (req, res, next) => {
    await req.logout((err)=>{
      if(err) return next(err);
      res.redirect("/vision");
    });
});
 //todo reset password forget password

 app.get("/forget", (req, res) => {
  res.render("forget.ejs");
});
// generating token and sending it to user email

app.post("/forget", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.send("No user found with that email");

  const token = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetLink = `http://${req.headers.host}/reset/${token}`;

  await transporter.sendMail({
    to: user.email,
    from: process.env.AMAIL_ID,
    subject: "Password Reset Link",
    html: `Click <a href="${resetLink}">here</a> to reset your password.`
  });

  res.send("Reset link sent to your email.");
});

// reset the token the password

app.get("/reset/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.send("Token expired or invalid");

  res.render("resetPassword.ejs", { token: req.params.token , username: user.username});
});
// post request of reset the token 
app.post("/reset/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.send("Token expired or invalid");

  user.password = req.body.password; // Will be auto-hashed via pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.send("Password updated. You can now log in.");
});


// Google Auth Start
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Auth Callback
app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    if (!req.user.password) {
      return res.redirect("/complete/profile"); // A route
    }
    res.redirect("/");
  }
);


