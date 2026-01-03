// ot-guard.js
const V = window.OT?.V || "10.12.5";

import { onAuthStateChanged, signOut } from `https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`;
import { doc, getDoc, setDoc, serverTimestamp } from `https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`;

// ✅ Lista de llaves a sincronizar (puedes agregar más)
const KEY_ALLOWLIST = [
  "usuariosSistema",
  "registrosCompra",
  "catalogoCompradores",
  "catalogoProveedores",
  "catalogoSectores",
];

// ===== Helpers LocalStorage =====
function snapshotLocalStorage() {
  const data = {};
  for (const k of KEY_ALLOWLIST) {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  }
  return data;
}

function restoreLocalStorage(data) {
  if (!data) return false;
  let changed = false;

  for (const k of KEY_ALLOWLIST) {
    const incoming = (k in data) ? data[k] : null;
    const current = localStorage.getItem(k);

    if (incoming === null) {
      if (current !== null) { localStorage.removeItem(k); changed = true; }
    } else if (current !== incoming) {
      localStorage.setItem(k, incoming);
      changed = true;
    }
  }
  return changed;
}

// ===== Firestore Sync =====
async function pullFromCloud(uid) {
  const ref = doc(window.OT.db, "users", uid, "state", "localStorage");
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  return restoreLocalStorage(snap.data().data);
}

async function pushToCloud(uid) {
  const ref = doc(window.OT.db, "users", uid, "state", "localStorage");
  await setDoc(ref, {
    data: snapshotLocalStorage(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// ===== Auto Sync (debounce) =====
let pushTimer = null;
function schedulePush(uid) {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushToCloud(uid).catch(()=>{}), 1200);
}

function patchLocalStorage(uid) {
  const _setItem = localStorage.setItem.bind(localStorage);
  const _removeItem = localStorage.removeItem.bind(localStorage);
  const _clear = localStorage.clear.bind(localStorage);

  localStorage.setItem = (k, v) => { _setItem(k, v); if (KEY_ALLOWLIST.includes(k)) schedulePush(uid); };
  localStorage.removeItem = (k) => { _removeItem(k); if (KEY_ALLOWLIST.includes(k)) schedulePush(uid); };
  localStorage.clear = () => { _clear(); schedulePush(uid); };
}

function redirectToLogin() {
  const file = location.pathname.split("/").pop() || "index.html";
  location.href = `login.html?next=${encodeURIComponent(file)}`;
}

function setLegacySession(user) {
  // Para que tus páginas que usan authOk/authUser/authRole no “choquen”
  sessionStorage.setItem("authOk", "1");
  sessionStorage.setItem("authUser", user.email || "usuario");
  sessionStorage.setItem("authRole", "ADMINISTRADOR");
}

window.OT_LOGOUT = async function () {
  try { await signOut(window.OT.auth); } catch {}
  sessionStorage.clear();
  redirectToLogin();
};

// ===== Main =====
onAuthStateChanged(window.OT.auth, async (user) => {
  if (!user) return redirectToLogin();

  // 1) Baja data de nube
  const changed = await pullFromCloud(user.uid);

  // 2) Setea sesión “legacy” (si tus módulos lo usan)
  setLegacySession(user);

  // 3) Habilita autosync
  patchLocalStorage(user.uid);

  // 4) Si al bajar cambió algo, recarga 1 vez para que la UI lo tome
  if (changed && !sessionStorage.getItem("OT_RELOADED")) {
    sessionStorage.setItem("OT_RELOADED", "1");
    location.reload();
  } else {
    sessionStorage.removeItem("OT_RELOADED");
  }

  // Backup extra al salir
  window.addEventListener("beforeunload", () => pushToCloud(user.uid));
});
