import { useState, useEffect, useRef, useCallback } from "react";

// ─── ALMA PRATICA COLORS ────────────────────────────────────────────────────
const C = {
  bg1: "#0D1B2A", bg2: "#1B2A4A", bg3: "#243B5E",
  accent: "#E8863A", accent2: "#F4A63A", teal: "#2BA8A4",
  success: "#34C78A", danger: "#E85A5A", warn: "#F4C63A",
  text: "#EDF0F5", muted: "rgba(237,240,245,0.4)",
  glass: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)",
};

const DIFF = [
  { id: "easy", label: "Facile", icon: "🟢", color: C.success, desc: "Bot collaborativo, script lineare" },
  { id: "medium", label: "Medio", icon: "🟡", color: C.warn, desc: "Bot realistico, imprevedibile" },
  { id: "hard", label: "Difficile", icon: "🔴", color: C.danger, desc: "Bot instabile, provocatorio" },
];

function diffMod(d) {
  if (d === "easy") return "\nFACILE: Collaborativo e prevedibile. Leggera resistenza → apertura → accordo. Max 2 frasi.";
  if (d === "hard") return "\nDIFFICILE: Emotivamente instabile. Alterna calma e scatti. Cambi opinione, provocazioni, domande scomode. Max 3 frasi.";
  return "\nMEDIO: Realistico. Alterna collaborazione e resistenza. Max 2-3 frasi.";
}

// ─── SCENARIOS ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "feedback", icon: "💬", label: "Dare Feedback", color: C.accent, description: "Feedback costruttivo ed efficace", scenarios: [
    { id: "fb1", title: "Performance Insufficiente", brief: "Team member non raggiunge obiettivi da 2 mesi. Comunica il problema.", role_user: "Manager marketing", role_ai: "Marco", role_ai_full: "Marco, diretto report", ai_p: "In calo da 2 mesi. Difensivo poi aperto se comunicato bene.", tips: ["Modello SBI", "Riconosci punti di forza", "Esempi concreti", "Chiedi il suo punto di vista", "Piano d'azione"], eval: ["Empatia", "Specificità feedback", "Struttura", "Orientamento soluzione", "Ascolto"] },
    { id: "fb2", title: "Feedback a un Senior", brief: "Feedback a collega esperto che ha gestito male una presentazione.", role_user: "PM junior", role_ai: "Laura", role_ai_full: "Laura, Senior Consultant", ai_p: "Esperta e orgogliosa. Scettica su feedback da junior. Ricettiva se rispettoso.", tips: ["Chiedi permesso", "'Io ho notato' non 'tu hai fatto'", "Riconosci esperienza", "Focus impatto", "Proponi supporto"], eval: ["Rispetto seniority", "Diplomazia", "Dati oggettivi", "Posizionamento", "Gestione resistenza"] },
  ]},
  { id: "difficult", icon: "🔥", label: "Conversazioni Difficili", color: "#D4812F", description: "Conflitti e situazioni delicate", scenarios: [
    { id: "dc1", title: "Conflitto nel Team", brief: "Due membri in conflitto aperto. Devi mediare.", role_user: "Team Lead", role_ai: "Andrea", role_ai_full: "Andrea, sviluppatore frustrato", ai_p: "Frustrato, collega non rispetta deadline. Emotivo ma professionale.", tips: ["Regole base", "Ascolta senza schierarti", "Riformula", "Interessi comuni", "Soluzioni pratiche"], eval: ["Neutralità", "Gestione emozioni", "Riformulazione", "Mediazione", "Accordo"] },
    { id: "dc2", title: "Comunicare un Licenziamento", brief: "Posizione eliminata per ristrutturazione. Non legato a performance.", role_user: "HR Manager", role_ai: "Fabio", role_ai_full: "Fabio, dipendente 5 anni", ai_p: "Shock, rabbia, preoccupazione. Empatico=accetta. Freddo=ostile.", tips: ["Dritto al punto", "Empatia genuina", "Ristrutturazione non performance", "Next steps", "Spazio emozioni"], eval: ["Chiarezza", "Empatia", "Gestione reazioni", "Info pratiche", "Dignità"] },
  ]},
  { id: "sales", icon: "📞", label: "Sales & Cold Calls", color: "#4A8FE7", description: "Vendita e primo contatto", scenarios: [
    { id: "sc1", title: "Cold Call B2B", brief: "Chiami resp. acquisti per proporre software. 60 sec.", role_user: "SDR", role_ai: "Dott.ssa Bianchi", role_ai_full: "Dott.ssa Bianchi, Resp. Acquisti", ai_p: "Occupata, scettica, fredda. Se pitch specifico, interesse. Se generico, taglia.", tips: ["Valore non prodotto", "Domande aperte", "Obiezioni = opportunità", "Obiettivo: 2° meeting"], eval: ["Opening hook", "Obiezioni", "Discovery", "Value prop", "Next step"] },
    { id: "sc2", title: "Negoziazione Prezzo", brief: "Cliente vuole -40%. Max sconto 15%.", role_user: "Account Executive", role_ai: "Giorgio", role_ai_full: "Giorgio, CFO", ai_p: "Negoziatore. Tattiche classiche. Value-based=compromesso. Cede=chiede più.", tips: ["Valore non prezzo", "Motivo sconto", "Alternative creative", "Silenzio", "Risultati business"], eval: ["Difesa valore", "Creatività", "Pressione", "Bisogni", "Win-win"] },
  ]},
  { id: "leadership", icon: "🎯", label: "Leadership", color: C.teal, description: "Guida e ispira", scenarios: [
    { id: "ld1", title: "Delegare Efficacemente", brief: "Delega progetto critico a persona capace ma insicura.", role_user: "Dir. Engineering", role_ai: "Sara", role_ai_full: "Sara, sviluppatrice", ai_p: "Competente ma insicura. Supportata=sicura. Micromanaggiata=frustrata.", tips: ["Perché lei", "Outcome e autonomia", "Checkpoint", "Anticipa paure", "Fiducia genuina"], eval: ["Chiarezza", "Empowerment", "Supporto", "Fiducia", "Success criteria"] },
    { id: "ld2", title: "Annunciare Cambiamento", brief: "Lavoro ibrido obbligatorio. Non piacerà.", role_user: "People Manager", role_ai: "Luca", role_ai_full: "Luca, vocale del team", ai_p: "Resistente, provocatorio. Se spiega e ascolta, costruttivo. Se impone, resiste.", tips: ["Prima perché poi cosa", "Riconosci preoccupazioni", "Negoziabile vs no", "Coinvolgi", "Timeline"], eval: ["Razionale", "Resistenza", "Trasparenza", "Coinvolgimento", "Visione"] },
  ]},
  { id: "networking", icon: "🤝", label: "Networking", color: C.accent2, description: "Relazioni professionali", scenarios: [
    { id: "nw1", title: "Elevator Pitch", brief: "90 sec con investitore. Sii memorabile.", role_user: "Founder startup", role_ai: "Roberto", role_ai_full: "Roberto, Business Angel", ai_p: "Gentile, poco tempo. Se originale ascolta. Se generico taglia.", tips: ["Hook curiosità", "Problema→soluzione", "Numeri", "Ask specifico"], eval: ["Impatto", "Conciseness", "Storytelling", "Audience", "CTA"] },
  ]},
  { id: "emotional", icon: "🧠", label: "Intelligenza Emotiva", color: "#E17055", description: "Gestisci emozioni", scenarios: [
    { id: "ei1", title: "Collega in Burnout", brief: "Collega in burnout. Affronta con sensibilità.", role_user: "Team Lead", role_ai: "Chiara", role_ai_full: "Chiara, in burnout", ai_p: "Esausta, nasconde. Minimizza. Empatia=si apre. Diretto=si chiude.", tips: ["Momento privato", "Senza giudizio", "Ascolta 80%", "Supporto non soluzioni", "Rispetta confini"], eval: ["Empatia", "Ascolto", "Confini", "Supporto", "Non giudizio"] },
  ]},
];

function sysPr(sc, d) {
  return `Sei ${sc.role_ai_full} in un roleplay. Contesto: ${sc.brief}\nPersonalità: ${sc.ai_p}\nRegole: personaggio, italiano, breve. Non dare consigli. Dopo 8 scambi concludi.${diffMod(d)}`;
}
function evalPr(sc, convo, d) {
  const t = convo.map(m => `${m.role === "user" ? "UTENTE" : sc.role_ai}: ${m.text}`).join("\n");
  return `Executive coach. Valuta roleplay (${d}). Scenario: ${sc.brief} | Utente: ${sc.role_user} | Criteri: ${sc.eval.join(", ")}\n${t}\nSii ONESTO. Punteggi DIVERSI (4-9). Commenti con ESEMPI. 3 forze, 3 miglioramenti CONCRETI.\nSOLO JSON:\n{"overall_score":7,"summary":"2-3 frasi.","scores":[{"criterion":"Nome","score":6,"comment":"Con esempio."}],"strengths":["1","2","3"],"improvements":["1","2","3"],"key_moment":"Scambio chiave.","mistake_to_avoid":"Errore con esempio.","better_phrase":"ORIG → MIGLIORE","academy_tip":"Tecnica pratica."}`;
}

// ─── AUTH HELPER ─────────────────────────────────────────────────────────────
async function authCall(body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch("/api/auth", { method: "POST", headers, body: JSON.stringify(body) });
  return r.json();
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function Avatar({ speaking, thinking, size = 180 }) {
  const [m, setM] = useState(false);
  useEffect(() => { if (!speaking) { setM(false); return; } const iv = setInterval(() => setM(p => !p), 170); return () => clearInterval(iv); }, [speaking]);
  const g = speaking ? `${C.accent}66` : thinking ? `${C.teal}44` : "rgba(255,255,255,0.03)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: -24, borderRadius: "50%", background: `radial-gradient(circle, ${g} 0%, transparent 70%)`, transition: "all 0.5s", animation: speaking ? "pulseGlow 2s ease-in-out infinite" : "none" }} />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
        <circle cx="100" cy="100" r="80" fill={C.bg2} stroke={`${C.accent}33`} strokeWidth="2" />
        <g style={{ animation: thinking ? "blink 1s infinite" : "none" }}>
          <ellipse cx="72" cy="88" rx="10" ry={thinking ? 2 : 11} fill={C.text} style={{ transition: "ry 0.15s" }} />
          <ellipse cx="128" cy="88" rx="10" ry={thinking ? 2 : 11} fill={C.text} style={{ transition: "ry 0.15s" }} />
          <circle cx="74" cy="87" r="5" fill={C.accent} /><circle cx="130" cy="87" r="5" fill={C.accent} />
          <circle cx="76" cy="85" r="2" fill="white" /><circle cx="132" cy="85" r="2" fill="white" />
        </g>
        <line x1="58" y1="72" x2="84" y2={speaking ? 70 : 74} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="116" y1={speaking ? 70 : 74} x2="142" y2="72" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" />
        {speaking ? <ellipse cx="100" cy="125" rx={m ? 16 : 10} ry={m ? 12 : 4} fill="#1A0F30" stroke={`${C.accent}88`} strokeWidth="1.5" style={{ transition: "all 0.12s" }} />
        : <path d="M82 122 Q100 136 118 122" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" />}
      </svg>
    </div>
  );
}

function ScoreRing({ score, size = 100, sw = 6 }) {
  const r = (size - sw) / 2, ci = 2 * Math.PI * r, off = ci - (score / 10) * ci;
  const col = score >= 8 ? C.success : score >= 6 ? C.warn : C.danger;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: "white", fontSize: `${size*0.32}px`, fontWeight: 700, fontFamily: "'DM Sans'" }}>{score}</text>
    </svg>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [authScreen, setAuthScreen] = useState("login"); // login | register
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [formName, setFormName] = useState("");
  const [pendingMsg, setPendingMsg] = useState("");
  // Admin
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  // App state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastAiText, setLastAiText] = useState("");
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userTextInput, setUserTextInput] = useState("");
  const [inputMode, setInputMode] = useState("voice");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLB, setShowLB] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const convoRef = useRef([]);

  useEffect(() => { convoRef.current = conversation; }, [conversation]);

  // ─── Init: check saved token ──────────────────────────────
  useEffect(() => {
    const has = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(has); if (!has) setInputMode("text");
    synthRef.current = window.speechSynthesis;

    const saved = localStorage.getItem("sf_token");
    if (saved) {
      authCall({ action: "verify" }, saved).then(res => {
        if (res.success) { setUser(res.user); setToken(saved); setScreen("home"); }
        else { localStorage.removeItem("sf_token"); setScreen("auth"); }
        setAnimateIn(true);
      }).catch(() => { setScreen("auth"); setAnimateIn(true); });
    } else { setScreen("auth"); setAnimateIn(true); }
  }, []);

  const nav = useCallback((to) => { setAnimateIn(false); setTimeout(() => { setScreen(to); setAnimateIn(true); }, 250); }, []);

  // ─── Auth actions ─────────────────────────────────────────
  const handleLogin = async () => {
    setAuthError(""); setAuthLoading(true);
    const res = await authCall({ action: "login", email: formEmail, password: formPass });
    setAuthLoading(false);
    if (res.success) {
      localStorage.setItem("sf_token", res.token);
      setToken(res.token); setUser(res.user); setFormEmail(""); setFormPass("");
      nav("home");
    } else setAuthError(res.error || "Errore login");
  };

  const handleRegister = async () => {
    setAuthError(""); setAuthLoading(true);
    const res = await authCall({ action: "register", email: formEmail, password: formPass, name: formName });
    setAuthLoading(false);
    if (res.success) { setPendingMsg(res.message); setAuthScreen("login"); setFormEmail(""); setFormPass(""); setFormName(""); }
    else setAuthError(res.error || "Errore registrazione");
  };

  const logout = () => { localStorage.removeItem("sf_token"); setUser(null); setToken(null); nav("auth"); };

  // ─── Admin ────────────────────────────────────────────────
  const loadAdminUsers = async () => {
    setAdminLoading(true);
    const res = await authCall({ action: "admin_list_users" }, token);
    if (res.success) setAdminUsers(res.users);
    setAdminLoading(false);
  };

  const toggleApproval = async (userId, currentApproved) => {
    await authCall({ action: "admin_update_user", userId, approved: !currentApproved }, token);
    loadAdminUsers();
  };

  const removeUser = async (userId) => {
    if (!confirm("Eliminare questo utente?")) return;
    await authCall({ action: "admin_update_user", userId, remove: true }, token);
    loadAdminUsers();
  };

  // ─── Leaderboard from DB ──────────────────────────────────
  const loadLB = async () => {
    const res = await authCall({ action: "leaderboard" }, token);
    if (res.success) setLeaderboard(res.leaderboard);
  };

  // ─── AI ───────────────────────────────────────────────────
  const callAI = async (messages, system, maxTok) => {
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, system, max_tokens: maxTok || 200 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.response || "";
    } catch (e) { return "Mi scusi, può ripetere?"; }
  };

  const speak = useCallback((text) => {
    if (!synthRef.current) return Promise.resolve();
    return new Promise(resolve => {
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "it-IT"; u.rate = 1.15; u.pitch = 1.05;
      const v = synthRef.current.getVoices().find(v => v.lang.startsWith("it")); if (v) u.voice = v;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => { setIsSpeaking(false); resolve(); };
      u.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current.speak(u);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = "it-IT"; rec.interimResults = true; rec.continuous = true; let f = "";
    rec.onresult = e => { let i = ""; for (let j = e.resultIndex; j < e.results.length; j++) { if (e.results[j].isFinal) f += e.results[j][0].transcript + " "; else i += e.results[j][0].transcript; } setCurrentTranscript(f + i); };
    rec.onerror = () => setIsListening(false); rec.onend = () => setIsListening(false);
    recognitionRef.current = rec; rec.start(); setIsListening(true); setCurrentTranscript("");
  }, [speechSupported]);
  const stopListening = useCallback(() => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); }, []);

  const handleSend = useCallback(async (text) => {
    if (!text?.trim() || !selectedScenario) return;
    const nc = [...convoRef.current, { role: "user", text: text.trim() }];
    setConversation(nc); setCurrentTranscript(""); setUserTextInput(""); setIsThinking(true); setLastAiText("");
    const am = nc.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    const ai = await callAI(am, sysPr(selectedScenario, difficulty), 200);
    setConversation(prev => [...prev, { role: "ai", text: ai }]);
    setLastAiText(ai); setTurnCount(prev => prev + 1); setIsThinking(false); speak(ai);
  }, [selectedScenario, difficulty, speak]);

  const handleVoiceSend = useCallback(() => { stopListening(); setTimeout(() => handleSend(currentTranscript), 100); }, [stopListening, handleSend, currentTranscript]);

  const genReport = useCallback(async () => {
    setIsGeneratingReport(true); nav("report");
    const prompt = evalPr(selectedScenario, convoRef.current, difficulty);
    let parsed = null;
    for (let a = 0; a < 2 && !parsed; a++) {
      const raw = await callAI([{ role: "user", content: prompt }], "Executive coach. SOLO JSON. Inizia con { finisci con }.", 1024);
      try { const c = raw.replace(/```json|```/g, "").trim(); const s = c.indexOf("{"), e = c.lastIndexOf("}"); if (s >= 0 && e > s) parsed = JSON.parse(c.slice(s, e + 1)); } catch {}
    }
    if (!parsed) {
      const bs = [6, 7, 5, 8, 6];
      parsed = { overall_score: 6, summary: "Buon impegno, serve più struttura.", scores: selectedScenario.eval.map((c, i) => ({ criterion: c, score: bs[i % 5], comment: `Lavora su "${c.toLowerCase()}".` })), strengths: ["Volontà", "Tono appropriato", "Focus"], improvements: ["Più domande aperte", "Più esempi", "Più struttura"], key_moment: "Il momento iniziale ha impostato il tono.", mistake_to_avoid: "Non saltare subito alla soluzione.", better_phrase: "'Devi migliorare' → 'Come vedi la situazione?'", academy_tip: "Regola 70/30: ascolta 70%, parla 30%." };
    }
    // Save to DB
    await authCall({ action: "save_score", scenarioId: selectedScenario.id, difficulty, score: parsed.overall_score }, token);
    setReport(parsed); setIsGeneratingReport(false);
  }, [selectedScenario, difficulty, nav, token]);

  const restart = () => { setConversation([]); setReport(null); setSelectedScenario(null); setSelectedCategory(null); setCurrentTranscript(""); setLastAiText(""); setTurnCount(0); setDifficulty("medium"); nav("home"); };

  // ─── STYLES ───────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: `linear-gradient(160deg, ${C.bg1} 0%, ${C.bg2} 50%, ${C.bg1} 100%)`, fontFamily: "'DM Sans', sans-serif", color: C.text },
    wrap: { maxWidth: "900px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 1, opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" },
    logo: { fontSize: "11px", letterSpacing: "6px", textTransform: "uppercase", color: C.muted },
    h1: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, lineHeight: 1.1, margin: 0, background: `linear-gradient(135deg, #FFF 0%, ${C.accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    btn: (c = C.accent, full = false) => ({ background: c, color: "#fff", border: "none", borderRadius: "12px", padding: full ? "16px 32px" : "12px 24px", fontSize: full ? "16px" : "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'", transition: "all 0.2s", width: full ? "100%" : "auto" }),
    btnO: { background: "transparent", color: "rgba(255,255,255,0.65)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans'" },
    chip: (c) => ({ display: "inline-block", background: c + "20", color: c, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }),
    glass: { background: C.glass, borderRadius: "16px", padding: "24px", border: `1px solid ${C.border}` },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px", marginTop: "24px" },
    input: { width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px 16px", color: C.text, fontSize: "15px", fontFamily: "'DM Sans'", outline: "none", marginBottom: "12px" },
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{margin:0}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
    @keyframes pulseGlow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
    @keyframes blink{0%,40%,100%{ry:11}45%,55%{ry:1}}
    @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes wave{0%,100%{height:6px}50%{height:28px}}
  `;

  // ─── LEADERBOARD MODAL ────────────────────────────────────
  const LBModal = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowLB(false)}>
      <div style={{ ...S.glass, maxWidth: "520px", width: "100%", maxHeight: "80vh", overflowY: "auto", background: C.bg2, border: `1px solid ${C.accent}33` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>🏆 Leaderboard</div>
          <button style={{ ...S.btnO, padding: "6px 14px", fontSize: "12px" }} onClick={() => setShowLB(false)}>✕</button>
        </div>
        {leaderboard.length === 0 ? <div style={{ textAlign: "center", color: C.muted, padding: "40px 0" }}>Nessun risultato ancora.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["#", "Nome", "Media", "Sessioni"].map(h => <th key={h} style={{ textAlign: h === "#" || h === "Nome" ? "left" : "center", padding: "8px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{leaderboard.map((r, i) => (
              <tr key={r.userId} style={{ background: r.userId === user?.id ? `${C.accent}12` : "transparent" }}>
                <td style={{ padding: "12px", fontSize: "18px" }}>{i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}</td>
                <td style={{ padding: "12px", fontWeight: r.userId === user?.id ? 700 : 400 }}>{r.name}{r.userId === user?.id && <span style={{ fontSize: "10px", color: C.accent, marginLeft: "6px" }}>(tu)</span>}</td>
                <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: r.avg >= 8 ? C.success : r.avg >= 6 ? C.warn : C.danger }}>{r.avg}</td>
                <td style={{ padding: "12px", textAlign: "center", color: C.muted }}>{r.count}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ═══ LOADING ═══
  if (screen === "loading") return (<div style={S.app}><style>{CSS}</style><div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={{ width: "40px", height: "40px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div></div>);

  // ═══ AUTH ═══
  if (screen === "auth") {
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={{ ...S.wrap, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>🎯</div>
          <div style={{ ...S.logo, marginBottom: "12px" }}>Alma Pratica</div>
          <h1 style={{ ...S.h1, fontSize: "clamp(24px,4vw,36px)", marginBottom: "8px" }}>Skill Forge</h1>
          <p style={{ fontSize: "14px", color: C.muted, marginBottom: "32px" }}>Allena le tue soft skills con simulazioni AI</p>

          {pendingMsg && <div style={{ background: `${C.success}18`, border: `1px solid ${C.success}33`, borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", fontSize: "14px", color: C.success, maxWidth: "400px" }}>{pendingMsg}</div>}

          <div style={{ maxWidth: "400px", width: "100%" }}>
            <div style={{ display: "flex", marginBottom: "20px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["login", "register"].map(t => (
                <button key={t} onClick={() => { setAuthScreen(t); setAuthError(""); setPendingMsg(""); }}
                  style={{ flex: 1, padding: "12px", background: authScreen === t ? `${C.accent}20` : "transparent", color: authScreen === t ? C.accent : C.muted, border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
                  {t === "login" ? "Accedi" : "Registrati"}
                </button>
              ))}
            </div>

            {authScreen === "register" && (
              <input type="text" placeholder="Il tuo nome" value={formName} onChange={e => setFormName(e.target.value)} style={S.input} />
            )}
            <input type="email" placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={S.input} />
            <input type="password" placeholder="Password" value={formPass} onChange={e => setFormPass(e.target.value)} style={S.input}
              onKeyDown={e => { if (e.key === "Enter") authScreen === "login" ? handleLogin() : handleRegister(); }} />

            {authError && <div style={{ color: C.danger, fontSize: "13px", marginBottom: "12px" }}>{authError}</div>}

            <button style={{ ...S.btn(C.accent, true), opacity: authLoading ? 0.6 : 1 }}
              onClick={authScreen === "login" ? handleLogin : handleRegister} disabled={authLoading}>
              {authLoading ? "..." : authScreen === "login" ? "Accedi" : "Registrati"}
            </button>

            {authScreen === "register" && (
              <p style={{ fontSize: "12px", color: C.muted, marginTop: "14px", lineHeight: 1.5 }}>
                Dopo la registrazione, l'amministratore dovrà approvare il tuo account.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══ ADMIN PANEL ═══
  if (screen === "admin") {
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700 }}>👑 Pannello Admin</h2>
            <button style={S.btnO} onClick={() => nav("home")}>← Torna all'app</button>
          </div>

          {adminLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}><div style={{ width: "32px", height: "32px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} /></div>
          ) : (
            <div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>{adminUsers.length} utenti registrati</div>
              {adminUsers.map(u => (
                <div key={u.id} style={{ ...S.glass, marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600 }}>
                      {u.name} {u.is_admin && <span style={S.chip(C.accent)}>Admin</span>}
                    </div>
                    <div style={{ fontSize: "13px", color: C.muted }}>{u.email} · {new Date(u.created_at).toLocaleDateString("it")}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button onClick={() => toggleApproval(u.id, u.approved)}
                      style={{ ...S.btn(u.approved ? C.danger : C.success), padding: "6px 14px", fontSize: "12px" }}>
                      {u.approved ? "Revoca" : "Approva"}
                    </button>
                    {!u.is_admin && (
                      <button onClick={() => removeUser(u.id)}
                        style={{ ...S.btnO, padding: "6px 12px", fontSize: "12px", color: C.danger, borderColor: `${C.danger}44` }}>
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ HOME ═══
  if (screen === "home") {
    return (
      <div style={S.app}><style>{CSS}</style>
        {showLB && <LBModal />}
        <div style={S.wrap}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "13px", color: C.muted }}>Ciao, <span style={{ color: C.accent, fontWeight: 600 }}>{user?.name}</span></div>
            <div style={{ display: "flex", gap: "8px" }}>
              {user?.isAdmin && <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px" }} onClick={() => { nav("admin"); loadAdminUsers(); }}>👑 Admin</button>}
              <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px" }} onClick={() => { setShowLB(true); loadLB(); }}>🏆</button>
              <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px" }} onClick={logout}>Esci</button>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0 14px" }}>
            <div style={S.logo}>Alma Pratica</div>
            <h1 style={{ ...S.h1, fontSize: "clamp(24px,4.5vw,38px)", marginTop: "8px" }}>Allena le tue<br />Soft Skills</h1>
          </div>
          {!selectedCategory ? (
            <div style={S.grid}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{ ...S.glass, cursor: "pointer", transition: "all 0.3s" }} onClick={() => setSelectedCategory(cat)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.icon}</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{cat.label}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.4 }}>{cat.description}</div>
                  <div style={{ marginTop: "10px", fontSize: "12px", color: cat.color }}>{cat.scenarios.length} scenari →</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "16px" }}>
              <button style={S.btnO} onClick={() => setSelectedCategory(null)}>← Indietro</button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0 14px" }}>
                <span style={{ fontSize: "32px" }}>{selectedCategory.icon}</span>
                <div><div style={{ fontSize: "20px", fontWeight: 700 }}>{selectedCategory.label}</div><div style={{ fontSize: "13px", color: C.muted }}>{selectedCategory.description}</div></div>
              </div>
              {selectedCategory.scenarios.map(sc => (
                <div key={sc.id} style={{ ...S.glass, cursor: "pointer", marginBottom: "10px", transition: "all 0.3s" }}
                  onClick={() => { setSelectedScenario(sc); nav("scenario"); }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = selectedCategory.color + "44"; e.currentTarget.style.transform = "translateX(6px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{sc.title}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.5 }}>{sc.brief}</div>
                  <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>{sc.eval.slice(0, 3).map(c => <span key={c} style={S.chip(selectedCategory.color)}>{c}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ SCENARIO BRIEFING ═══
  if (screen === "scenario") {
    const cat = CATEGORIES.find(c => c.scenarios.some(s => s.id === selectedScenario?.id));
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <button style={{ ...S.btnO, marginBottom: "18px" }} onClick={() => { setSelectedScenario(null); nav("home"); }}>← Indietro</button>
          <div style={S.chip(cat?.color || C.accent)}>{cat?.label}</div>
          <h2 style={{ ...S.h1, fontSize: "clamp(22px,4vw,32px)", marginTop: "10px" }}>{selectedScenario.title}</h2>
          <div style={{ ...S.glass, marginTop: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "8px" }}>Scenario</div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{selectedScenario.brief}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
            <div style={{ background: `${C.accent}12`, borderRadius: "12px", padding: "14px", border: `1px solid ${C.accent}25` }}><div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>Il tuo ruolo</div><div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_user}</div></div>
            <div style={{ background: `${C.teal}12`, borderRadius: "12px", padding: "14px", border: `1px solid ${C.teal}25` }}><div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>Parli con</div><div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_ai_full}</div></div>
          </div>
          <div style={{ marginTop: "18px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "10px" }}>Difficoltà</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {DIFF.map(d => (
                <div key={d.id} onClick={() => setDifficulty(d.id)} style={{ background: difficulty === d.id ? `${d.color}18` : C.glass, border: `2px solid ${difficulty === d.id ? d.color : C.border}`, borderRadius: "12px", padding: "14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s", transform: difficulty === d.id ? "scale(1.03)" : "scale(1)" }}>
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>{d.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: difficulty === d.id ? d.color : C.text }}>{d.label}</div>
                  <div style={{ fontSize: "10px", color: C.muted, marginTop: "3px", lineHeight: 1.3 }}>{d.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...S.glass, marginTop: "14px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "12px" }}>💡 Consigli</div>
            {selectedScenario.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <div style={{ minWidth: "22px", height: "22px", borderRadius: "50%", background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: C.accent }}>{i + 1}</div>
                <div style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>{t}</div>
              </div>
            ))}
          </div>
          <button style={{ ...S.btn(C.accent, true), marginTop: "20px" }} onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); nav("roleplay"); }}>🎭 Inizia</button>
        </div>
      </div>
    );
  }

  // ═══ ROLEPLAY ═══
  if (screen === "roleplay") {
    const di = DIFF.find(d => d.id === difficulty);
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={{ ...S.wrap, display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100dvh", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div><div style={{ fontSize: "15px", fontWeight: 600 }}>{selectedScenario.title}</div><div style={{ fontSize: "12px", color: C.muted }}>Turno {turnCount} · {di.icon} {di.label}</div></div>
            <button style={{ ...S.btn(C.danger), fontSize: "13px", padding: "8px 14px" }} onClick={genReport} disabled={conversation.length < 2}>Termina →</button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "14px 0", overflow: "hidden" }}>
            <Avatar speaking={isSpeaking} thinking={isThinking} size={Math.min(180, window.innerWidth * 0.4)} />
            <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "16px" }}>{selectedScenario.role_ai}</div>
            <div style={{ fontSize: "12px", color: C.muted, marginTop: "3px", height: "16px" }}>{isThinking ? "Sta pensando..." : isSpeaking ? "Sta parlando..." : turnCount === 0 ? "In attesa..." : "In ascolto"}</div>
            {lastAiText && <div style={{ marginTop: "16px", maxWidth: "480px", width: "100%", background: C.glass, borderRadius: "14px", padding: "12px 16px", fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", textAlign: "center", border: `1px solid ${C.border}`, maxHeight: "100px", overflowY: "auto" }}>{lastAiText}</div>}
            {currentTranscript && <div style={{ marginTop: "8px", maxWidth: "480px", width: "100%", background: `${C.accent}12`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "center" }}>{currentTranscript}</div>}
            {turnCount === 0 && !currentTranscript && <div style={{ marginTop: "12px", fontSize: "13px", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>Inizia come <span style={{ color: `${C.accent}88` }}>{selectedScenario.role_user}</span></div>}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 0 4px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              {speechSupported && <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px", background: inputMode === "voice" ? `${C.accent}20` : "transparent", borderColor: inputMode === "voice" ? C.accent : C.border }} onClick={() => setInputMode("voice")}>🎤 Voce</button>}
              <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px", background: inputMode === "text" ? `${C.accent}20` : "transparent", borderColor: inputMode === "text" ? C.accent : C.border }} onClick={() => setInputMode("text")}>⌨️ Testo</button>
            </div>
            {inputMode === "voice" ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", height: "28px" }}>
                  {Array.from({ length: 18 }).map((_, i) => <div key={i} style={{ width: "3px", borderRadius: "2px", background: isListening ? `linear-gradient(to top, ${C.danger}, ${C.accent})` : "rgba(255,255,255,0.06)", height: isListening ? undefined : "4px", animation: isListening ? "wave 1.2s ease-in-out infinite" : "none", animationDelay: `${i * 0.05}s` }} />)}
                </div>
                <div style={{ marginTop: "8px" }}>
                  {!isListening ? <button style={{ ...S.btn(C.accent), borderRadius: "50%", width: "56px", height: "56px", fontSize: "20px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }} onClick={startListening} disabled={isThinking || isSpeaking}>🎤</button>
                  : <button style={{ ...S.btn(C.danger), borderRadius: "50%", width: "56px", height: "56px", fontSize: "20px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s infinite" }} onClick={handleVoiceSend}>⏹</button>}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={userTextInput} onChange={e => setUserTextInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(userTextInput); }} placeholder="Scrivi..." style={{ ...S.input, marginBottom: 0, flex: 1 }} disabled={isThinking} />
                <button style={S.btn(C.accent)} onClick={() => handleSend(userTextInput)} disabled={!userTextInput.trim() || isThinking}>Invia</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══ REPORT ═══
  if (screen === "report") {
    const di = DIFF.find(d => d.id === difficulty);
    return (
      <div style={S.app}><style>{CSS}</style>
        {showLB && <LBModal />}
        <div style={S.wrap}>
          {isGeneratingReport || !report ? (
            <div style={{ textAlign: "center", paddingTop: "120px" }}><div style={{ width: "48px", height: "48px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} /><div style={{ fontSize: "18px", fontWeight: 600 }}>Analizzo...</div></div>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "24px 0 18px" }}>
                <div style={S.logo}>Report</div>
                <h2 style={{ ...S.h1, fontSize: "clamp(20px,4vw,30px)" }}>{selectedScenario.title}</h2>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "6px" }}>{user?.name} · {di.icon} {di.label} · {conversation.length} msg</div>
              </div>
              <div style={{ ...S.glass, textAlign: "center", marginBottom: "14px", padding: "28px" }}>
                <ScoreRing score={report.overall_score} size={120} sw={8} />
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Punteggio</div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginTop: "10px" }}>{report.summary}</p>
              </div>
              <div style={{ ...S.glass, marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Criteri</div>
                {report.scores.map((s, i) => { const col = s.score >= 8 ? C.success : s.score >= 6 ? C.warn : C.danger; return (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>{s.criterion}</span><span style={{ fontSize: "13px", fontWeight: 700, color: col }}>{s.score}/10</span></div>
                    <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "5px" }}><div style={{ width: `${s.score * 10}%`, height: "100%", background: col, transition: "width 1.5s" }} /></div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{s.comment}</div>
                  </div>
                ); })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: `${C.success}0D`, borderRadius: "14px", padding: "16px", border: `1px solid ${C.success}20` }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.success, marginBottom: "10px" }}>✓ Forza</div>
                  {report.strengths.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: "6px", paddingLeft: "10px", borderLeft: `2px solid ${C.success}33` }}>{s}</div>)}
                </div>
                <div style={{ background: `${C.danger}0D`, borderRadius: "14px", padding: "16px", border: `1px solid ${C.danger}20` }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.danger, marginBottom: "10px" }}>↑ Migliorare</div>
                  {report.improvements.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: "6px", paddingLeft: "10px", borderLeft: `2px solid ${C.danger}33` }}>{s}</div>)}
                </div>
              </div>
              {[{ key: "key_moment", icon: "⚡", label: "Momento Chiave", col: C.accent }, { key: "mistake_to_avoid", icon: "🚫", label: "Errore da Evitare", col: C.danger }, { key: "better_phrase", icon: "💬", label: "Come Dirlo Meglio", col: C.success }]
                .filter(x => report[x.key]).map(x => (
                <div key={x.key} style={{ background: `${x.col}0A`, borderRadius: "12px", padding: "16px", border: `1px solid ${x.col}18`, marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: x.col, marginBottom: "6px" }}>{x.icon} {x.label}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{report[x.key]}</div>
                </div>
              ))}
              <div style={{ background: `linear-gradient(135deg, ${C.accent}12, ${C.teal}12)`, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}`, marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>🎓 Consiglio</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>"{report.academy_tip}"</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button style={{ ...S.btn(C.accent), flex: 1 }} onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); nav("roleplay"); }}>🔄 Riprova</button>
                <button style={{ ...S.btnO, flex: 1 }} onClick={() => { setShowLB(true); loadLB(); }}>🏆</button>
                <button style={{ ...S.btnO, flex: 1 }} onClick={restart}>🏠 Home</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
}
