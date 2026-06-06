import { fakerPL as faker } from "@faker-js/faker";;

const imie = faker.person.firstName();
const nazwisko = faker.person.lastName();

const rok = faker.number.int({ min: 2000, max: 2026} );
const zwierze = faker.animal.horse();

console.log("Imie: " + imie);
console.log("nazwisko" + nazwisko);
console.log("rok: " + rok);
console.log("koń: ", zwierze);

