"use strict";

const root = document.getElementById("root");
const btn = root.querySelector("#btn");
const sortBtn = root.querySelector("#sortBtn");
const resetBtn = root.querySelector("#resetBtn");
const filInput = root.querySelector("#opplastning")
const lastOpp = root.querySelector("#lastOpp")

class Deltager {
    startnummer;
    navn;
    sluttid;

    constructor(startnummer, navn, sluttid) {
        this.startnummer = startnummer;
        this.navn = navn;
        this.sluttid = sluttid;
    }
}

class DeltagerManager {
    root;
    startnummer;
    navn;
    sluttid;
    table;
    deltagerTabell;

    constructor(root) {
        this.root = root;
        this.startnummer = root.querySelector("#startnummer");
        this.navn = root.querySelector("#navn");
        this.sluttid = root.querySelector("#sluttid");
        this.table = document.getElementById("entries");
        this.tbody = this.table.querySelector("tbody");
        this.deltagerTabell = [];
    }

    leggTilDeltagerITabell() {
        if(this.validateForm()) {
            const deltager = new Deltager(
                this.startnummer.value,
                this.navn.value,
                this.sluttid.value
            );

            this.deltagerTabell.push(deltager);
            this.deltagerTabell.sort((a, b) => a.sluttid.localeCompare(b.sluttid));

            console.log(this.deltagerTabell);
            this.renderTable(this.deltagerTabell);
        }
    }

    leggTilDeltagerITabellFraCSV(deltager) {
        this.deltagerTabell.push(deltager);
        this.deltagerTabell.sort((a, b) => a.sluttid.localeCompare(b.sluttid));

        console.log(this.deltagerTabell);
        this.renderTable(this.deltagerTabell);
    }

    resetTable() {
        this.tbody.innerHTML = "";
        this.renderTable(this.deltagerTabell);
    }

    renderTable(tabell) {
        this.tbody.innerHTML = "";

        tabell.forEach(((deltager, i) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${deltager.navn}</td>
                    <td>${deltager.startnummer}</td>
                    <td>${deltager.sluttid}</td>
                `;
                this.tbody.appendChild(row)
            }));
            this.table.classList.remove("hidden");

            this.navn.value = "";
            this.sluttid.value = "";
            this.startnummer.focus();
    }

    finnDeltagere() {
        const fraTid = document.getElementById("fra").value;
        const tilTid = document.getElementById("til").value;

        const utvalgTabell = this.deltagerTabell.filter(deltager => deltager.sluttid.localeCompare(fraTid) >= 0
                && deltager.sluttid.localeCompare(tilTid) <= 0);

        this.renderTable(utvalgTabell);
    }

    validateForm() {
        const doesDeltagerExist = !this.deltagerTabell.some(deltager => deltager.startnummer === this.startnummer.value);

        const navnValue = this.navn.value.trim();
        const startNummerValue = this.startnummer.value.trim();

        const isValidStartnummer = /^\d+$/.test(startNummerValue);
        const isValidNavn = /^\p{L}+$/u.test(navnValue);

        this.startnummer.classList.toggle("invalidInput", (!isValidStartnummer || !doesDeltagerExist));
        this.navn.classList.toggle("invalidInput", !isValidNavn);

        const isValid = isValidStartnummer && isValidNavn && doesDeltagerExist;
        if (!isValid) console.log("Invalid input");

        return isValid;
    }

    deltagereFraFil(stringVal, splitter) {
        /* Den første consten vil ta en hel fin som tekst og splitte
        * den opp i setninger, deretter splitter den opp setningene for hvert komma.
        * Denne splitten tar for seg hver verdi lager en nøkkel altså startnummer, navn og sluttid.
        * formedArr tar for seg mappen og lager en tabell av deltagere.*/
        const [key, ...lines] = stringVal
            .trim()
            .split('\n')
            .map((item) => item.split(splitter));

        const formedArr = lines.map((line) => {
            const object = {};
            key.forEach((key, index) => {
                object[key.trim()] = line[index].trim();
            });

            const parts = object.sluttid.split(":").map(p => p.padStart(2, "0"));
            while (parts.length < 3) parts.push("00");
            object.sluttid = parts.slice(0, 3).join(":");

           return new Deltager(object.startnummer, object.navn, object.sluttid);
        });

        console.log(formedArr);
        formedArr.forEach(deltager => this.leggTilDeltagerITabellFraCSV(deltager));
        return formedArr;
    }
}

const deltagerManager = new DeltagerManager(root);

lastOpp.addEventListener("click", function(event) {
    const file = filInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvArray = deltagerManager.deltagereFraFil(e.target.result, ",");
    }
    reader.readAsText(file);
    filInput.value = "";
    event.preventDefault();
})

btn.addEventListener("click", () => deltagerManager.leggTilDeltagerITabell());
sortBtn.addEventListener("click", () => deltagerManager.finnDeltagere());
resetBtn.addEventListener("click", () => deltagerManager.resetTable());