import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { Country } from "../models/Country.js";
import { Breeder } from "../models/Breeder.js";
import { Horse } from "../models/Horse.js";

const URL = "mongodb://127.0.0.1:27017/rodowody";

const ointmentEnum = ["siwa", "gniada", "kasztanowata", "kara"];
const genderEnum = ["ogier", "klacz", "wałach"];
let globalCountries = [];
let globalBreeders = [];
let horseCounter = 1;

async function generateFatherLine(childBirthYear, currentGeneration) {
    if (currentGeneration > 6) return null;

    const fatherAgeBirth = faker.number.int({ min: 3, max: 21 });
    const fatherBirthYear = childBirthYear - fatherAgeBirth;

    const fatherID = await generateFatherLine(fatherBirthYear, currentGeneration + 1);
    const motherID = await generateMotherLine(fatherBirthYear, currentGeneration + 1);

    let prefix = "Ojciec";
    if (currentGeneration === 3) prefix = "Dziadek (ojciec ojca)";
    if (currentGeneration >= 4) prefix = `Pradziadek-P${currentGeneration}`;

    const ancestor = await Horse.create({
        name: `${prefix} ${faker.person.firstName()} #${horseCounter++}`,
        birthYear: fatherBirthYear,
        gender: "ogier",
        ointment: faker.helpers.arrayElement(ointmentEnum),
        birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
        breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
        father: fatherID,
        mother: motherID
    });

    return ancestor._id;
}

async function generateMotherLine(childBirthYear, currentGeneration) {
    if (currentGeneration > 6) return null;

    const motherAgeBirth = faker.number.int({ min: 3, max: 21 });
    const motherBirthYear = childBirthYear - motherAgeBirth;

    const fatherID = await generateFatherLine(motherBirthYear, currentGeneration + 1);
    const motherID = await generateMotherLine(motherBirthYear, currentGeneration + 1);

    let prefix = "Matka";
    if (currentGeneration === 3) prefix = "Babcia (matka matki)";
    if (currentGeneration >= 4) prefix = `Prababcia-P${currentGeneration}`;

    const ancestor = await Horse.create({
        name: `${prefix} ${faker.person.firstName()} #${horseCounter++}`,
        birthYear: motherBirthYear,
        gender: "klacz",
        ointment: faker.helpers.arrayElement(ointmentEnum),
        birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
        breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
        father: fatherID,
        mother: motherID
    });

    return ancestor._id;
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
        const countriesToInsert = [];
        const usedCodes = new Set();

        while (countriesToInsert.length < 15) {
            const code = faker.location.countryCode();
            if (!usedCodes.has(code)) {
                usedCodes.add(code);
                countriesToInsert.push({
                    name: faker.location.country(),
                    code: code
                });
            }
        }
        globalCountries = await Country.insertMany(countriesToInsert);

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

            await Horse.create({
                name: `Źrebak ${faker.person.firstName()} #${horseCounter++}`,
                birthYear: mainHorseBirthYear,
                gender: gender,
                ointment: faker.helpers.arrayElement(ointmentEnum),
                birthCountry: globalCountries[Math.floor(Math.random() * globalCountries.length)]._id,
                breeder: globalBreeders[Math.floor(Math.random() * globalBreeders.length)]._id,
                father: fatherID,
                mother: motherID
            });
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