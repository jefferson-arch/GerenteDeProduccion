// firebase-init.js
const V = "10.12.5";

import { initializeApp } from `https://www.gstatic.com/firebasejs/${V}/firebase-app.js`;
import { getAuth } from `https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`;
import { getFirestore } from `https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`;

// 👇 Pega aquí tu config real (Firebase Console)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

window.OT = window.OT || {};
window.OT.app = app;
window.OT.auth = getAuth(app);
window.OT.db = getFirestore(app);
window.OT.V = V;
