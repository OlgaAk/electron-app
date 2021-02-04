const electron = require("electron");
const { ipcRenderer } = electron;
const text = document.getElementById("alertMessage");

console.log(ipcRenderer);
ipcRenderer.on("message", function (e, message) {
  console.log("got message " + message);
  text.innerText = message;
});
