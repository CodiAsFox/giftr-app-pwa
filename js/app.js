import SeWo from "./sewo.js";
import CACHE from "./cache.js";

const APP = {
  currentPage: null,
  activePerson: null,
  cacheName: "pwa-cache-thing",
  dataStorage: [],

  init() {
    SeWo.init();
    APP.loadPeople();
    APP.loadPage("home");
    APP.addListeners();
  },
  addListeners() {
    document.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        APP.buttonHandler(btn, ev);
      });
    });

    document
      .querySelector(".logo")
      .addEventListener("click", () => APP.loadPage("home"));
  },
  buttonHandler(btn, ev) {
    ev.preventDefault();
    const target = btn.getAttribute("target-page");
    const action = btn.getAttribute("target-action");

    info(target, action);
    if (target) APP.getTarget(target, ev);
    if (action) APP.doAction(action, ev);
  },
  getTarget(target, ev) {
    switch (target) {
      case "back":
        APP.backPage();
        break;
      case "add-person":
        APP.loadPage(target);
        APP.addPeople();
        break;
      case "add-gift":
        APP.loadPage(target);
        APP.addGift();
        break;
      case "gift-list":
        const list = ev.target.closest(".person");
        if (!list) return;
        APP.activePerson = list.getAttribute("data-personID");
        APP.loadPage(target);
        APP.showGifts();
        break;
    }
  },
  doAction(action, ev) {
    switch (action) {
      case "save-person":
        APP.addNewPerson();
        break;
      case "save-gift":
        APP.saveGift();
        break;
      case "edit-person":
        const person = ev.target.closest(".person");
        if (!person) return;
        APP.activePerson = person.getAttribute("data-personID");
        APP.loadPage("add-person");
        APP.editPeople();
        break;
    }
  },
  loadPeople() {
    CACHE.init(APP.cacheName, 1)
      .then(() => CACHE.getAll())
      .then((requests) =>
        Promise.all(requests.map((request) => CACHE.get(request)))
      )
      .then((responses) =>
        Promise.all(responses.map((response) => JSON.parse(response)))
      )
      .then((objects) => {
        objects.forEach((obj) => APP.dataStorage.push(obj));
        APP.getSavedPeople();
      })
      .catch(APP.displayError);
  },
  backPage() {
    const page = APP.currentPage.id;

    warn(page);
    switch (page) {
      case "page-add-gift":
        APP.loadPage("gift-list");
        break;
      default:
        APP.loadPage("home");
        break;
    }
  },
  loadPage(page) {
    const active = document.querySelector("[active]");
    const navBtns = document.querySelectorAll(".main-nav button");
    if (active) {
      active.removeAttribute("active");
    }

    navBtns.forEach((btn) => (btn.disabled = true));

    APP.currentPage = document.getElementById(`page-${page}`);
    APP.currentPage.setAttribute("active", true);

    switch (page) {
      case "home":
        navBtns.item(1).disabled = false;
        APP.getSavedPeople();
        break;
      case "add-person":
        navBtns.item(0).disabled = false;
        break;
      case "gift-list":
        navBtns.item(2).disabled = false;
        navBtns.item(0).disabled = false;
        break;
      case "add-gift":
        navBtns.item(0).disabled = false;
        break;
    }

    return APP.currentPage;
  },
  addPeople() {
    const page = APP.currentPage;
    const title = page.querySelector("h2");
    title.innerHTML = "Add person.";
    page.querySelector("#personIntake").reset();
    page.querySelector("[target-action=save-person]").disabled = false;
  },
  editPeople() {
    const page = APP.currentPage;
    const title = page.querySelector("h2");
    const person = APP.dataStorage.find((p) => p.id === APP.activePerson);

    if (!APP.activePerson) {
      APP.addPeople();
      return false;
    }

    title.innerHTML = `Edit ${person.name}.`;

    page.querySelector("[target-action=save-person]").disabled = false;
    page.querySelector("[target-action=remove-person]").disabled = false;
    page.querySelector("[target-action=save-export]").disabled = false;
    const birthdate = new Date(person.dob);
    document.getElementById("name").value = person.name;
    document.getElementById("dob").value = birthdate
      .toISOString()
      .split("T")[0];
  },
  getSavedPeople() {
    const personList = APP.currentPage.querySelector(".content");

    if (APP.dataStorage.length === 0) {
      personList.innerHTML = `
      <h2>Currently no people saved</h2>
      <p>Click the add button in the top bar to add a person.</p>
    `;
    } else {
      personList.innerHTML = `<ul class="person-list"></ul>`;
      const list = personList.querySelector("ul");

      const peopleListing = APP.dataStorage
        .map(({ id, name, dob }) => {
          const date = new Date(dob);
          const birthdate = date.toLocaleDateString("en-CA", {
            month: "long",
            day: "numeric",
          });
          return `
          <li class="person" data-personID="${id}">
            <p class="name">${name}</p>
            <p class="dob"><time>${birthdate}</time></p>
            <p class="button-group">
              <button class="btnEdit" target-action="edit-person" title="Edit ${name} profile"><i class="material-symbols-rounded">edit</i></button>
              <button class="btnGifts" target-page="gift-list" title="Remove ${name} profile"><i class="material-symbols-rounded">redeem</i></button>
            </p>
          </li>
        `;
        })
        .join("");

      list.innerHTML = peopleListing;
      list.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          APP.buttonHandler(btn, ev);
        });
      });
      personList.appendChild(list);
    }
  },
  addNewPerson() {
    const page = APP.currentPage;
    const form = page.querySelector("#personIntake");
    const formData = form.elements;

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

    CACHE.save(`${person.id}.json`, JSON.stringify(person), "application/json")
      .then(() => {
        if (APP.activePerson === null) {
          APP.dataStorage.push(person);
        } else {
          APP.dataStorage = APP.dataStorage.map((p) => {
            return p.id === APP.activePerson ? person : p;
          });
        }

        form.reset();
        APP.loadPage("home");
      })
      .catch(APP.displayError);
  },
  addGift() {
    const page = APP.currentPage;
    const person = APP.dataStorage.find((obj) => obj.id === APP.activePerson);
    const title = page.querySelector("h2");
    title.innerHTML = `Add gift for ${person.name}.`;
    page.querySelector("#giftIntake").reset();
    page.querySelector("[target-action=save-gift]").disabled = false;
  },
  saveGift() {
    const page = APP.currentPage;
    const form = page.querySelector("#giftIntake");
    const formData = form.elements;
    const person = APP.dataStorage.find((obj) => obj.id === APP.activePerson);

    const gift = {
      id: crypto.randomUUID(),
      name: formData["idea"].value,
      store: formData["store"].value,
      url: formData["url"].value,
    };

    person.gifts.push(gift);

    CACHE.save(`${person.id}.json`, JSON.stringify(person), "application/json")
      .then(() => {
        APP.dataStorage = APP.dataStorage.map((person) =>
          person.id === APP.activePerson ? person : person
        );
        form.reset();
        APP.loadPage("gift-list");
      })
      .catch(APP.displayError);
  },
  editGift() {
    const page = APP.currentPage;
    const title = page.querySelector("h2");
    const person = APP.dataStorage.find((p) => p.id === APP.activePerson);

    if (!APP.activePerson) {
      APP.addPeople();
      return false;
    }

    title.innerHTML = `Edit ${person.name}.`;

    page.querySelector("[target-action=save-person]").disabled = false;
    page.querySelector("[target-action=remove-person]").disabled = false;
    page.querySelector("[target-action=save-export]").disabled = false;
    const birthdate = new Date(person.dob);
    document.getElementById("name").value = person.name;
    document.getElementById("dob").value = birthdate
      .toISOString()
      .split("T")[0];
  },
  showGifts() {
    const person = APP.dataStorage.find((obj) => obj.id == APP.activePerson);
    if (!person) {
      APP.loadPage("home");
      return;
    }
    const giftPage = APP.currentPage;

    if (person.gifts.length === 0) {
      giftPage.innerHTML =
        "<h2>No gifts added.</h2><p>Have an idea? Great! click on the top right button to add it.</p>";
    } else {
      giftPage.innerHTML = '<ul class="gifts"></ul>';
      const list = giftPage.querySelector("ul");
      const giftListing = person.gifts
        .map(
          (gift) => `
      <li class="gift" data-personID="${gift.id}">
        <p class="name">${gift.name}</p>
        <p class="store">${gift.store}</p>
        <p class="url"><a href="">${gift.url}</a></p>
        <p class="actions">
          <button class="btnDelete" target-action="remove-gift" title="Delete ${gift.name} idea">
            <i class="material-symbols-rounded">delete_sweep</i>
          </button>
        </p>
      </li>`
        )
        .join("");

      list.innerHTML = giftListing;
      list.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          APP.buttonHandler(btn, ev);
        });
      });
    }
  },
  displayError(err) {
    error(err);
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
