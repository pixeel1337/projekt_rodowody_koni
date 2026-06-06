import express from "express";
import { Horse } from "../models/Horse.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const horses = await Horse.find({});
        return res.render("index", {horses: horses});
    } catch(err) {
        return res.status(500).json({ error: "Błąd ładowania strony: " + err.message });
    }
});


router.get("/dashboard", async (req, res) => {
    try {
        const searchQuery = req.query.search || "";

        const fakeHorsesList = [];

        return res.render("dashboard", { 
            horses: fakeHorsesList,
            searchQuery: searchQuery
         });
    } catch(err) {
        return res.status(500).send("Błąd logowania panelu: " + err.message);
    }
});
 
export default router;