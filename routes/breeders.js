import express from "express";
import { Breeder } from "../models/Breeder.js";
import { Country } from "../models/Country.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        const { name, countryCode } = req.query;
        if(!name) {
            return res.status(400).json({ error: "Parametr name jest wymagany!" });
        }

        if(countryCode) {
            const country = await Country.findOne({ code: countryCode.toUpperCase() });
            if(!country) {
                return res.status(404).json({ error: "Nie znaleziono kraju o podanym kodzie ISO!" });
            }

            const breeder = await Breeder.findOne({ name: name, country: country._id });
            if(!breeder) {
                return res.status(404).json({ message: "Nie znaleziono hodowcy o podanych parametrach!" });
            }
            return res.json(breeder);
        }

        const breeders = await Breeder.find({ name: name }).populate("country");
        if(breeders.length === 0) {
            return res.status(404).json({ error: "Nie znaleziono hodowcy o podanej nazwie!" });
        }
        
        if(breeders.length > 1) {
            return res.status(400).json({
                error: "Podana nazwa hodowcy występuje w bazie więcej niż raz!",
                message: "Znaleziono wielu hodowców o tej nazwie. Wymagany kod kraju!",
                wyniki: breeders.map(b => ({ id: b._id, nazwa: b.name, kraj: b.country.code }))
            })
        }

        return res.json(breeders[0]);
    } catch(err) {
        return res.status(500).json({ error: "Błąd serwera" + err.message });
    }
});

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
        const breederName = req.body.name;
        if(!countryCode || !breederName) {
            return res.status(400).json({ error: "Pola 'country' oraz 'name' są wymagane!" });
        }

        const existingBreeder = await Breeder.findOne({ name: breederName });
        if(existingBreeder) {
            return res.status(400).json({ error: "Hodowca o podanej nazwie istnieje już w bazie!" });
        }

        const foundCountry = await Country.findOne({ code: countryCode.toUpperCase() });
        if(!foundCountry) {
            return res.status(400).json({ error: `Kraj o podanym kodzie ISO: ${countryCode} nie istnieje` });
        }

        const newBreeder = new Breeder({ name: breederName, country: foundCountry._id });
        await newBreeder.save();
        return res.status(201).json(newBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się dodać hodowcy: " + err.message });
    }
});

router.patch("/:name", async (req, res) => {
    try {
        const breederName = req.params.name;
        const updatedName = req.body.name;
        
        const updatedData = {};

        if(updatedName) {
            if(updatedName != breederName) {
                const ifNameOccupied = await Breeder.findOne({ name: updatedName });
                if(ifNameOccupied) {
                    return res.status(400).json({ error: "Ta nazwa hodowcy już istnieje w bazie!" });
                }
            }
            updatedData.name = updatedName;
        }

        if(req.body.country) {
            const foundCountry = await Country.findOne({ code: req.body.country.toUpperCase() });
            if(!foundCountry) {
                return res.status(400).json({ error: "Kraj o podanym ISO nie znajduje się w bazie! "});
            }
            updatedData.country = foundCountry._id;
        }

        if(req.body.notes !== undefined) {
            updatedData.notes = req.body.notes;
        }

        const updatedBreeder = await Breeder.findOneAndUpdate(
            { name: breederName },
            updatedData,
            { new: true, runValidators: true }
        );

        if(!updatedBreeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy do edycji!" });
        }

        return res.status(200).json(updatedBreeder);
    } catch(err) {
        return res.status(400).json({ error: "Błąd podczas edycji: " + err.message });
    }
});

router.delete("/:name", async (req, res) => {
    try {
        const breederName = req.params.name;
        const breeder = await Breeder.findOne({ name: breederName });
        if(!breeder) {
            return res.status(404).json({ message: "Nie znaleziono hodowcy o podanej nazwie!" });
        }

        const connectedHorses = await mongoose.model("Horse").countDocuments({ breeder: breeder._id });
        if(connectedHorses > 0) {
            return res.status(400).json({ error: "Nie można usunąc hodowcy ponieważ w bazie istnieją powiązania z nim!" });
        }

        await Breeder.deleteOne({ name: breederName });
        return res.status(200).json(breeder);
    } catch(err) {
        return res.status(400).json({ error: "Błąd podczas usuwania danych: " + err.message });
    }
});

export default router;