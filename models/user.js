import mongoose from "mongoose";
import bcrypt from "bcrypt";
import passport from "passport";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    required: function () {
      return !this.googleId; // required if not using Google
    },
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // required if not using Google
    },
  },
 role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
 },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export {User};
