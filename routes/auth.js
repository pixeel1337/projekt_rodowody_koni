import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, admin, info) =>{
        if(err) {
            return next(err);
        }

        if(!admin) {
            return res.status(401).send(info.message || "Brak dostępu");
        }

        req.login(admin, (loginErr) => {
            if(loginErr) {
                return next(loginErr);
            }

            return res.redirect("/dashboard");
        });
    })(req, res, next);
});


router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }

        res.redirect("/");
    });
});

export default router;