import express from "express";
import { Country } from "../models/Country.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const countries = await Country.find({});

        return res.status(200).json(countries);

    } catch(err) {
        res.status(500).json({ error: "Błąd serwera: " + err.message });
    }
});

router.get("/:code", async (req, res) => {
    try {
        const countryCode = req.params.code.toUpperCase();
        const country = await Country.findOne({ code: countryCode});
        if(!country) {
            return res.status(404).json({ message: "Nie znaleziono kraju o podanym kodzie ISO!" });
        }

        return res.status(200).json(country);
    } catch(err) {
        res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const countryCode = req.body.code?.toUpperCase();
        if(!countryCode) {
            return res.status(400).json({ error: "Wymagany kod ISO kraju!" });
        }

        const existingCountry = await Country.findOne({ code: countryCode });
        if(existingCountry) {
            return res.status(400).json({ error: "Kraj o podanym ISO już istnieje w bazie!" });
        }

        const newCountry = new Country({ code: countryCode, name: req.body.name });
        await newCountry.save();
        return res.status(201).json({ message: `Pomyślnie zapisano kraj: ${newCountry.name} w bazie!` });

    } catch(err) {
        return res.status(400).json({ error: "Nie udało się zapisać kraju: " + err.message });
    }
});


router.patch("/:code", async (req, res) => {
    try {
        const countryCode = req.params.code.toUpperCase();

        if(req.body.code) {
            req.body.code = req.body.code.toUpperCase();
        }
        
        const updatedCountry = await Country.findOneAndUpdate(
            { code: countryCode },
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatedCountry) {
            return res.status(404).json({ message: "Nie znaleziono kraju do edycji!" });
        }

        return res.status(200).json(updatedCountry);
    } catch(err) {
        res.status(400).json({ error: "Błąd podczas edycji " + err.message });
    }
});

router.delete("/:code", async (req, res) => {
    try {
        const countryCode = req.params.code.toUpperCase();
        const deletedCountry = await Country.findOne({ code: countryCode });
        if(!deletedCountry) {
            return res.status(404).json({ message: "Nie znaleziono kraju do usunięcia!" });
        }

        const connectedBreeders = await mongoose.model("Breeder").countDocuments({ country: deletedCountry._id });
        const connectedHorses = await mongoose.model("Horse").countDocuments({ birthCountry: deletedCountry._id });
        if(connectedBreeders > 0 || connectedHorses > 0) {
            return res.status(400).json({ error: "Nie można usunąć kraju ponieważ w bazie istnieje powiązanie z nim!" });
        }

        await Country.deleteOne({ code: countryCode });
        return res.status(200).json(deletedCountry);

    } catch(err) {
        res.status(400).json({ error: "Błąd podczas usuwania danych: " + err.message })
    }
});

export default router;