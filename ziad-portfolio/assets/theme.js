/* Shared theme handling for the portfolio and every project page.
   Reads the stored choice, falls back to the OS preference, and wires
   any element with .js-theme-toggle. */
(function () {
  var STORAGE_KEY = "ziad-portfolio-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function resolve() {
    var saved = stored();
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  apply(resolve());

  document.addEventListener("click", function (event) {
    var btn = event.target.closest(".js-theme-toggle");
    if (!btn) return;
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
    btn.setAttribute("aria-pressed", next === "light" ? "true" : "false");
  });
})();
