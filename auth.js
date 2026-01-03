// auth.js — protección básica para GitHub Pages (solo barrera visual)
(function () {
  const LOGIN_PAGE = "login.html";
  const AUTH_KEY = "OT_AUTH_OK";
  const USER_KEY = "OT_USER";

  const path = location.pathname.split("/").pop() || "index.html";

  // Permitir siempre la pantalla de login
  if (path.toLowerCase() === LOGIN_PAGE) return;

  // Si no está autenticado, mandar al login con retorno
  const isAuthed = sessionStorage.getItem(AUTH_KEY) === "1";
  if (!isAuthed) {
    const next = encodeURIComponent(location.href);
    location.href = `${LOGIN_PAGE}?next=${next}`;
    return;
  }

  // Botón "Cerrar sesión" si existe algún elemento con id="btnLogout"
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnLogout");
    if (btn) {
      btn.addEventListener("click", () => {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(USER_KEY);
        location.href = LOGIN_PAGE;
      });
    }
  });
})();
