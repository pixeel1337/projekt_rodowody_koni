import express from "express";
import { Horse } from "../models/Horse.js";
import { de } from "@faker-js/faker";

const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}


router.get("/", async (req, res) => {
    try {
        const horses = await Horse.find({});
        return res.render("index", {horses: horses});
    } catch(err) {
        return res.status(500).json({ error: "Błąd ładowania strony: " + err.message });
    }
});

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
    try {
        const searchQuery = (req.query.search || "").trim();
        const genderQuery = req.query.gender || "";
        
        let query = {};

        if (searchQuery.length > 0) {
            query.name = { $regex: searchQuery, $options: "i" };
        }

        if (genderQuery !== "") {
            query.gender = { $regex: `^${genderQuery}$`, $options: "i" };
        }

        console.log("=== KONTROLA BAZY ===");
        console.log("Do bazy leci zapytanie:", query);

        const horses = await Horse.find(query);

        res.render("dashboard", {
            admin: req.user,
            horses: horses,
            searchQuery: searchQuery
        });
    } catch(err) {
        res.status(500).send("Błąd serwera przy ładowaniu panelu!");
    }
});

async function getAncestors(horseID, actualGeneration, maxGeneration) {
    if(!horseID || actualGeneration > maxGeneration) {
        return null;
    }    

    const horse = await Horse.findById(horseID).populate("birthCountry");
    if(!horse) {
        return null;
    }

    const horseData = horse.toObject();

    horseData.fatherTree = await getAncestors(horse.father, actualGeneration + 1, maxGeneration);
    horseData.motherTree = await getAncestors(horse.mother, actualGeneration + 1, maxGeneration);

    return horseData;
}

router.get("/horses/:id/pedigree", ensureAuthenticated, async (req, res) => {
    try {
        const horseID = req.params.id;
        const depth = parseInt(req.query.generations) || 3;
        const tree = await getAncestors(horseID, 1, depth);

        res.render("pedigree", {
            horse: tree,
            generations: depth
        });

    } catch(err) {
        return res.status(500).send("Błąd przy ładowaniu serwera!");
    }
})

export default router;