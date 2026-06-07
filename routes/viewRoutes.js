import express from "express";
import { Horse } from "../models/Horse.js";

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


// router.get("/dashboard", ensureAuthenticated, async (req, res) => {
//     try {
//         const searchQuery = req.query.search || "";
//         const genderQuery = req.query.gender || "";
//         let query = {};

//         if(searchQuery) {
//             query.name = { $regex: searchQuery, $options: "i"};
//         }

//         if(genderQuery) {
//             query.gender = genderQuery;
//         }

//         const horses = await Horse.find({query});

//         res.render("dashboard", {
//             admin: req.user,
//             horses: horses,
//             searchQuery: searchQuery
//         })
//     } catch(err) {
//         res.status(500).send("Błąd serwera przy ładowaniu panelu!");
//     }
// });

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
    try {
        // .trim() usuwa przypadkowe spacje z początku i końca tekstu
        const searchQuery = (req.query.search || "").trim();
        const genderQuery = req.query.gender || "";
        
        let query = {};

        // 🔥 Sprawdzamy, czy użytkownik WPISAŁ coś sensownego (długość tekstu większa niż 0)
        if (searchQuery.length > 0) {
            query.name = { $regex: searchQuery, $options: "i" };
        }

        // 🔥 Sprawdzamy, czy użytkownik WYBRAŁ płeć inną niż domyślna pusta opcja
        if (genderQuery !== "") {
            // Bezpieczna wersja ignorująca wielkość liter w bazie (ogier / Ogier)
            query.gender = { $regex: `^${genderQuery}$`, $options: "i" };
        }

        // Dla świętego spokoju – zobaczysz w terminalu, co faktycznie leci do MongoDB
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


export default router;