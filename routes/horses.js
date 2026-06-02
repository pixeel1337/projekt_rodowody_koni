import express from "express";
import { Horse } from "../models/Horse.js";
import { Country } from "../models/Country.js";
import { Breeder } from "../models/Breeder.js";

const router = express.Router();

async function findHorseByUserID(identifier) {
    if(!identifier) return null;

    const parts = identifier.trim().split(/\s+/);
    const name = parts[0];

    if(parts.length === 1) {
        return await Horse.findOne({ name });
    }

    if(parts.length === 2 && !isNaN(parts[1])) {
        return await Horse.findOne({ name, birthYear: parseInt(parts[1])});
    } 

    if(parts.length === 3) {
        const countryCode = parts[1].toUpperCase();
        const birthYear = parseInt(parts[2]);

        const country = await Country.findOne({ code: countryCode });
        if(!country) return null;

        return await Horse.findOne({ name, birthCountry: country._id, birthYear });
    }

    return null;
}

async function findBreederByUserID(identifier) {
    if(!identifier) return null;

    const parts = identifier.trim().split(/\s+/);

    if(parts.length === 1) {
        return await Breeder.findOne({ name: parts[0] });
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2) {
        const country = await Country.findOne({ code: lastPart.toUpperCase() });
        if(country) {
            const breederName = parts.slice(0, -1).join(" ");
            return await Breeder.findOne({ name: breederName, country: country._id });
        }
    }

     return await Breeder.findOne({ name: parts.join(" ") });
}

router.get("/", async (req, res) => {
    try {
        const horses = await Horse.find({})
        .populate("breeder")
        .populate("birthCountry")
        .populate("father")
        .populate("mother");

        return res.status(200).json(horses);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id)
        .populate("breeder")
        .populate("birthCountry")
        .populate("father")
        .populate("mother");

        if(!horse) {
            return res.status(404).json({ message: "Nie znaleziono konia o podanym ID!" });
        }

        return res.status(200).json(horse);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { breeder, birthCountry, father, mother } = req.body;

        if(breeder) {
            const foundBreeder = await findBreederByUserID(breeder);
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

        if(father) {
            const foundFather = await findHorseByUserID(father);
            if(!foundFather) {
                return res.status(400).json({ error: "Ojciec nie istnieje w bazie!" });
            }
            req.body.father = foundFather._id;
        }

        if(mother) {
            const foundMother = await findHorseByUserID(mother);
            if(!foundMother) {
                return res.status(400).json({ error: "Matka nie istnieje w bazie!" });
            }
            req.body.mother = foundMother._id; 
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
            return res.status(404).json({ message: "Nie znaleziono konia do edycji!" });
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
            return res.status(404).json({ message: "Nie znaleziono konia do usunięcia" });
        }

        return res.status(200).json(deletedHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się usunąć konia: " + err.message });
    }
});

export default router;