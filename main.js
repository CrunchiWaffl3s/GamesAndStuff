const root = document.documentElement;

// Navbar stuff
const btn = document.getElementById("btn");
const panel = document.getElementById("panel");

btn.addEventListener("click", (event) => {
  panel.classList.toggle("show");
});

panel.addEventListener("click", () => {
  panel.classList.toggle("show");
});

// Theme stuff
let theme = localStorage.getItem("theme") || "normal";
root.setAttribute('data-theme', theme);

window.setTheme = function(themeName) {
  root.style.removeProperty("--bg");
  root.style.removeProperty("--text");

  localStorage.removeItem("customBg");
  localStorage.removeItem("customText");

  localStorage.setItem("theme", themeName);
  root.setAttribute("data-theme", themeName);
};