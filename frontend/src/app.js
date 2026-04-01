import { useState, useRef } from "react";

const API_URL = "http://localhost:5000/simplify";

const EXAMPLES = [
  "The mitochondria is the powerhouse of the cell, responsible for generating adenosine triphosphate through oxidative phosphorylation.",
  "The defendant was acquitted of all charges due to insufficient corroborating evidence presented by the prosecution.",
  "Photosynthesis is the biochemical process by which chlorophyll-containing organisms convert light energy into chemical energy.",
];

function ScoreRing({ value, label, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
        <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="500" fill="#111">{value}</text>
      </svg>
      <span style={{ fontSize: 12, color: "#6b7280", letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}

function WordDiff({ original, simplified }) {
  if (!original || !simplified) return null;
  const origWords = original.split(" ");
  const simpSet = new Set(simplified.split(" ").map((w) => w.toLowerCase().replace(/[^a-z]/g, "")));
  return (
    <div style={{ fontSize: 13, lineHeight: 1.8 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", display: "block", marginBottom: 6 }}>WORDS SIMPLIFIED</span>
      {origWords.map((word, i) => {
        const kept = simpSet.has(word.toLowerCase().replace(/[^a-z]/g, ""));
        return (
          <span key={i} style={{
            display: "inline-block", marginRight: 4, padding: "1px 4px", borderRadius: 4,
            background: kept ? "transparent" : "#fee2e2",
            color: kept ? "#6b7280" : "#dc2626",
            textDecoration: kept ? "none" : "line-through", fontSize: 13,
          }}>{word}</span>
        );
      })}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "transparent", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [simplified, setSimplified] = useState("");
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("output");
  const textareaRef = useRef(null);

  const wordCount = (t) => t.trim().split(/\s+/).filter(Boolean).length;

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError(""); setSimplified(""); setScores(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSimplified(data.simplified);
      setScores(data.scores);
      setHistory((prev) => [{ original: inputText, simplified: data.simplified, scores: data.scores, id: Date.now() }, ...prev.slice(0, 4)]);
      setActiveTab("output");
    } catch (e) {
      setError("Could not reach the backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const bleuScore = scores?.bleu != null ? Math.round(scores.bleu) : null;
  const fleschScore = scores?.flesch != null ? Math.round(scores.flesch) : null;
  const compressionPct = scores?.compression_ratio != null ? Math.round((1 - scores.compression_ratio) * 100) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif", padding: "2rem 1rem" }}>

      {/* Header */}
      <div style={{ maxWidth: 860, margin: "0 auto 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h10M4 18h6" /></svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111" }}>Text Simplifier</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Meaning preservation & text simplification · T5-small</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: "1rem" }}>

        {/* Examples */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Try:</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => { setInputText(ex); textareaRef.current?.focus(); }}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ex.slice(0, 40)}…
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

          {/* Input */}
          <div style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em" }}>INPUT TEXT</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{wordCount(inputText)} words · {inputText.length} chars