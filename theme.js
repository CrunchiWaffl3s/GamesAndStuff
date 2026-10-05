const root = document.documentElement;
const theme_panel = document.querySelector(".theme-panel");
const bgInput = document.getElementById("bgHex");
const textInput = document.getElementById("textHex");

function isValidHex(hex) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

function setCustomColor(variable, value, key) {
  if (!isValidHex(value)) return;

  root.style.setProperty(variable, value);
  localStorage.setItem(key, value);

  root.setAttribute("data-theme", "custom");
  localStorage.setItem("theme", "custom");
}

bgInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  setCustomColor("--bg", bgInput.value.trim(), "customBg");
});

textInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  setCustomColor("--text", textInput.value.trim(), "customText");
});

VanillaTilt.init(theme_panel, { max: 25, speed: 400, perspective: 1000 });