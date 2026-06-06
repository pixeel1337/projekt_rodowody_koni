import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { fakerPL } from "@faker-js/faker";
import { Country } from "./models/Country.js";
import { Breeder } from "./models/Breeder.js";
import { Horse } from "./models/Horse.js";

const URL = "mongodb://127.0.0.1:27017/rodowody";


const ointmentEnum = ["siwa", "gniada", "kasztanowata", "kara"];
let globalCountries = [];
let globalBreeders = [];
let horseCounter = 1;

async function generateAncestor(childBirthYear, forcedGender, currentGeneration) {
    if (currentGeneration > 6) return null;

    const fatherAgeBirth = faker.number.int({ min: 3, max: 21});
    const fatherBirthYear = childBirthYear - fatherAgeBirth;

    const motherAgeBirth = faker.number.int({ min: 3, max: 21});
    const motherBirthYear = childBirthYear - motherAgeBirth;

    const fatherID = await generateAncestor(fatherBirthYear, "ogier", currentGeneration + 1);
    const motherID = await generateAncestor(motherBirthYear, "klacz", currentGeneration + 1);


    // Ustawiamy domyślny prefiks
    let prefix = "Koń";
    
    // Jeśli to pokolenie 2, to jest to bezpośredni rodzic źrebaka
    if (currentGeneration === 2) prefix = forcedGender === "ogier" ? "Ojciec" : "Matka";
    
    // Jeśli to pokolenie 3, to są to dziadkowie
    if (currentGeneration === 3) prefix = forcedGender === "ogier" ? "Dziadek" : "Babcia";
    
    // Jeśli pokolenie 4 lub wyższe, to są to pradziadkowie
    if (currentGeneration >= 4) prefix = forcedGender === "ogier" ? `Pradziadek-P${currentGeneration}` : `Prababcia-P${currentGeneration}`;


    const ancestor = await Horse.create({
        name: faker.person.firstName(),
        birthYear: childBirthYear,
        gender: forcedGender,
        ointment: faker.helpers.arrayElement(ointmentEnum),
        birthCountry: globalCountries[Math.floor(Math.random * globalCountries.length)]._id,
        breeder: globalBreeders[Math.floor(Math.random * globalBreeders.length)]._id,
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
        for(let i = 0; i < 15; i++) {
            countriesToInsert.push({
                name: faker.location.country(),
                code: faker.location.countryCode()
            });
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

        ////////////////////////////////////////////////////////////////
        //////          Dodanie Obsługi                           //////
        //////                Koni                                //////
        ///////////////////////////////////////////////////////////////
    } catch(err) {
        console.error("Błą podczas generowania danych: " + err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Odłączono od bazy danych!");
        process.exit(0);
    }
}

seedDatabase();