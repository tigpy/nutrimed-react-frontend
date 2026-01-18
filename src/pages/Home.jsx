// src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://nutrimed-flask-backend.onrender.com";



export default function Home() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    gender: "Male",
    age: 25,
    height_cm: 170,
    weight_kg: 65,
    activity: "Medium",
    goal: "Maintain",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    // keep numeric values as numbers for our payload
    const v = ["age", "height_cm", "weight_kg"].includes(name) ? Number(value) : value;
    setForm((s) => ({ ...s, [name]: v }));
  }

  async function submit(e) {
    e?.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
      navigate("/results", { state: { payload: form, result: data } });
    } catch (error) {
      setErr(error.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      gender: "Male",
      age: 25,
      height_cm: 170,
      weight_kg: 65,
      activity: "Medium",
      goal: "Maintain",
    });
    setErr(null);
  }

  return (
    <div className="page-grid" role="main">
      {/* Form card */}
      <section className="card form-card" aria-labelledby="form-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div>
            <h2 id="form-heading">Get your personalized plan</h2>
            <p className="muted">Quick inputs — results appear on the next page.</p>
          </div>

          {/* (removed in-card theme toggle) */}
        </div>

        <form onSubmit={submit} className="grid-3" aria-label="Plan form" style={{ marginTop: 16 }}>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={onChange} aria-label="Gender">
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>

          <label>
            Activity
            <select name="activity" value={form.activity} onChange={onChange} aria-label="Activity level">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>

          <label>
            Goal
            <select name="goal" value={form.goal} onChange={onChange} aria-label="Goal">
              <option>Lose Weight</option>
              <option>Maintain</option>
              <option>Gain Weight</option>
            </select>
          </label>

          <label>
            Age
            <input name="age" type="number" min="15" max="100" value={form.age} onChange={onChange} aria-label="Age" />
          </label>

          <label>
            Height (cm)
            <input name="height_cm" type="number" min="100" max="220" value={form.height_cm} onChange={onChange} aria-label="Height in cm" />
          </label>

          <label>
            Weight (kg)
            <input name="weight_kg" type="number" min="30" max="250" step="0.1" value={form.weight_kg} onChange={onChange} aria-label="Weight in kg" />
          </label>

          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button className="btn primary" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? "Working…" : "Get My Plan"}
            </button>

            <button
              className="btn ghost"
              type="button"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>

        {err && <div className="error" role="alert" style={{ marginTop: 12 }}>{err}</div>}
      </section>

      {/* Right column: brand/clinic card */}
      <aside className="card help-card" aria-hidden>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* simple inline logo circle */}
          <div style={{
            width: 72, height: 72, borderRadius: 14, background: "linear-gradient(140deg,#0b6ef6,#36a3ff)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 24
          }}>
            NM
          </div>

          <div>
            <h3 style={{ marginBottom: 6 }}>NutriMed • Clinical</h3>
            <p className="muted small" style={{ maxWidth: 300 }}>
              Evidence-aware diet & exercise plans. Clean, shareable reports for students and clinicians. Use the plan results page to export or save.
            </p>
          </div>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "rgba(16,24,40,0.06)" }} />

        {/* small simple illustration (SVG medical + nutrition) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
            <rect x="4" y="4" width="72" height="72" rx="12" fill="#eef6ff"/>
            <g transform="translate(14,14)" fill="none" stroke="#0b6ef6" strokeWidth="2">
              <path d="M12 6c2 0 3 1 5 1s3-1 5-1c3 0 5 2 5 5 0 3-2 6-5 6-3 0-5-2-5-2s-2 2-5 2c-3 0-5-3-5-6 0-3 2-5 5-5z" />
              <path d="M20 18v8" strokeLinecap="round"/>
              <path d="M16 22h8" strokeLinecap="round"/>
            </g>
          </svg>

          <div>
            <strong>Clinic-ready reports</strong>
            <div className="muted small" style={{ marginTop: 6 }}>
              Export PDF, copy JSON, or share a link. Designed for quick clinical teaching and student presentations.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
