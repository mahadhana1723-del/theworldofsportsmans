// config.js

// Detect if running locally
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const CONFIG = {
  API_URL: isLocal
    ? "http://localhost:5000/api"                // ✅ Local dev backend
    : "https://c6d0d63b7acd.ngrok-free.app/api"  // ✅ Ngrok (update when restarted)
};
