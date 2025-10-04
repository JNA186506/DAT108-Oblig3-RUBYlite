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
    state;

    constructor(root) {
        this.root = root;
        this.startnummer = root.querySelector("#startnummer");
        this.navn = root.querySelector("#navn");
        this.sluttid = root.querySelector("#sluttid");
        this.table = document.getElementById("entries");
        this.tbody = this.table.querySelector("tbody");
        const pagination = root.querySelector("#pagination");
        this.deltagerTabell = [];
        this.state = {
            'querySet': this.deltagerTabell,
            'page': 1,
            'rows': 20
        }
        if (pagination) {
            pagination.addEventListener('click',
                this.handlePageClick.bind(this));
        }
    }

    pagination(querySet, currPage, rows) {
        const trimStart = (currPage - 1) * rows;
        const trimEnd = trimStart + rows;

        const trimmedData = querySet.slice(trimStart, trimEnd);

        const pages = Math.ceil(querySet.length / rows);

        return {
            'querySet': trimmedData,
            'pages': pages
        }
    }

    handlePageClick(event) {
        const clickedElement = event.target;

        if (clickedElement.classList.contains('page')) {
            const newPage = clickedElement.getAttribute('data-page');
            this.state.page = parseInt(newPage, 10);
            this.renderTable();
        }
    }

    leggTilDeltagerITabell() {
        if(this.validateForm()) {
            const deltager = new Deltager(
                this.startnummer.value,
                this.navn.value,
                this.sluttid.value
            );

            this.deltagerTabell.push(deltager);
            console.log(this.deltagerTabell);
            this.sortDeltagere();
            this.renderTable();
        }
    }

    leggTilDeltagerITabellFraCSV(deltager) {
        this.deltagerTabell.push(deltager);
    }

    resetTable() {
        this.tbody.innerHTML = "";
        this.state.querySet = [...this.deltagerTabell];
        this.state.page = 1;
        this.renderTable();
    }

    renderTable() {
        this.tbody.innerHTML = "";

        const data =
            this.pagination(this.state.querySet, this.state.page, this.state.rows);

        const offset = (this.state.page - 1) * this.state.rows;

        data.querySet.forEach(((deltager, i) => {
                const row = document.createElement("tr");
                const actualIndex = offset + i + 1;
                row.innerHTML = `
                    <td>${actualIndex}</td>
                    <td>${deltager.navn}</td>
                    <td>${deltager.startnummer}</td>
                    <td>${deltager.sluttid}</td>
                `;
                this.tbody.appendChild(row)
            }));
            this.table.classList.remove("hidden");
            this.pageButtons(data.pages);

            this.navn.value = "";
            this.sluttid.value = "";
            this.startnummer.focus();
    }

    pageButtons(pages) {
        const wrapper = root.querySelector("#pagination");
        wrapper.innerHTML = "";

        const fragment = document.createDocumentFragment();

        for (let page = 1; page <= pages; page++) {
            const button = document.createElement('button');
            button.setAttribute('data-page', page);
            button.className = 'page btn btn-sm btn-info';
            button.textContent = page;

            if (page === this.state.page) {
                button.classList.add('active');
            }

            fragment.appendChild(button);
        }

        wrapper.appendChild(fragment);
    }

    finnDeltagere() {
        const fraTid = document.getElementById("fra");
        const tilTid = document.getElementById("til");

        const fraTidValue = document.getElementById("fra").value;
        const tilTidValue = document.getElementById("til").value;

        if (fraTidValue > tilTidValue) {
            fraTid.classList.add("invalidInput");
            tilTid.classList.add("invalidInput");
            tilTid.setCustomValidity("Fra kan ikke være større enn til");
            tilTid.reportValidity();
            return;
        }

        const utvalgTabell = this.deltagerTabell.filter(deltager => deltager.sluttid.localeCompare(fraTidValue) >= 0
                && deltager.sluttid.localeCompare(tilTidValue) <= 0);

        fraTid.value = "";
        tilTid.value = "";
        fraTid.classList.remove("invalidInput");
        tilTid.classList.remove("invalidInput");
        tilTid.setCustomValidity("");

        this.state.querySet = utvalgTabell;
        this.state.page = 1;

        this.renderTable();
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

    lastOppFil(file) {
        if (!file) {
            console.error("Ingen fil valgt");
            return;
        }

        if (!file.name.endsWith('.csv')) {
            alert("Vennligst velg en CSV-fil");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                this.deltagereFraFil(e.target.result, ',');
            } catch (error) {
                console.error("Feil ved lesing av fil:", error);
                alert("Kunne ikke laste inn filen. Sjekk formatet.");
            }
        };

        reader.onerror = () => {
            console.error("Feil ved lesing av fil");
            alert("Kunne ikke lese filen");
        };

        reader.readAsText(file);
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

        this.sortDeltagere();
        this.renderTable();

        return formedArr;
    }

    sortDeltagere() {
        this.deltagerTabell.sort((a,b) => a.sluttid.localeCompare(b.sluttid));
        this.state.querySet = this.deltagerTabell;
    }
}
const deltagerManager = new DeltagerManager(root);

lastOpp.addEventListener("click", function(event) {
    event.preventDefault();
    const file = filInput.files[0];
    deltagerManager.lastOppFil(file);
    filInput.value = "";
})

btn.addEventListener("click", () => deltagerManager.leggTilDeltagerITabell());
sortBtn.addEventListener("click", () => deltagerManager.finnDeltagere());
resetBtn.addEventListener("click", () => deltagerManager.resetTable());