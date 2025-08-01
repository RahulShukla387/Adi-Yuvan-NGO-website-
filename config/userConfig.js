// passportConfig.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {User} from "../models/user.js";
import bcrypt from "bcrypt";

//todo Serialize is used for storing the user data where deserialize is used for extracting that data from the database so that can be compared.

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local Strategy for login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "User not found" }); // null specifies that no mistake is found in the druing the save of user information.

      const isMatch = await bcrypt.compare(password, user.password);  // Here it is comparing your password with the user password
      if (!isMatch) return done(null, false, { message: "Wrong password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
export default {};