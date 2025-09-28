"use strict";
/* const root = document.getElementById("root");
const registrering = root.querySelector(".registrering");
const startnummerInput = registrering.querySelector("#startnummer");
const btn = registrering.querySelector("#btn")

btn.addEventListener("click", func)

function func() {
    const nummer = startnummerInput.value;
    console.log(nummer);
} */

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
    }
}

const root = document.getElementById("root");
const deltagerManager = new DeltagerManager(root);

root.addEventListener("click", deltagerManager.leggTilDeltagerITabell);