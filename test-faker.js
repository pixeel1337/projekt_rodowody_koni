import { fakerPL as faker } from "@faker-js/faker";;

let aktualny_rok = 2026;
console.log(`Źrebak urodził się w ${aktualny_rok}`);

function generujDrzewoWstecz(rokDziecka, aktualnePokolenie) {
    if(aktualnePokolenie > 6) return;

    const wiekRodzica = faker.number.int({ min: 3, max: 21 });
    const rokRodzica = rokDziecka - wiekRodzica;

    console.log(`[Pokolenie ${aktualnePokolenie}] Generuję przodka. Rok ur ${rokRodzica} (miał ${wiekRodzica} lat gdy rodziało się dziecko)`);

    generujDrzewoWstecz(rokRodzica, aktualnePokolenie + 1);
}

console.log("URUCHAMIAM MASZYNĘ SKURWYSYNY")
generujDrzewoWstecz(2026, 1);
