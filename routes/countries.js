import express from "express";
import { Country } from "../models/Country.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const countries = await Country.find({});

        return res.status(200).json(countries);

    } catch(err) {
        res.status(500).json({ error: "Błąd serwera: " + err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);
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
        const newCountry = new Country(req.body);
        await newCountry.save();

        return res.status(201).json(newCountry);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się zapisać kraju: " + err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedCountry = await Country.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatedCountry) {
            return res.status(404).json({ message: "Nie znaleziono kraju do edycji!" });
        }

        return res.status(200).json(updatedCountry);
    } catch(err) {
        res.status(400).json({ error: "Błąd podczas edycji" + err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedCountry = await Country.findByIdAndDelete(req.params.id);
        if(!deletedCountry) {
            return res.status(404).json({ message: "Nie znaleziono kraju do usunięcia!" });
        }

        return res.status(200).json(deletedCountry);

    } catch(err) {
        res.status(400).json({ error: "Błąd podczas usuwania danych: " + err.message })
    }
});

export default router;