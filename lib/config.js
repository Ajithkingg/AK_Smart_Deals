/* ============================================================
   AK SMART DEALS — SETTINGS
   Change only the values inside the quotes, then save.
   ============================================================ */
const config = {
  // Your WhatsApp number with country code, digits only.
  // Orders for "own" products are sent here.  Example: "919876543210"
  whatsapp: "919629154016",

  // Firebase project settings. Get them from
  // console.firebase.google.com → Project settings → General → Your apps → Web app → Config.
  // These values are safe to publish; access is controlled by firestore.rules.
  firebase: {
    apiKey: "AIzaSyDqEUITUnaUVuRuIJxhcuJ3t2QkDx7OPvg",
    authDomain: "ak-smart-deals.firebaseapp.com",
    projectId: "ak-smart-deals",
    storageBucket: "ak-smart-deals.firebasestorage.app",
    messagingSenderId: "445247359719",
    appId: "1:445247359719:web:9b493247c282edd0a7b042",
  },
};

export default config;
