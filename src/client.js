const Chat = require("./Chat");

window.addEventListener("load", () => {
  new Chat();
});
const modalTris = document.getElementById("modal-tris");
const modalQuar = document.getElementById("modal-quar");
document.getElementById("cancel-exit").addEventListener("click", () => {
  modalTris.style.display = "none";
});
document.getElementById("cancel-next").addEventListener("click", () => {
  modalQuar.style.display = "none";
});
document.getElementById("nextBtn").addEventListener("click", () => {
  modalQuar.classList.add("is-active");
});
document.getElementById("exitBtn").addEventListener("click", () => {
  modalTris.classList.add("is-active");
});
