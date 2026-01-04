// firebase-init.js (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.*/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.*/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.*/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "…",
  appId: "…"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
