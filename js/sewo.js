const SeWo = {
  isOnline: "onLine" in navigator && navigator.onLine,
  init() {
    SeWo.registerWorker();
    SeWo.addListeners();
  },
  addListeners() {
    const header = document.querySelector(".offline--indicator");
    window.addEventListener("NetworkError", SeWo.handleError);
    window.addEventListener("error", SeWo.handleError);
    if (!SeWo.isOnline) {
      header.innerHTML = `<p>You are offline.`;
      header.classList.add("red");
      header.classList.remove("green");
    }
    window.addEventListener("online", () => {
      header.innerHTML = `<p>Back online.</p>`;
      header.classList.remove("red");
      header.classList.add("green");

      setTimeout(() => {
        header.classList.remove("red");
        header.innerHTML = "";
      }, 5000);
    });
    window.addEventListener("offline", () => {
      header.innerHTML = `<p>Internet Connection lost. Trying to reconnect.`;
      header.classList.add("red");
      header.classList.remove("green");
    });
  },

  registerWorker() {
    // Check if service workers are supported
    if ("serviceWorker" in navigator) {
      // Register the sw.js file
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          console.info("The service worker was registered successfully.");
        })
        .catch((err) => {
          console.error("Service Worker Failed:", err);
          throw new NetworkError("Error registering service worker");
        });
    } else {
      console.error("Your browser do not support Service workers");
    }
  },
  handleError(ev) {
    displayError(ev.message, "warn");
    console.warn(err.message);
  },
};

export default SeWo;
