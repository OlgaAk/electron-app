const electron = require("electron");
const { ipcRenderer } = electron;
const text = document.getElementById("alertMessage");

ipcRenderer.on("message", function (e, message) {
  console.log("got message " + message);
  text.innerText = message;
});
