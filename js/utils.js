const log = console.log;
const info = console.info;
const warn = console.warn;
const error = console.error;

class NetworkError extends Error {
  constructor(msg) {
    super(msg);
    log(this.type);
    this.type = "NetworkError";
    this.message = msg;
  }
}

function displayError(msg, type, timeout = 10000) {
  switch (type) {
    case "warn":
      warn(msg);
      break;
    case "error":
      error(msg);
      break;
  }
  const errorbanner = document.createElement("div");
  errorbanner.classList.add("info-banner");
  errorbanner.classList.add(`message-${type}`);
  const timeInSeconds = Math.floor((timeout / 1000) % 60);

  errorbanner.innerHTML = `<div class="container-inner"><p>${msg}</p><p class="bb-ft">This message will close in ${timeInSeconds} seconds</p></div>`;
  const main = document.querySelector(".system-messages");
  main.append(errorbanner);
  setTimeout(() => {
    errorbanner.classList.add("active");
    setTimeout(() => {
      errorbanner.classList.remove("active");
      setTimeout(() => {
        errorbanner.remove();
      }, 700);
    }, timeout + 10);
  }, 10);
}
