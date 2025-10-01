"use strict";

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
            this.renderTable();
        }
    }

    renderTable() {
        this.tbody.innerHTML = "";
        this.deltagerTabell.forEach( ((deltager, i) => {
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
        this.startnummer.focus();
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
}


const root = document.getElementById("root");
const btn = root.querySelector("#btn")

const deltagerManager = new DeltagerManager(root);

btn.addEventListener("click", () => deltagerManager.leggTilDeltagerITabell());
