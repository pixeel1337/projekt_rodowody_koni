import express from "express";
import { Breeder } from "../models/Breeder.js";
import { Country } from "../models/Country.js";

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const breeders = await Breeder.find({}).populate("country");

        return res.status(200).json(breeders);
    } catch(err) {
        return res.status(500).json({ error: "Błąd serwera: " + err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const breeder = await Breeder.findById(req.params.id).populate("country");
        if(!breeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy o podanym ID!" });
        }

        return res.status(200).json(breeder)
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

        const foundCountry = await Country.findOne({ code: countryCode });
        if(!foundCountry) {
            return res.status(400).json({ error: `Kraj o podanym kodzie ISO: ${countryCode} nie istnieje` });
        }

        req.body.country = foundCountry._id;

        const newBreeder = new Breeder(req.body);
        await newBreeder.save();

        return res.status(201).json(newBreeder);
    } catch(err) {
        res.status(400).json({ error: "Nie udało się dodać hodowcy: " + err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedBreeder = await Breeder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidatos: true }
        )

        if(!updatedBreeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy do edycji"});
        }

        res.status(200).json(updatedBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Błąd podczas edycji: " + err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedBreeeder = await Breeder.findByIdAndDelete(req.params.id);
        if(!deletedBreeeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy do usunięcia: "});
        }

       return res.status(200).json(deletedBreeeder);
    } catch(err) {
        res.status(400).json({ error: "Błąd podczas usuwania danych: " + err.message });
    }
});

export default router;