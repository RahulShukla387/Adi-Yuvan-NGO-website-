import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { GoogleAut } from "../models/user.js";
dotenv.config();
passport.use(
    new GoogleStrategy(
      {
      clientID: process.env.GCLIENTID,
      clientSecret: process.env.GCLIENTSEC,
      callbackURL: process.env.GCALLBACKURL
    },
     async (accessToken, refreshToken, profile, done) => {
      // Here you can save user info to DB
       try{
           let existingUser = await  GoogleAut.findOne({googleId: profile.id});
           if(!existingUser){
            const newUser = new GoogleAut({
              googleId: profile.id,
              username: profile.displayName,
             email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : ""
            });
            await newUser.save();
            return done(null, newUser);
           }
           console.log("google profile: \n", profile);
           return done(null, existingUser);
       }catch(err){
        // console.log("googleAuth Err", err);
        return done(err, null);
       }
    }
  )
  );
  // Required for session support,

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
export default {};