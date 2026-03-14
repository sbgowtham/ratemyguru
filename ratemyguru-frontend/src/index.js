import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminDashboard from './Admin';

function LinkedInCallback() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      fetch("https://ratemyguru-production.up.railway.app/api/auth/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      .then(r => r.json())
      .then(data => {
        console.log("Backend response:", data); // ADD THIS
        if (data.user) {
          localStorage.setItem("rmg_user", JSON.stringify(data.user));
          localStorage.setItem("rmg_token", data.token);
          setTimeout(() => window.location.href = "/", 5000);
        } else {
          console.error("No user in response:", data);
          // TEMPORARY - save mock user so you can see logout button
          localStorage.setItem("rmg_user", JSON.stringify({ name: "Gowtham SB", email: "test@test.com" }));
          setTimeout(() => window.location.href = "/", 5000);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setTimeout(() => window.location.href = "/", 5000);
      });
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1729", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "white", fontSize: 16 }}>
      Logging you in... ⏳
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
    </Routes>
  </BrowserRouter>
);