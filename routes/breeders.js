import express from "express";
import { Breeder } from "../models/Breeder.js";
import { Country } from "../models/Country.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const breeders = await Breeder.find({}).populate("country");
        return res.status(200).json(breeders);
    } catch(err) {
        return res.status(500).json({ error: "Błąd serwera: " + err.message });
    }
});

router.get("/:name", async (req, res) => {
    try {
        const breederName = req.params.name;
        
        const breeder = await Breeder.findOne({ name: breederName }).populate("country");
        if(!breeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy o podanej nazwie!" });
        }

        return res.status(200).json(breeder);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const countryCode = req.body.country;
        if(!countryCode) {
            return res.status(400).json({ error: "Pole 'country' (Kod ISO) jest wymagane!" });
        }

        const foundCountry = await Country.findOne({ code: countryCode.toUpperCase() });
        if(!foundCountry) {
            return res.status(400).json({ error: `Kraj o podanym kodzie ISO: ${countryCode} nie istnieje` });
        }

        req.body.country = foundCountry._id;

        const newBreeder = new Breeder(req.body);
        await newBreeder.save();

        return res.status(201).json(newBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się dodać hodowcy: " + err.message });
    }
});

router.put("/:name", async (req, res) => {
    try {
        const breederName = req.params.name;

        if (req.body.country) {
            const foundCountry = await Country.findOne({ code: req.body.country.toUpperCase() });
            if (!foundCountry) {
                return res.status(400).json({ error: `Kraj o podanym kodzie ISO: ${req.body.country} nie istnieje` });
            }
            req.body.country = foundCountry._id;
        }

        const updatedBreeder = await Breeder.findOneAndUpdate(
            { name: breederName },
            req.body,
            { new: true, runValidators: true } 
        );

        if(!updatedBreeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy do edycji"});
        }

        return res.status(200).json(updatedBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Błąd podczas edycji: " + err.message });
    }
});

router.delete("/:name", async (req, res) => {
    try {
        const breederName = req.params.name;

        const deletedBreeder = await Breeder.findOneAndDelete({ name: breederName });
        if(!deletedBreeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy do usunięcia!" });
        }

        return res.status(200).json(deletedBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Błąd podczas usuwania danych: " + err.message });
    }
});

export default router;