// passportConfig.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {User} from "../models/user.js";
import bcrypt from "bcrypt";

//todo Google Auth.
passport.use(new GoogleStrategy({
  clientID: process.env.GCLIENTID,
  clientSecret: process.env.GCLIENTSEC,
  callbackURL: process.env.GCALLBACKURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email:  (profile.emails && profile.emails.length > 0 && profile.emails[0].value)
           ? profile.emails[0].value
           : ""
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
   
//todo Local Strategy 

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user || !user.password) return done(null, false, { message: "User not found or doesn't have local login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: "Wrong password" });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

//todo Serialize and deserialize users
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


// //todo Serialize is used for storing the user data where deserialize is used for extracting that data from the database so that can be compared.
// // Serialize user into session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

// // Local Strategy for login
// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username });
//       if (!user) return done(null, false, { message: "User not found" }); // null specifies that no mistake is found in the druing the save of user information.

//       const isMatch = await bcrypt.compare(password, user.password);  // Here it is comparing your password with the user password
//       if (!isMatch) return done(null, false, { message: "Wrong password" });

//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   })
// );
export default {};