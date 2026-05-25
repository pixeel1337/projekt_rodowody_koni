import express from "express";
import { Horse } from "../models/Horse.js";
import { Country } from "../models/Country.js";
import { Breeder } from "../models/Breeder.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const horses = await Horse.find({}).populate("breeder").populate("birthCountry");
        return res.status(200).json(horses);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id).populate("breeder").populate("birthCountry");
        if(!horse) {
            return res.status(404).json({ error: "Nie znaleziono konia o podanym ID!" });
        }

        return res.status(200).json(horse);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { breeder, birthCountry } = req.body;

        if(breeder) {
            const foundBreeder = await Breeder.findOne({ name: breeder });
            if(!foundBreeder) {
                return res.status(400).json({ error: "Hodowca nie istnieje w bazie!" });
            }
            req.body.breeder = foundBreeder._id;
        }

        if(birthCountry) {
            const foundBirthCountry = await Country.findOne({ code: birthCountry.toUpperCase() });
            if(!foundBirthCountry) {
                return res.status(400).json({ error: "Kraj urodzenia o podanym kodzie ISO nie istnieje!" });
            }
            req.body.birthCountry = foundBirthCountry._id; 
        }


        const newHorse = new Horse(req.body);
        await newHorse.save();

        return res.status(201).json(newHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się dodać konia: " + err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedHorse = await Horse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatedHorse) {
            return res.status(404).json({ error: "Nie znaleziono konia do edycji!" });
        }

        return res.status(200).json(updatedHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się zakutalizować danych konia: " + err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedHorse = await Horse.findByIdAndDelete(req.params.id);
        if(!deletedHorse) {
            return res.status(404).json({ error: "Nie znaleziono konia do usunięcia" });
        }

        return res.status(200).json(deletedHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się usunąć konia: " + err.message });
    }
});

export default router;