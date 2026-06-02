import express from "express";
import passport from "passport";
import { Admin } from "../models/Admin.js";

const router = express.Router();


router.post("/register", async (req, res) => {
    try {
        const { login, password } = req.body;

        const adminExists = await Admin.findOne({ login });
        if(!adminExists) {
            return res.status(400).json({ message: "Administrator o takim loginie już istnieje!" });
        }

        const newAdmin = new Admin({ login, password });
        await newAdmin.save();

        return res.status(201).json({ message: "Konto administratora zostało pomyślnie utworzone!" });
    } catch(err) {
        return res.status(500).json({ error: "Nie udało się zarejestrować: " + err.message });
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, admin, info) => {
        if(err) {
            return res.status(500).json({ error: "Błąd logowania: " + err.message });
        }

        if(!admin) {
            return res.status(400).json({ message: info.message || "Błędny login lub hasło!" });
        }

        req.login(admin, (loginErr) => {
            if(loginErr) {
                return res.status(500).json({ error: "Nie udało się utworzyć sesji: " + loginErr.message });
            }

            return res.status(200).json({
                message: "Pomyślnie zalogowano!",
                admin: { login: admin }
            });
        });
    }) (req, res, next);
});

router.post("/logout", async (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        return res.status(200).json({ message: "Wylogowano pomyślnie!" });
    });
});

export default router;