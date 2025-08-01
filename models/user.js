import mongoose from "mongoose";
import bcrypt from "bcrypt";
import passport from "passport";
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

userSchema.pre("save", async function (next){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);

const GoogleSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
    
  username:{

    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
  }

})
const GoogleAut = mongoose.model("GoogleAut", GoogleSchema);

export {User, GoogleAut};