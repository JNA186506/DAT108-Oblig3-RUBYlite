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
    tdbody;

    constructor(root) {
        this.root = root;
        this.startnummer = root.querySelector("#startnummer");
        this.navn = root.querySelector("#navn");
        this.sluttid = root.querySelector("#sluttid");
        this.tdbody = root.querySelector("#entries");
    }

    leggTilDeltagerITabell() {

        if(this.validateForm()) {
            const deltager = new Deltager(
                this.startnummer.value,
                this.navn.value,
                this.sluttid.value
            );

            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${deltager.navn}</td>
            <td>${deltager.startnummer}</td>
            <td>${deltager.sluttid}</td>
            `;
            this.tdbody.appendChild(row);
            this.tdbody.classList.remove("hidden");

            this.navn.value = "";
        }
    }

    validateForm() {
        const startnummerInput = parseInt(this.startnummer.value);
        const validNavnInput = this.navn.value.test("/^[0-9a-zA-Z]+$/");

        if (isNaN(startnummerInput) || this.navn.value === "" || validNavnInput) {
            console.log("Invalid input");
            alert("Form is not valid, check input and try again");
            return;
        }
        return true;
    }
}


const root = document.getElementById("root");
const btn = root.querySelector("#btn")

const deltagerManager = new DeltagerManager(root);

btn.addEventListener("click", () => deltagerManager.leggTilDeltagerITabell());
