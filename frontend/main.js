// main.js

const API_BASE = ""; // même origine que le backend

function saveToken(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// petit helper pour les appels API
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    // si 401, on renvoie vers la page d'accueil
    if (res.status === 401) {
      clearAuth();
      window.location.href = "/";
    }
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/";
  }
}

function logout() {
  clearAuth();
  window.location.href = "/";
}