import express from "express";
import { Horse } from "../models/Horse.js";
import { Country } from "../models/Country.js";
import { Breeder } from "../models/Breeder.js";
import { name } from "ejs";

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

router.get("/:name/:birthYear", async (req, res) => {
    try {
        const horse = await Horse.findOne({ 
            name: req.params.name, 
            birthYear: parseInt(req.params.birthYear) 
        })
        .populate("breeder")
        .populate("birthCountry")
        .populate("father")
        .populate("mother");

        if(!horse) {
            return res.status(404).json({ message: "Nie znaleziono konia o podanych danych!" });
        }

        return res.status(200).json(horse);
    } catch(err) {
        return res.status(500).json({ error: "Błąd bazy danych: " + err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, birthYear, gender, ointment, breeder, birthCountry, father, mother } = req.body;

        if(!name || !birthYear || !gender || !ointment || !birthCountry || !breeder) {
            return res.status(400).json({ error: "Niekompletne dane!" });
        }

        const horseData = {
            name, 
            birthYear: parseInt(birthYear),
            gender,
            ointment, 
            notes: req.body.notes
        }

        const foundBreeder = await findBreederByUserID(breeder);
        if(!foundBreeder) {
            return res.status(400).json({ error: "Hodowca nie istnieje w bazie!" });
        }
        horseData.breeder = foundBreeder._id;

        const foundCountry = await Country.findOne({ code: birthCountry.toUpperCase() });
        if(!foundCountry) {
            return res.status(400).json({ error: "Kraj nie istnieje w bazie!" });
        }
        horseData.birthCountry = foundCountry._id;

        if(father) {
            const foundFather = await findHorseByUserID(father);
            if(!foundFather) {
                return res.status(400).json({ error: "Wskazany ojciec nie istnieje w bazie!" });
            }
            horseData.father = foundFather._id;
        }

        if(mother) {
            const foundMother = await findHorseByUserID(mother);
            if(!foundMother) {
                return res.status(400).json({ error: "Wskazana matka nie istnieje w bazie!" });
            }
            horseData.mother = foundMother._id;
        }

        const newHorse = new Horse(horseData);
        await newHorse.save()
        return res.status(201).json(newHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się dodać konia: " + err.message });
    }
});

router.patch("/:name/:birthYear", async (req, res) => {
    try {
        const horseName = req.params.name;
        const horseBirthYear = parseInt(req.params.birthYear);

        const horse = await Horse.findOne({ name: horseName, birthYear: horseBirthYear });
        if(!horse) {
            return res.status(404).json({ message: "Nie znaleziono konia do edycji!" });
        }

        const { name, birthYear, gender, ointment, breeder, birthCountry, father, mother } = req.body;

        if (name) horse.name = name;
        if (birthYear) horse.birthYear = parseInt(birthYear);
        if (gender) horse.gender = gender;
        if (ointment) horse.ointment = ointment;
        if (req.body.notes !== undefined) horse.notes = req.body.notes;

        if (breeder) {
            const foundBreeder = await findBreederByUserID(breeder);
            if (!foundBreeder) return res.status(400).json({ error: `Hodowca '${breeder}' nie istnieje!` });
            horse.breeder = foundBreeder._id;
        }

        if (birthCountry) {
            const foundCountry = await Country.findOne({ code: birthCountry.toUpperCase() });
            if (!foundCountry) return res.status(400).json({ error: `Kraj o kodzie ISO '${birthCountry}' nie istnieje!` });
            horse.birthCountry = foundCountry._id;
        }

        if (father) {
            const foundFather = await findHorseByUserID(father);
            if (!foundFather) return res.status(400).json({ error: `Wskazany ojciec '${father}' nie istnieje!` });
            horse.father = foundFather._id;
        }

        if (mother) {
            const foundMother = await findHorseByUserID(mother);
            if (!foundMother) return res.status(400).json({ error: `Wskazana matka '${mother}' nie istnieje!` });
            horse.mother = foundMother._id;
        }
        
        await horse.save();

        return res.status(200).json(horse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się zaktualizować danych konia: " + err.message });
    }
});

router.delete("/:name/:birthYear", async (req, res) => {
    try {
        const deletedHorse = await Horse.findOneAndDelete({ 
            name: req.params.name, 
            birthYear: parseInt(req.params.birthYear) 
        });

        if(!deletedHorse) {
            return res.status(404).json({ message: "Nie znaleziono konia do usunięcia!" });
        }

        return res.status(200).json(deletedHorse);
    } catch(err) {
        return res.status(400).json({ error: "Nie udało się usunąć konia: " + err.message });
    }
});

router.get("/:name/:birthYear/delete", async (req, res) => {
    try {
        const deletedHorse = await Horse.findOneAndDelete({ 
            name: req.params.name, 
            birthYear: parseInt(req.params.birthYear) 
        });

        if(!deletedHorse) {
            return res.status(404).send("Nie znaleziono konia do usunięcia!");
        }

        return res.redirect("/dashboard");
    } catch(err) {
        return res.status(500).send("Błąd serwera podczas usuwania: " + err.message);
    }
});

router.get("/:name/:birthYear/offspring", async (req, res) => {
    try {
        const parentName = req.params.name;
        const parentBirthYear = parseInt(req.params.birthYear);

        const parent = await Horse.findOne({ name: parentName, birthYear: parentBirthYear });
        
        if (!parent) {
            return res.status(404).json({ message: "Nie znaleziono konia-rodzica o podanych danych!" });
        }

        const offspring = await Horse.find({
            $or: [
                { father: parent._id },
                { mother: parent._id }
            ]   
        })
        .populate("breeder")
        .populate("birthCountry");

        return res.status(200).json({
            parent: {
                name: parent.name,
                birthYear: parent.birthYear,
                gender: parent.gender
            },
            count: offspring.length,
            offspring: offspring
        });

    } catch (err) {
        return res.status(500).json({ error: "Błąd podczas pobierania potomstwa: " + err.message });
    }
});

export default router;