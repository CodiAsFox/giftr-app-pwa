const SeWo = {
  isOnline: navigator.onLine,
  init() {
    SeWo.registerWorker();
    SeWo.addListeners();
  },
  addListeners() {
    const header = document.querySelector(".offline--indicator");
    window.addEventListener("offline", () => {
      header.innerHTML = `<p>You are offline.</p>`;
      header.classList.add("red");
      header.classList.remove("green");
    });
    window.addEventListener("online", () => {
      header.innerHTML = `<p>Back online.</p>`;
      header.classList.remove("red");
      header.classList.add("green");

      setTimeout(() => {
        header.classList.remove("green");
        header.innerHTML = "";
      }, 5000);
    });
  },
  registerWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          console.info("The service worker was registered successfully.");
        })
        .catch((err) => {
          console.error("Service Worker Failed:", err);
          throw new Error("Error registering service worker");
        });
    } else {
      console.error("Your browser does not support Service workers");
    }
  },
};

export default SeWo;
