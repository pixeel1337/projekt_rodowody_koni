import passport from "passport";
import { Strategy } from "passport-local";
import mongoose from "mongoose";
import { Admin } from "../models/Admin.js";

passport.use(
    new Strategy(
        {usernameField: "login", passwordField: "password" }, 
        async (login, password, done) => {
        try {
            const findAdmin = await Admin.findOne({ login });
            if(!findAdmin) {
                return done(null, false, { message: "Nieprawidłowy login lub hasło!" });
            }

            const isMatch = await findAdmin.comparePassword(password);
            if(!isMatch) {
                return done(null, false, { message: "Niepoprawny login lub hasło!" });
            }

            return done(null, findAdmin);
        } catch(err) {
            return done(err);
        }
    })
);

passport.serializeUser((admin, done) => {
    done(null, admin.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const admin = await Admin.findById(id);
        done(null, admin);
    } catch(err) {
        done(err, null);
    }
});

export default passport;