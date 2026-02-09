(function () {
  function applyTheme(isDark) {
    document.documentElement.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark-mode", isDark);
    document.documentElement.style.setProperty("--page-bg", isDark ? "#0f172a" : "#f6fff9");
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    document.documentElement.style.background = isDark ? "#0f172a" : "#f6fff9";
    document.body.style.background = isDark ? "#0f172a" : "#f6fff9";
  }

  const apply = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    applyTheme(isDark);
  };

  apply();

  window.addEventListener("storage", (e) => {
    if (e.key === "darkMode") apply();
  });

  window.addEventListener("themechange", (e) => {
    applyTheme(!!e.detail?.isDark);
  });

  window.applyTheme = applyTheme;
})();
