addEventListener("load", () => {
  setupThemeToggle();
});

function setupThemeToggle() {
  const themeCheckbox = document.querySelector("#theme-toggle");
  let theme = localStorage.getItem("theme");
  if (!["light", "dark"].includes(theme)) {
    theme = "light";
  }
  if (theme == "light") {
    themeCheckbox.checked = false;
  } else {
    themeCheckbox.checked = true;
  }
  themeCheckbox.addEventListener("change", (e) => {
    const newTheme = e.target.checked ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.querySelector("body").setAttribute("data-theme", newTheme);
  });
}
