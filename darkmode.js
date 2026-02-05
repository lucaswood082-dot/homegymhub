(function () {
  const apply = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", isDark);
    document.documentElement.classList.toggle("dark-mode", isDark);
  };

  apply();

  window.addEventListener("storage", (e) => {
    if (e.key === "darkMode") apply();
  });
})();
