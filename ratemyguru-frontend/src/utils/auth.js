// ============================================
// RateMyGuru - Auth Helper
// src/utils/auth.js
// ============================================

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const LINKEDIN_CLIENT_ID = process.env.REACT_APP_LINKEDIN_CLIENT_ID;

// ============================================
// LinkedIn OAuth — redirect user to LinkedIn
// ============================================
//export function loginWithLinkedIn() {
//  const REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;	
//  console.log("Login clicked!");
//  console.log("Client ID:", LINKEDIN_CLIENT_ID);
//  console.log("Redirect URI:", REDIRECT_URI);
//
//  const state = Math.random().toString(36).substring(2);
//  localStorage.setItem("linkedin_oauth_state", state);
//  const params = new URLSearchParams({
//    response_type: "code",
//    client_id: LINKEDIN_CLIENT_ID,
//    redirect_uri: REDIRECT_URI,
//    state,
//    scope: "openid profile email",
//  });
//
//  console.log("Redirecting to:", `https://www.linkedin.com/oauth/v2/authorization?${params}`);
//  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
//}
  export function loginWithLinkedIn() {
  alert("Button clicked!"); // ADD THIS
  console.log("Login clicked!");
  console.log("Client ID:", LINKEDIN_CLIENT_ID);
  // ... rest of code
}
// ============================================
// Get current logged in user
// ============================================
export function getUser() {
  try {
    const user = localStorage.getItem("rmg_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// ============================================
// Get auth token for API calls
// ============================================
export function getToken() {
  return localStorage.getItem("rmg_token");
}

// ============================================
// Check if user is logged in
// ============================================
export function isLoggedIn() {
  return !!getUser() && !!getToken();
}

// ============================================
// Logout
// ============================================
export function logout() {
  localStorage.removeItem("rmg_user");
  localStorage.removeItem("rmg_token");
  window.location.reload();
}

// ============================================
// Authenticated API call helper
// ============================================
export async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
