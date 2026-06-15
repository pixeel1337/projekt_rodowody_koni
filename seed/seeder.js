import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { fakerPL } from "@faker-js/faker";
import { Country } from "../models/Country.js";
import { Breeder } from "../models/Breeder.js";
import { Horse } from "../models/Horse.js";

const URL = "mongodb://127.0.0.1:27017/rodowody";

const ointmentEnum = ["siwa", "gniada", "kasztanowata", "kara"];
const genderEnum = ["ogier", "klacz", "wałach"];
let globalCountries = [];
let globalBreeders = [];


async function generateFatherLine(childBirthYear, currentGeneration) {
    if (currentGeneration > 6) return null;

    const fatherAgeBirth = faker.number.int({ min: 3, max: 21 });
    const fatherBirthYear = childBirthYear - fatherAgeBirth;

    const fatherID = await generateFatherLine(fatherBirthYear, currentGeneration + 1);
    const motherID = await generateMotherLine(fatherBirthYear, currentGeneration + 1);

    while (true) {
        try {
            const ancestor = await Horse.create({
                name: faker.person.firstName(),
                birthYear: fatherBirthYear,
                gender: "ogier",
                ointment: faker.helpers.arrayElement(ointmentEnum),
                birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
                breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
                father: fatherID,
                mother: motherID
            });
            return ancestor._id; 
        } catch (err) {
            if (err.code === 11000) {
                console.log(`Imię powtórzyło się w tym samym roku i kraju. Losuję ponownie dla ogiera...`);
                continue;
            }
            throw err; 
        }
    }
}

async function generateMotherLine(childBirthYear, currentGeneration) {
    if (currentGeneration > 6) return null;

    const motherAgeBirth = faker.number.int({ min: 3, max: 21 });
    const motherBirthYear = childBirthYear - motherAgeBirth;

    const fatherID = await generateFatherLine(motherBirthYear, currentGeneration + 1);
    const motherID = await generateMotherLine(motherBirthYear, currentGeneration + 1);

    while (true) {
        try {
            const ancestor = await Horse.create({
                name: faker.person.firstName(),
                birthYear: motherBirthYear,
                gender: "klacz",
                ointment: faker.helpers.arrayElement(ointmentEnum),
                birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
                breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
                father: fatherID,
                mother: motherID
            });
            return ancestor._id;
        } catch (err) {
            if (err.code === 11000) {
                console.log(`Imię powtórzyło się w tym samym roku i kraju. Losuję ponownie dla klaczy...`);
                continue;
            }
            throw err;
        }
    }
}

async function seedDatabase() {
    try {
        console.log("1. Łączenie z bazą danych...");
        await mongoose.connect(URL);

        console.log("2. Czyszczenie starej bazy...");
        await Country.deleteMany({});
        await Breeder.deleteMany({});
        await Horse.deleteMany({});

        console.log("3. Generowanie bazy krajów...");
        
        const staticCountries = [
            { code: "PL", name: "Polska" },
            { code: "DE", name: "Niemcy" },
            { code: "FR", name: "Francja" },
            { code: "US", name: "Stany Zjednoczone" },
            { code: "SA", name: "Arabia Saudyjska" },
            { code: "AE", name: "Zjednoczone Emiraty Arabskie" },
            { code: "GB", name: "Wielka Brytania" },
            { code: "IT", name: "Włochy" },
            { code: "ES", name: "Hiszpania" },
            { code: "BE", name: "Belgia" },
            { code: "NL", name: "Holandia" },
            { code: "SE", name: "Szwecja" },
            { code: "CA", name: "Kanada" },
            { code: "AU", name: "Australia" },
            { code: "JP", name: "Japonia" }
        ];
        
        globalCountries = await Country.insertMany(staticCountries);

        console.log("4. Generowanie bazy hodowców...");
        const breedersToInsert = [];
        for(let i = 0; i < 15; i++) {
            breedersToInsert.push({
                name: faker.person.lastName() + " Stud",
                country: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id
            });
        }
        globalBreeders = await Breeder.insertMany(breedersToInsert);

        console.log("Baza krajów oraz hodowców została pomyślnie wygenerowana!");

        console.log("Generowanie 10 źrebaków i ich drzew genealogicznych...");
        for(let i = 0; i < 10; i++) {
            const mainHorseBirthYear = faker.number.int({ min: 2022, max: 2026 });
            const gender = faker.helpers.arrayElement(genderEnum);

            const fatherID = await generateFatherLine(mainHorseBirthYear, 2);
            const motherID = await generateMotherLine(mainHorseBirthYear, 2);

            while (true) {
                try {
                    await Horse.create({
                        name: faker.person.firstName(),
                        birthYear: mainHorseBirthYear,
                        gender: gender,
                        ointment: faker.helpers.arrayElement(ointmentEnum),
                        birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
                        breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
                        father: fatherID,
                        mother: motherID
                    });
                    break;
                } catch (err) {
                    if (err.code === 11000) {
                        console.log(`Losuję ponownie imię dla głównego źrebaka...`);
                        continue;
                    }
                    throw err;
                }
            }
        }
        
        console.log("SUKCES! Baza danych została wypełniona!");

    } catch(err) {
        console.error("Błąd podczas generowania danych: " + err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Odłączono od bazy danych!");
        process.exit(0);
    }
}

seedDatabase();