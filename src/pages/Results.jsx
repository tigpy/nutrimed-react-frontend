// src/pages/Results.jsx
import React, { useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { FiChevronLeft, FiDownload } from "react-icons/fi";
import { FaDumbbell } from "react-icons/fa";
import { MdOutlineFoodBank } from "react-icons/md";

/* Animations / helpers */
const pageVariant = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.36 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.28 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32 } }
};

function repsForExercise(ex) {
  const s = (ex || "").toLowerCase();
  if (s.includes("strength") || s.includes("resistance") || s.includes("compound")) return "3 × 8–12 reps";
  if (s.includes("cardio") || s.includes("walking") || s.includes("cycling")) return "20–40 min";
  if (s.includes("core") || s.includes("plank")) return "3 × 30–60s holds";
  if (s.includes("mobility") || s.includes("stretch")) return "10–15 min daily";
  if (s.includes("hiit") || s.includes("interval")) return "6–10 rounds (30s on / 60s off)";
  if (s.includes("chair")) return "2–3 sets × 10–15 reps";
  return "2–4 sets • See demo";
}

function MacroBar({ label, value, max = 250 }) {
  const pct = Math.min(100, Math.round(((value || 0) / max) * 100));
  return (
    <div className="macro-row" role="progressbar" aria-valuenow={value || 0} aria-valuemin="0" aria-valuemax={max} aria-label={`${label} grams`}>
      <div className="macro-label">{label} <span className="muted small">{value || 0}g</span></div>
      <div className="macro-track" aria-hidden>
        <div className="macro-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const state = location.state;

  useEffect(() => {
    if ((!state || !state.result) && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const p = url.searchParams.get("plan");
      if (p) {
        try {
          const decoded = JSON.parse(atob(p));
          navigate("/results", { state: decoded, replace: true });
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state || !state.result) {
    navigate("/", { replace: true });
    return null;
  }

  const { payload = {}, result = {} } = state;
  const meals = Array.isArray(result.meal_suggestions) ? result.meal_suggestions : [];
  const exercises = Array.isArray(result.exercise_suggestions) ? result.exercise_suggestions : [];
  const macros = result.macros_g || { protein_g: 0, carbs_g: 0, fats_g: 0 };

  const formatNumber = (v) => (v === undefined || v === null ? "—" : String(Math.round(v)));
  const caloriesText = result?.calorie_range ? `${formatNumber(result.calorie_range.low)} — ${formatNumber(result.calorie_range.high)}` : "—";

  // Export to PDF — SINGLE PRIMARY CTA
  async function exportPDF() {
    const el = containerRef.current;
    if (!el) return alert("Nothing to export.");
    try {
      const canvas = await html2canvas(el, { scale: 2 });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(img);
      const imgW = pageW - 40;
      const imgH = (imgProps.height * imgW) / imgProps.width;
      pdf.addImage(img, "PNG", 20, 20, imgW, imgH);
      pdf.save("NutriMed_Plan.pdf");
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF: " + (err?.message || "Unknown error"));
    }
  }

  function safeBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }

  return (
    <motion.div className="results-wrap" variants={pageVariant} initial="initial" animate="enter" exit="exit">
      <motion.div className="results-grid" ref={containerRef} aria-live="polite">

        <div className="results-left">
          <motion.div className="card summary-card" variants={itemVariant}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <button className="btn ghost" onClick={safeBack} aria-label="Back to form">
                <FiChevronLeft size={16} style={{ verticalAlign: "middle" }} /> Back
              </button>
              {/* header right intentionally empty (no JSON/button) */}
              <div />
            </div>

            <h3 id="rec-heading" className="no-margin" style={{ marginTop: 14 }}>{result?.diet_style || payload?.goal || "Recommendation"}</h3>
            <div className="muted small" style={{ marginTop: 6 }}>{payload?.activity ? `Activity: ${payload.activity}` : ""}</div>

            <div className="flash-row" style={{ marginTop: 16 }}>
              <div className="flash small" role="group" aria-label="BMI">
                <div className="flash-title">BMI</div>
                <div className="flash-value">{formatNumber(result?.bmi)} <div className="muted small" style={{ fontWeight: 400 }}>{result?.bmi_category || ""}</div></div>
              </div>

              <div className="flash small" role="group" aria-label="Calories">
                <div className="flash-title">Calories</div>
                <div className="flash-value">{caloriesText} kcal</div>
              </div>

              <div className="flash small" role="group" aria-label="Diet">
                <div className="flash-title">Diet</div>
                <div className="flash-value" style={{ maxWidth: 420 }}>{result?.diet_style || "—"}</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <MacroBar label="Protein" value={macros.protein_g || 0} max={250} />
              <MacroBar label="Carbs" value={macros.carbs_g || 0} max={500} />
              <MacroBar label="Fats" value={macros.fats_g || 0} max={150} />
            </div>
          </motion.div>

          <motion.section className="card" style={{ marginTop: 16 }} variants={itemVariant} aria-labelledby="meals-heading">
            <h4 id="meals-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}><MdOutlineFoodBank /> Meal Suggestions</h4>
            <div className="card-grid" role="list">
              {meals.length ? meals.map((m, i) => {
                const parts = String(m || "").split(":");
                const title = parts[0] || `Meal ${i + 1}`;
                const body = parts.slice(1).join(":").trim() || "";
                return (
                  <article key={i} className="meal-card hover-up" tabIndex="0" role="listitem" aria-label={`Meal suggestion ${i + 1}`}>
                    <div className="meal-content">
                      <div className="meal-title">{title}</div>
                      <div className="muted small">{body}</div>
                    </div>
                    {/* per-meal copy removed intentionally */}
                  </article>
                );
              }) : <div className="muted">No meal suggestions returned.</div>}
            </div>
          </motion.section>

          <motion.section className="card" style={{ marginTop: 16 }} variants={itemVariant} aria-labelledby="exercises-heading">
            <h4 id="exercises-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}><FaDumbbell /> Exercises</h4>
            <div className="card-grid" role="list">
              {exercises.length ? exercises.map((ex, i) => (
                <article key={i} className="exercise-flash hover-up" tabIndex="0" role="listitem" aria-label={`Exercise ${ex}`}>
                  <div className="exercise-main" style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    <div style={{ minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "rgba(11,110,246,0.06)" }}>
                      <FaDumbbell style={{ width: 18, height: 18, color: "var(--primary)" }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="exercise-title" style={{ fontWeight: 700 }}>{ex}</div>
                      <div className="muted small" style={{ marginTop: 6 }}>{repsForExercise(ex)}</div>
                    </div>
                  </div>

                  <div className="exercise-actions">
                    <a
                      className="btn small ghost exercise-btn"
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex + " tutorial")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Watch demo for ${ex}`}
                    >
                      Watch demo
                    </a>
                  </div>
                </article>
              )) : <div className="muted">No exercises returned.</div>}
            </div>
          </motion.section>
        </div>

        <aside className="results-right">
          <motion.div className="card" style={{ position: "sticky", top: 24 }} variants={itemVariant}>
            <h5>Clinical Summary</h5>
            <ul className="summary-list small" aria-label="Clinical summary">
              <li>Goal: <strong>{payload?.goal || "—"}</strong></li>
              <li>Activity: <strong>{payload?.activity || "—"}</strong></li>
              <li>Age: <strong>{payload?.age ?? "—"}</strong></li>
              <li>Height: <strong>{payload?.height_cm ?? "—"} cm</strong></li>
              <li>Weight: <strong>{payload?.weight_kg ?? "—"} kg</strong></li>
            </ul>
          </motion.div>

          <motion.div className="card" style={{ marginTop: 12 }} variants={itemVariant}>
            <h5>Quick Actions</h5>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              {/* Single primary Export PDF button only */}
              <button className="btn primary" onClick={exportPDF} aria-label="Export PDF">
                <FiDownload style={{ marginRight: 8, verticalAlign: "middle" }} />
                Export PDF
              </button>
            </div>
          </motion.div>
        </aside>
      </motion.div>
    </motion.div>
  );
}
