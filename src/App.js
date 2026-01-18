// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Results from "./pages/Results";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

/* Keep useLocation inside Router - control theme here and wrap routes with AnimatePresence */
function AppInner() {
  const location = useLocation();

  // theme state persisted to localStorage; toggles body class 'light' / 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("nutrimed_theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    try { localStorage.setItem("nutrimed_theme", theme); } catch {}
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <div className="app-root">
      <header className="topbar app-header">
        <div className="topbar-inner">
          <div className="brand">
            <div className="logo-square" aria-hidden>NM</div>
            <div className="brand-text">
              <h1 className="brand-title">NutriMed</h1>
              <div className="brand-sub">Diet & Exercise</div>
            </div>
          </div>

          <div className="top-actions" role="toolbar" aria-label="Top actions">
            <button
              className="btn ghost"
              onClick={() => window.open("https://example.com", "_blank")}
              aria-label="Open documentation"
            >
              Docs
            </button>

            {/* Theme toggle */}
            <button
              className="btn ghost"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              aria-label="Toggle dark theme"
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              style={{ marginLeft: 8 }}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            {/* add other routes here */}
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} NutriMed — Built for student use
      </footer>
    </div>
  );
}
