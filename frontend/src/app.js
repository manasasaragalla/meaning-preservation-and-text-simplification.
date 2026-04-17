import { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:5000/simplify";

const EXAMPLES = [
  "The mitochondria is the powerhouse of the cell, responsible for generating adenosine triphosphate through oxidative phosphorylation.",
  "The defendant was acquitted of all charges due to insufficient corroborating evidence presented by the prosecution.",
  "Photosynthesis is the biochemical process by which chlorophyll-containing organisms convert light energy into chemical energy.",
];

const REFERENCES = [
  { id: 1, type: "Same Dataset", author: "Wei Xu et al. (2016)", title: "Optimizing Statistical Machine Translation for Text Simplification", url: "https://aclanthology.org/Q16-1029/", tag: "SARI Metric" },
  { id: 2, type: "Same Dataset", author: "Sergiu Nisioi et al. (2017)", title: "Exploring Neural Text Simplification Models", url: "https://aclanthology.org/P17-2014/", tag: "Neural seq2seq" },
  { id: 3, type: "Same Dataset", author: "Zhang and Lapata (2017)", title: "Sentence Simplification with Deep Reinforcement Learning", url: "https://aclanthology.org/D17-1062/", tag: "Reinforcement Learning" },
  { id: 4, type: "Same Dataset", author: "Narayan and Gardent (2014)", title: "Hybrid Simplification using Semantic Processing and Machine Translation", url: "https://aclanthology.org/P14-1042/", tag: "Hybrid SMT" },
  { id: 5, type: "Different Datasets", author: "Dhruv Kumar et al. (2019)", title: "Controllable Sentence Simplification (ACCESS)", url: "https://aclanthology.org/2020.acl-main.102/", tag: "Controllability" },
  { id: 6, type: "Different Datasets", author: "Pranav Maddela et al. (2021)", title: "Controllable Text Simplification with Explicit Paraphrasing", url: "https://aclanthology.org/2021.naacl-main.277/", tag: "Meaning Preservation" },
  { id: 7, type: "Different Datasets", author: "Chenhui Chu et al. (2017)", title: "An Empirical Comparison of Domain Adaptation Methods for NMT", url: "https://aclanthology.org/P17-1036/", tag: "Simplicity vs Meaning" },
];

const GLOSSARY = [
  { term: "SARI", desc: "Measures quality of adding, deleting, and keeping words. Gold standard for TS." },
  { term: "BLEU", desc: "Measures n-gram overlap with a reference sentence (higher = more similar)." },
  { term: "Semantic Similarity", desc: "Cosine similarity of sentence embeddings. Measures meaning preservation." },
  { term: "FK Grade Level", desc: "Flesch-Kincaid Grade level. Lower is easier (e.g., 8.0 = 8th Grade)." },
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

  const clean = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const origWords = original.split(/\s+/);
  const simpWords = simplified.split(/\s+/);

  // Simple diff logic: find words in original NOT in simplified (deleted)
  // and words in simplified NOT in original (added)
  // We align them by showing deleted words first, then the remaining flow
  const simpSet = new Set(simpWords.map(clean));
  const origSet = new Set(origWords.map(clean));

  return (
    <div style={{ fontSize: 13, lineHeight: 2.2 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fee2e2", border: "1px solid #fecaca" }}></div>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>REMOVED</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#dcfce7", border: "1px solid #bbf7d0" }}></div>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>ADDED</span>
        </div>
      </div>

      <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unified Difference Map</span>
        
        <div style={{ wordBreak: "break-word" }}>
          {/* Show original words: if missing in simp, show as DELETED. If present, show normally. */}
          {origWords.map((word, i) => {
            const isRemoved = !simpSet.has(clean(word));
            return (
              <span key={`del-${i}`} style={{
                display: "inline-block", marginRight: 6, padding: "2px 4px", borderRadius: 4,
                background: isRemoved ? "#fee2e2" : "transparent",
                color: isRemoved ? "#dc2626" : "#64748b",
                textDecoration: isRemoved ? "line-through" : "none",
                fontWeight: isRemoved ? 500 : 400
              }}>{word}</span>
            );
          })}
          
          <div style={{ display: "inline-block", width: 1, height: 14, background: "#e2e8f0", margin: "0 10px", verticalAlign: "middle" }}></div>
          
          {/* Show simplified words that are NEW */}
          {simpWords.map((word, i) => {
            const isAdded = !origSet.has(clean(word));
            if (!isAdded) return null;
            return (
              <span key={`add-${i}`} style={{
                display: "inline-block", marginRight: 6, padding: "2px 6px", borderRadius: 4,
                background: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                border: "1px solid #bbf7d0"
              }}>{word}</span>
            );
          })}
        </div>
      </div>
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

function Sidebar({ references, glossary, history, onSelectHistory }) {
  const [expanded, setExpanded] = useState({ history: true, research: false, glossary: false });
  const sameDatasetRefs = references.filter(r => r.type === "Same Dataset");
  const diffDatasetRefs = references.filter(r => r.type === "Different Datasets");

  const toggle = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

  const Header = ({ title, section, isOpen }) => (
    <button onClick={() => toggle(section)} style={{
      width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "none", border: "none", padding: "0.5rem 0", cursor: "pointer",
      fontSize: 11, fontWeight: 700, color: isOpen ? "#111" : "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase",
      transition: "color 0.2s"
    }}>
      {title}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );

  return (
    <div style={{
      width: 340, minWidth: 340, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px",
      display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
      height: "fit-content", position: "sticky", top: "2rem"
    }}>
      {/* Sidebar Header */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Research Dashboard</span>
      </div>

      <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* History */}
        <section style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1rem" }}>
          <Header title="Session History" section="history" isOpen={expanded.history} />
          {expanded.history && (
            <div style={{ marginTop: "1rem", animation: "slideDown 0.3s ease-out" }}>
              {history.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {history.map((h) => (
                    <div key={h.id} onClick={() => onSelectHistory(h)}
                      style={{ padding: "10px", background: "#f9fafb", borderRadius: 8, cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      <div style={{ fontSize: 12, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.original}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>SARI: {h.scores?.sari?.toFixed(1) || "N/A"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "1rem" }}>No history yet</div>
              )}
            </div>
          )}
        </section>

        {/* References */}
        <section style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1rem" }}>
          <Header title="Literature Survey" section="research" isOpen={expanded.research} />
          {expanded.research && (
            <div style={{ marginTop: "1rem", animation: "slideDown 0.3s ease-out" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#64748b", margin: "1rem 0 0.5rem", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.05em" }}>
                  Same/Similar Datasets
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }}></div>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {sameDatasetRefs.map((ref) => (
                    <a key={ref.id} href={ref.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ padding: "10px", borderRadius: 8, borderLeft: "3px solid #10b981", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}>
                        <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>{ref.author}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{ref.title}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#64748b", margin: "1rem 0 0.5rem", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.05em" }}>
                  Different Datasets
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }}></div>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {diffDatasetRefs.map((ref) => (
                    <a key={ref.id} href={ref.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ padding: "10px", borderRadius: 8, borderLeft: "3px solid #3b82f6", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}>
                        <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>{ref.author}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{ref.title}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Glossary */}
        <section>
          <Header title="Metric Glossary" section="glossary" isOpen={expanded.glossary} />
          {expanded.glossary && (
            <div style={{ marginTop: "1rem", animation: "slideDown 0.3s ease-out" }}>
              <div style={{ display: "grid", gap: 12 }}>
                {glossary.map((g, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{g.term}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
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
  const [inferenceTime, setInferenceTime] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("ts_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const wordCount = (t) => t.trim().split(/\s+/).filter(Boolean).length;

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError(""); setSimplified(""); setScores(null); setInferenceTime(null);
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
      setInferenceTime(data.inference_time_ms || null);
      
      const newEntry = { original: inputText, simplified: data.simplified, scores: data.scores, id: Date.now() };
      const updatedHistory = [newEntry, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem("ts_history", JSON.stringify(updatedHistory));
      
      setActiveTab("output");
    } catch (e) {
      setError("Could not reach the backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectHistory = (h) => {
    setInputText(h.original);
    setSimplified(h.simplified);
    setScores(h.scores);
    setActiveTab("output");
  };

  const handleDownloadReport = () => {
    if (!scores) return;
    const reportData = {
      timestamp: new Date().toISOString(),
      model: "google/flan-t5-base",
      originalText: inputText,
      simplifiedText: simplified,
      metrics: scores,
      inferenceTimeMs: inferenceTime || "N/A"
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simplification_report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sariScore = scores?.sari != null ? Math.round(scores.sari) : null;
  const meaningScore = scores?.meaning_preservation != null ? Math.round(scores.meaning_preservation) : null;
  const gradeLevel = scores?.flesch_kincaid_grade != null ? Math.round(scores.flesch_kincaid_grade) : null;
  const compressionPct = scores?.compression_pct != null ? Math.round(scores.compression_pct) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", padding: "2rem 1rem", display: "flex", justifyContent: "center" }}>
      
      <style>{`
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
      
      <div style={{ display: "flex", gap: "2rem", width: "100%", maxWidth: 1200, alignItems: "flex-start" }}>
        
        {/* Permanent Sidebar */}
        <Sidebar 
          references={REFERENCES} 
          glossary={GLOSSARY} 
          history={history}
          onSelectHistory={onSelectHistory}
        />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
          
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.025em" }}>Text Simplifier <span style={{ color: "#3b82f6", fontWeight: 400 }}>AI</span></h1>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Meaning preservation · Research Integrity · FLAN-T5 Base</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>

        {/* Examples */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Examples:</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => { setInputText(ex); textareaRef.current?.focus(); }}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#475569", cursor: "pointer", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", transition: "all 0.2s" }}>
              {ex.slice(0, 45)}…
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02)" }}>

          {/* Input */}
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Complex Input</span>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{wordCount(inputText)} words · {inputText.length} chars</span>
            </div>
            <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste complex text here..."
              style={{ width: "100%", height: 120, border: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: 12, padding: 16, fontSize: 15, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#1e293b", transition: "border-color 0.2s" }} 
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#f1f5f9"} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={handleSimplify} disabled={loading || !inputText.trim()}
                style={{ background: loading ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)", transition: "all 0.2s" }}>
                {loading ? "AI Processing..." : "Simplify Text"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "1rem 1.5rem", background: "#fff1f2", color: "#e11d48", fontSize: 13, borderTop: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Results */}
          {(simplified || loading) && (
            <div style={{ borderTop: "1px solid #f1f5f9", background: "#fff" }}>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f1f5f9", padding: "0 1.5rem" }}>
                {["output", "diff"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent", color: activeTab === tab ? "#2563eb" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}>
                    {tab === "output" ? "Simplified Result" : "Word Changes"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: "1.5rem" }}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0", gap: 8 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", animation: "pulse 1.2s infinite ease-in-out", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                ) : activeTab === "output" ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Simplified Output</span>
                      <CopyButton text={simplified} />
                    </div>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: "#1e293b", margin: 0, background: "#f8fafc", padding: "1.25rem", borderRadius: 12, border: "1px solid #f1f5f9" }}>{simplified}</p>
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                    <WordDiff original={inputText} simplified={simplified} />
                  </div>
                )}
              </div>

              {/* Scores */}
              {scores && !loading && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "1.5rem", background: "linear-gradient(to bottom, #fff, #f8fafc)" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
                    {sariScore != null && <ScoreRing value={sariScore} label="SARI" color="#2563eb" />}
                    {meaningScore != null && <ScoreRing value={meaningScore} label="Similarity" color="#10b981" />}
                    {gradeLevel != null && <ScoreRing value={gradeLevel} label="Grade" color={gradeLevel > 10 ? "#ef4444" : "#10b981"} />}
                    {compressionPct != null && <ScoreRing value={compressionPct} label="Reduced" color="#8b5cf6" />}
                  </div>

                  {/* Secondary metrics & Download */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {scores.bleu != null && <span style={{ fontSize: 11, background: "#fff", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 6, color: "#64748b" }}>BLEU: <b style={{ color: "#0f172a" }}>{scores.bleu.toFixed(1)}</b></span>}
                      {scores.flesch_reading_ease != null && <span style={{ fontSize: 11, background: "#fff", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 6, color: "#64748b" }}>Readability: <b style={{ color: "#0f172a" }}>{scores.flesch_reading_ease.toFixed(1)}</b></span>}
                      {inferenceTime != null && <span style={{ fontSize: 11, background: "#fff", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 6, color: "#64748b" }}>Latency: <b style={{ color: "#0f172a" }}>{inferenceTime} ms</b></span>}
                    </div>
                    <button onClick={handleDownloadReport}
                      style={{ fontSize: 12, background: "#2563eb", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, boxShadow: "0 2px 4px rgba(37, 99, 235, 0.1)" }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop History Preview - keeping a quick view at bottom too */}
        {history.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.25rem 1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Activity</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {history.slice(0, 3).map((h) => (
                <div key={h.id} onClick={() => onSelectHistory(h)}
                  style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, cursor: "pointer", border: "1px solid #f1f5f9", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>{h.original}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "flex", gap: 8 }}>
                    <span>SARI: {h.scores?.sari?.toFixed(1) || "—"}</span>
                    <span>•</span>
                    <span>{h.scores?.meaning_preservation?.toFixed(0) || "—"}% Sim</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", padding: "2rem 0", lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ height: 1, width: 40, background: "#e2e8f0" }} />
            <strong style={{ color: "#475569", fontWeight: 700 }}>Designed and Developed by Manasa Saragalla</strong>
            <div style={{ height: 1, width: 40, background: "#e2e8f0" }} />
          </div>
          <span>Built with FLAN-T5 Base Transformer · Optimized for Accessibility & Research Integrity</span>
        </div>
        </div>
      </div>
    </div>
  );
}