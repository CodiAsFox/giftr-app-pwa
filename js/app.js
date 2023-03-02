import SeWo from "./sewo.js";
import CACHE from "./cache.js";

const APP = {
  currentPage: "page-home",
  activePerson: null,
  cache: null,
  cacheName: "pwa-cache-thing",
  dataStorage: [],

  init() {
    CACHE.init(APP.cacheName, 1);
    APP.loadPage("home");
    APP.addListeners();
  },
  addListeners() {
    document.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        APP.buttonHandler(btn, ev);
      });
    });
  },
  buttonHandler(btn, ev) {
    ev.preventDefault();
    const target = btn.getAttribute("target-page");
    const action = btn.getAttribute("target-action");

    if (target) APP.getTarget(target, ev);
    if (action) APP.doAction(action, ev);
  },
  getTarget(target, ev) {
    switch (target) {
      case "back":
        APP.backPage();
        break;
      case "gift-list":
        const list = ev.target.closest(".person");
        if (!list) return;

        APP.activePerson = list.getAttribute("data-personID");
        APP.loadPage(target);
        APP.showGifts();
        break;
      default:
        const page = APP.loadPage(target);
        switch (target) {
          case "person":
            const title = page.querySelector("h2");
            if (!APP.activePerson) {
              title.innerHTML = "Add person.";
              page.querySelector("#personIntake").reset();
              page.querySelector(
                "[target-action=save-person]"
              ).disabled = false;
            } else {
              title.innerHTML = `Edit ${person.name}.`;
              document.getElementById("btnExport").classList.remove("hidden");
              document
                .getElementById("btnDeletePerson")
                .classList.remove("hidden");
              let person = APP.dataStorage.find(
                (p) => p.id === APP.activePerson
              );
              let d = new Date(person.dob);
              let timeStr = d.toISOString().split("T")[0];
              document.getElementById("name").value = person.name;
              document.getElementById("dob").value = timeStr;
            }
            break;
        }
        break;
    }
  },
  doAction(action, ev) {
    switch (action) {
      case "save-person":
        APP.addNewPerson();
        break;
    }
  },

  backPage() {},
  loadPage(page) {
    const active = document.querySelector("[active]");
    if (active) {
      active.removeAttribute("active");
    }

    APP.currentPage = document.getElementById(`page-${page}`);
    APP.currentPage.setAttribute("active", true);

    return APP.currentPage;
  },

  showGifts() {
    const file = `${APP.activePerson}.json`;
    const data = CACHE.get(file);
    const person = JSON.parse(data);
    // Do something with person's gifts
  },
  getSavedPeople() {
    const results = CACHE.getAll();
    const data = Promise.all(results.map((result) => CACHE.get(result)));
    const people = data.map((d) => JSON.parse(d));
    APP.dataStorage = people;
  },
  addNewPerson() {
    const page = APP.currentPage;
    const formData = page.getElementById("personIntake").elements;

    let person = {};

    if (APP.activePerson === null) {
      person = {
        id: crypto.randomUUID(),
        name: "",
        dob: "",
        gifts: [],
      };
    } else {
      person = APP.dataStorage.find((obj) => obj.id === APP.activePerson);
    }

    person.name = formData["name"].value;
    person.dob = new Date(formData["dob"].value).valueOf();

    const fileName = `${person.id}.json`;
    const fileType = "application/json";
    const fileData = JSON.stringify(person);

    CACHE.save(fileName, fileData, fileType);

    if (APP.activePerson === null) {
      APP.dataStorage.push(person);
    } else {
      APP.dataStorage = APP.dataStorage.map((p) => {
        return p.id === APP.activePerson ? person : p;
      });
    }

    const form = page.querySelector("#personIntake");
    form.reset();
    APP.loadPage("home");
  },
  deletePerson() {},

  displayError(err) {
    console.error(err);
  },
};

export default APP;

document.addEventListener("DOMContentLoaded", APP.init);
