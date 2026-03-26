import { useState, useEffect, useRef, useCallback } from "react";

// ─── ALMA PRATICA COLOR PALETTE ─────────────────────────────────────────────
const C = {
  bg1: "#0D1B2A",      // deep navy
  bg2: "#1B2A4A",      // mid navy
  bg3: "#243B5E",      // lighter navy
  accent: "#E8863A",   // warm orange (energia)
  accent2: "#F4A63A",  // gold amber
  teal: "#2BA8A4",     // teal accent
  success: "#34C78A",  // green
  danger: "#E85A5A",   // red
  warn: "#F4C63A",     // yellow
  text: "#EDF0F5",     // light text
  muted: "rgba(237,240,245,0.4)",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
};

// ─── DIFFICULTY DEFINITIONS ─────────────────────────────────────────────────
const DIFFICULTIES = [
  { id: "easy", label: "Facile", icon: "🟢", color: C.success, desc: "Script lineare, interlocutore prevedibile e collaborativo" },
  { id: "medium", label: "Medio", icon: "🟡", color: C.warn, desc: "Interlocutore imprevedibile con reazioni realistiche" },
  { id: "hard", label: "Difficile", icon: "🔴", color: C.danger, desc: "Scenario delicato, interlocutore instabile e provocatorio" },
];

function getDifficultyModifier(diff) {
  if (diff === "easy") return `\nCOMPORTAMENTO FACILE: Sii collaborativo e prevedibile. Segui un percorso lineare: leggera resistenza iniziale → apertura → accordo. Rispondi positivamente a qualsiasi tentativo ragionevole dell'utente. Non creare complicazioni. Max 2 frasi.`;
  if (diff === "hard") return `\nCOMPORTAMENTO DIFFICILE: Sii emotivamente instabile e imprevedibile. Alterna momenti di calma a scatti emotivi improvvisi. Cambia opinione, porta up argomenti inaspettati, fai domande scomode, reagisci in modo sproporzionato a volte. Metti alla prova l'utente con provocazioni. Non rendere impossibile, ma molto sfidante. Max 3 frasi.`;
  return `\nCOMPORTAMENTO MEDIO: Sii realistico e moderatamente imprevedibile. Alterna collaborazione e resistenza. Reagisci in base alla qualità della comunicazione dell'utente. Max 2-3 frasi.`;
}

// ─── SCENARIOS ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "feedback", icon: "💬", label: "Dare Feedback", color: C.accent,
    description: "Comunica feedback costruttivo ed efficace",
    scenarios: [
      { id: "fb1", title: "Performance Insufficiente", brief: "Un membro del tuo team non raggiunge gli obiettivi da 2 mesi. Comunica il problema in modo chiaro ed empatico.", role_user: "Manager del team marketing", role_ai: "Marco", role_ai_full: "Marco, il tuo diretto report", ai_personality: "Dipendente in calo da 2 mesi. Inizialmente difensivo, poi più aperto se comunicato bene. Se aggressivo, chiuditi. Se vago, chiedi chiarimenti.", tips: ["Modello SBI: Situazione, Comportamento, Impatto", "Riconosci i punti di forza prima", "Sii specifico con esempi concreti", "Chiedi il suo punto di vista", "Concludi con un piano d'azione"], evaluation_criteria: ["Empatia e tono", "Specificità del feedback", "Struttura conversazione", "Orientamento alla soluzione", "Ascolto attivo"] },
      { id: "fb2", title: "Feedback a un Senior", brief: "Dai feedback a un collega più esperto che ha gestito male una presentazione al cliente.", role_user: "Project Manager junior", role_ai: "Laura", role_ai_full: "Laura, Senior Consultant", ai_personality: "Esperta e orgogliosa. Scettica su feedback da un junior. Se rispettoso e con dati, ricettiva. Se presuntuoso, irritata.", tips: ["Chiedi il permesso prima", "Usa 'io ho notato' non 'tu hai fatto'", "Riconosci la loro esperienza", "Focalizzati sull'impatto", "Proponi come supporto"], evaluation_criteria: ["Rispetto della seniority", "Diplomazia", "Uso di dati oggettivi", "Posizionamento feedback", "Gestione resistenza"] },
    ]
  },
  {
    id: "difficult", icon: "🔥", label: "Conversazioni Difficili", color: "#D4812F",
    description: "Gestisci conflitti e situazioni delicate",
    scenarios: [
      { id: "dc1", title: "Conflitto nel Team", brief: "Due membri del team in conflitto aperto. Devi mediare.", role_user: "Team Lead sviluppo software", role_ai: "Andrea", role_ai_full: "Andrea, sviluppatore frustrato", ai_personality: "Frustrato perché il collega non rispetta le deadline. Emotivo ma professionale. Se mediato bene, vede l'altro punto di vista.", tips: ["Stabilisci regole base", "Ascolta senza schierarti", "Riformula per validare", "Cerca interessi comuni", "Convergi su soluzioni pratiche"], evaluation_criteria: ["Neutralità", "Gestione emozioni", "Riformulazione attiva", "Mediazione", "Raggiungimento accordo"] },
      { id: "dc2", title: "Comunicare un Licenziamento", brief: "Comunica che la posizione è eliminata per ristrutturazione. Non legato alla performance.", role_user: "HR Manager", role_ai: "Fabio", role_ai_full: "Fabio, dipendente da 5 anni", ai_personality: "Non se lo aspetta. Shock, poi rabbia, poi preoccupazione. Se empatico, accetta. Se freddo, ostile.", tips: ["Vai dritto al punto in 30 secondi", "Empatia genuina", "Spiega: ristrutturazione, non performance", "Dettagli pratici", "Dai spazio alle emozioni"], evaluation_criteria: ["Chiarezza", "Empatia genuina", "Gestione reazioni", "Info pratiche", "Dignità e rispetto"] },
    ]
  },
  {
    id: "sales", icon: "📞", label: "Sales & Cold Calls", color: "#4A8FE7",
    description: "Perfeziona vendita e primo contatto",
    scenarios: [
      { id: "sc1", title: "Cold Call B2B", brief: "Chiami il responsabile acquisti per proporre software. 60 secondi per catturare l'attenzione.", role_user: "Sales Development Rep", role_ai: "Dott.ssa Bianchi", role_ai_full: "Dott.ssa Bianchi, Resp. Acquisti", ai_personality: "Occupatissima e scettica. Fredda. Se pitch specifico, minimo interesse. Se generico, taglia corto.", tips: ["Primi 10 sec: valore, non prodotto", "Domande aperte sui pain points", "Obiezioni = opportunità", "Obiettivo: secondo meeting"], evaluation_criteria: ["Opening hook", "Gestione obiezioni", "Domande discovery", "Value proposition", "Chiusura next step"] },
      { id: "sc2", title: "Negoziazione Prezzo", brief: "Il cliente vuole -40%. Max sconto 15%. Negozia mantenendo il valore.", role_user: "Account Executive", role_ai: "Giorgio", role_ai_full: "Giorgio, CFO cliente", ai_personality: "Negoziatore esperto. Tattiche classiche. Se value-based selling, accetta compromesso. Se cede, chiede di più.", tips: ["Giustifica valore, non prezzo", "Chiedi motivo sconto", "Alternative creative", "Il silenzio è un'arma", "Ancora sui risultati"], evaluation_criteria: ["Difesa valore", "Creatività alternative", "Gestione pressione", "Comprensione bisogni", "Win-win"] },
    ]
  },
  {
    id: "leadership", icon: "🎯", label: "Leadership", color: C.teal,
    description: "Guida e ispira il tuo team",
    scenarios: [
      { id: "ld1", title: "Delegare Efficacemente", brief: "Delega progetto critico a qualcuno capace ma insicuro.", role_user: "Director of Engineering", role_ai: "Sara", role_ai_full: "Sara, sviluppatrice talentuosa", ai_personality: "Competente ma insicura. Entusiasmo + preoccupazione. Se supportata, sicura. Se micromanaggiata, frustrata.", tips: ["Spiega perché hai scelto lei", "Outcome e confini di autonomia", "Checkpoint senza micromanagement", "Anticipa le paure", "Mostra fiducia genuina"], evaluation_criteria: ["Chiarezza delega", "Empowerment", "Supporto strutturato", "Costruzione fiducia", "Success criteria"] },
      { id: "ld2", title: "Annunciare un Cambiamento", brief: "Lavoro ibrido obbligatorio. Non piacerà. Comunicalo.", role_user: "People Manager", role_ai: "Luca", role_ai_full: "Luca, il più vocale del team", ai_personality: "Resistente, provocatorio, pratico. Se spiega e ascolta, costruttivo. Se impone, organizza resistenza.", tips: ["Prima il 'perché', poi il 'cosa'", "Riconosci preoccupazioni", "Trasparente su cosa è negoziabile", "Coinvolgi nei dettagli", "Timeline chiara"], evaluation_criteria: ["Comunicazione razionale", "Gestione resistenza", "Trasparenza", "Coinvolgimento", "Visione"] },
    ]
  },
  {
    id: "networking", icon: "🤝", label: "Networking", color: C.accent2,
    description: "Costruisci relazioni professionali",
    scenarios: [
      { id: "nw1", title: "Elevator Pitch", brief: "90 secondi con un investitore. Sii memorabile.", role_user: "Founder startup", role_ai: "Roberto", role_ai_full: "Roberto, Business Angel", ai_personality: "Gentile ma poco tempo. Distratto. Se originale, ascolta. Se generico, taglia.", tips: ["Hook di curiosità", "Problema prima della soluzione", "Numeri concreti", "Ask specifico"], evaluation_criteria: ["Impatto iniziale", "Conciseness", "Storytelling", "Adattamento audience", "Call to action"] },
    ]
  },
  {
    id: "emotional", icon: "🧠", label: "Intelligenza Emotiva", color: "#E17055",
    description: "Gestisci emozioni tue e degli altri",
    scenarios: [
      { id: "ei1", title: "Collega in Burnout", brief: "Collega in burnout. Produttività cala. Affronta con sensibilità.", role_user: "Team Lead", role_ai: "Chiara", role_ai_full: "Chiara, collega in burnout", ai_personality: "Esausta ma nasconde. Minimizza. Se empatia genuina, si apre. Se diretto o aziendalista, si chiude.", tips: ["Momento privato", "Osserva senza giudicare", "Ascolta 80% parla 20%", "Offri supporto, non soluzioni", "Rispetta i confini"], evaluation_criteria: ["Empatia", "Ascolto attivo", "Rispetto confini", "Supporto pratico", "Non giudizio"] },
    ]
  }
];

// ─── PROMPTS ────────────────────────────────────────────────────────────────
function buildSystemPrompt(sc, diff) {
  return `Sei ${sc.role_ai_full} in un roleplay. Contesto: ${sc.brief}
Personalità: ${sc.ai_personality}
Regole: resta nel personaggio, italiano, breve e naturale. Non dare consigli. Dopo 8 scambi concludi.${getDifficultyModifier(diff)}`;
}

function buildEvalPrompt(sc, convo, diff) {
  const txt = convo.map(m => `${m.role === "user" ? "UTENTE" : sc.role_ai}: ${m.text}`).join("\n");
  return `Executive coach. Valuta questo roleplay (difficoltà: ${diff}).
Scenario: ${sc.brief} | Ruolo utente: ${sc.role_user} | Criteri: ${sc.evaluation_criteria.join(", ")}
Conversazione:
${txt}
ISTRUZIONI: Sii ONESTO. Punteggi DIVERSI per ogni criterio (varia 4-9). Commenti con ESEMPI dalla conversazione. 3 punti di forza e 3 miglioramenti CONCRETI. Cita scambi precisi.
Rispondi SOLO JSON valido:
{"overall_score":7,"summary":"2-3 frasi dettagliate.","scores":[{"criterion":"Nome","score":6,"comment":"2 frasi con esempio."}],"strengths":["Specifico con esempio","Due","Tre"],"improvements":["Specifico con esempio","Due","Tre"],"key_moment":"Scambio chiave e perché.","mistake_to_avoid":"Cosa non ha funzionato con esempio.","better_phrase":"ORIGINALE → MIGLIORATA","academy_tip":"Framework o tecnica pratica."}`;
}

// ─── LEADERBOARD STORAGE ────────────────────────────────────────────────────
function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem("sf_leaderboard") || "{}"); } catch { return {}; }
}
function saveScore(name, score) {
  const lb = getLeaderboard();
  if (!lb[name]) lb[name] = { total: 0, count: 0 };
  lb[name].total += score;
  lb[name].count += 1;
  localStorage.setItem("sf_leaderboard", JSON.stringify(lb));
}
function getPlayerName() { return localStorage.getItem("sf_player") || ""; }
function savePlayerName(n) { localStorage.setItem("sf_player", n); }

// ─── AVATAR ─────────────────────────────────────────────────────────────────
function Avatar({ speaking, thinking, size = 180 }) {
  const [mouth, setMouth] = useState(false);
  useEffect(() => {
    if (!speaking) { setMouth(false); return; }
    const iv = setInterval(() => setMouth(p => !p), 170);
    return () => clearInterval(iv);
  }, [speaking]);
  const glow = speaking ? `${C.accent}66` : thinking ? `${C.teal}44` : "rgba(255,255,255,0.03)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: -24, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, transition: "all 0.5s", animation: speaking ? "pulseGlow 2s ease-in-out infinite" : "none" }} />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
        <defs><radialGradient id="fg" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor={`${C.accent}15`} /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        <circle cx="100" cy="100" r="80" fill={C.bg2} stroke={`${C.accent}33`} strokeWidth="2" />
        <circle cx="100" cy="100" r="80" fill="url(#fg)" />
        <g style={{ animation: thinking ? "blink 1s infinite" : "none" }}>
          <ellipse cx="72" cy="88" rx="10" ry={thinking ? 2 : 11} fill={C.text} style={{ transition: "ry 0.15s" }} />
          <ellipse cx="128" cy="88" rx="10" ry={thinking ? 2 : 11} fill={C.text} style={{ transition: "ry 0.15s" }} />
          <circle cx="74" cy="87" r="5" fill={C.accent} /><circle cx="130" cy="87" r="5" fill={C.accent} />
          <circle cx="76" cy="85" r="2" fill="white" /><circle cx="132" cy="85" r="2" fill="white" />
        </g>
        <line x1="58" y1="72" x2="84" y2={speaking ? 70 : 74} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 0.3s" }} />
        <line x1="116" y1={speaking ? 70 : 74} x2="142" y2="72" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 0.3s" }} />
        <path d="M96 100 Q100 108 104 100" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {speaking ? (
          <ellipse cx="100" cy="125" rx={mouth ? 16 : 10} ry={mouth ? 12 : 4} fill="#1A0F30" stroke={`${C.accent}88`} strokeWidth="1.5" style={{ transition: "all 0.12s" }} />
        ) : (<path d="M82 122 Q100 136 118 122" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" />)}
        <circle cx="60" cy="108" r="12" fill={`${C.accent}0D`} /><circle cx="140" cy="108" r="12" fill={`${C.accent}0D`} />
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
  const [screen, setScreen] = useState("welcome");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const convoRef = useRef([]);

  useEffect(() => { convoRef.current = conversation; }, [conversation]);
  useEffect(() => {
    const has = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(has); if (!has) setInputMode("text");
    synthRef.current = window.speechSynthesis;
    const saved = getPlayerName();
    if (saved) { setPlayerName(saved); setScreen("home"); }
    setAnimateIn(true);
  }, []);

  const nav = useCallback((to) => {
    setAnimateIn(false);
    setTimeout(() => { setScreen(to); setAnimateIn(true); }, 250);
  }, []);

  const callAI = async (messages, system, maxTok) => {
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, system, max_tokens: maxTok || 200 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fail");
      return data.response || "";
    } catch (e) { console.error("AI Error:", e); return "Mi scusi, può ripetere?"; }
  };

  const speak = useCallback((text) => {
    if (!synthRef.current) return Promise.resolve();
    return new Promise(resolve => {
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT"; u.rate = 1.15; u.pitch = 1.05;
      const v = synthRef.current.getVoices().find(v => v.lang.startsWith("it"));
      if (v) u.voice = v;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => { setIsSpeaking(false); resolve(); };
      u.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current.speak(u);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = "it-IT"; rec.interimResults = true; rec.continuous = true;
    let f = "";
    rec.onresult = e => { let i = ""; for (let j = e.resultIndex; j < e.results.length; j++) { if (e.results[j].isFinal) f += e.results[j][0].transcript + " "; else i += e.results[j][0].transcript; } setCurrentTranscript(f + i); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec; rec.start(); setIsListening(true); setCurrentTranscript("");
  }, [speechSupported]);

  const stopListening = useCallback(() => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); }, []);

  const handleSend = useCallback(async (text) => {
    if (!text?.trim() || !selectedScenario) return;
    const msg = { role: "user", text: text.trim() };
    const nc = [...convoRef.current, msg];
    setConversation(nc); setCurrentTranscript(""); setUserTextInput(""); setIsThinking(true); setLastAiText("");
    const am = nc.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    const ai = await callAI(am, buildSystemPrompt(selectedScenario, difficulty), 200);
    setConversation(prev => [...prev, { role: "ai", text: ai }]);
    setLastAiText(ai); setTurnCount(prev => prev + 1); setIsThinking(false); speak(ai);
  }, [selectedScenario, difficulty, speak]);

  const handleVoiceSend = useCallback(() => { stopListening(); setTimeout(() => handleSend(currentTranscript), 100); }, [stopListening, handleSend, currentTranscript]);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true); nav("report");
    const prompt = buildEvalPrompt(selectedScenario, convoRef.current, difficulty);
    let parsed = null;
    for (let a = 0; a < 2 && !parsed; a++) {
      const raw = await callAI([{ role: "user", content: prompt }], "Executive coach. Rispondi ESCLUSIVAMENTE JSON valido. Niente testo extra. Inizia con { finisci con }.", 1024);
      try { const c = raw.replace(/```json|```/g, "").trim(); const s = c.indexOf("{"), e = c.lastIndexOf("}"); if (s !== -1 && e !== -1) parsed = JSON.parse(c.slice(s, e + 1)); } catch {}
    }
    if (!parsed) {
      const bs = [6, 7, 5, 8, 6];
      parsed = { overall_score: 6, summary: "La conversazione mostra impegno ma necessita di maggiore struttura e specificità.", scores: selectedScenario.evaluation_criteria.map((c, i) => ({ criterion: c, score: bs[i % 5], comment: `Attenzione a "${c.toLowerCase()}": prova a essere più intenzionale.` })), strengths: ["Volontà di affrontare la conversazione", "Tono appropriato", "Focus sull'obiettivo"], improvements: ["Usa più domande aperte", "Sii più specifico con esempi", "Struttura meglio la conversazione"], key_moment: "Il momento iniziale ha impostato il tono.", mistake_to_avoid: "Evita di passare subito alla soluzione senza ascoltare.", better_phrase: "'Devi migliorare' → 'Come vedi la situazione dal tuo punto di vista?'", academy_tip: "Regola 70/30: ascolta 70%, parla 30%. Le domande aperte sono il tuo strumento più potente." };
    }
    saveScore(playerName, parsed.overall_score);
    setReport(parsed); setIsGeneratingReport(false);
  }, [selectedScenario, difficulty, nav, playerName]);

  const restart = () => {
    setConversation([]); setReport(null); setSelectedScenario(null);
    setSelectedCategory(null); setCurrentTranscript(""); setLastAiText("");
    setTurnCount(0); setDifficulty("medium"); nav("home");
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: `linear-gradient(160deg, ${C.bg1} 0%, ${C.bg2} 50%, ${C.bg1} 100%)`, fontFamily: "'DM Sans', sans-serif", color: C.text, position: "relative" },
    wrap: { maxWidth: "900px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 1, opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" },
    logo: { fontSize: "11px", letterSpacing: "6px", textTransform: "uppercase", color: C.muted },
    h1: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, lineHeight: 1.1, margin: 0, background: `linear-gradient(135deg, #FFF 0%, ${C.accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    btn: (color = C.accent, full = false) => ({ background: color, color: "#fff", border: "none", borderRadius: "12px", padding: full ? "16px 32px" : "12px 24px", fontSize: full ? "16px" : "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'", transition: "all 0.2s", width: full ? "100%" : "auto" }),
    btnO: { background: "transparent", color: "rgba(255,255,255,0.65)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans'" },
    chip: (col) => ({ display: "inline-block", background: col + "20", color: col, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }),
    glass: { background: C.glass, borderRadius: "16px", padding: "24px", border: `1px solid ${C.border}` },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px", marginTop: "24px" },
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
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  `;

  // ─── LEADERBOARD PANEL ────────────────────────────────────────────────────
  const LeaderboardPanel = () => {
    const lb = getLeaderboard();
    const rows = Object.entries(lb).map(([name, d]) => ({ name, avg: Math.round((d.total / d.count) * 10) / 10, count: d.count })).sort((a, b) => b.avg - a.avg || b.count - a.count);
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowLeaderboard(false)}>
        <div style={{ ...S.glass, maxWidth: "500px", width: "100%", maxHeight: "80vh", overflowY: "auto", background: C.bg2, border: `1px solid ${C.accent}33` }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>🏆 Leaderboard</div>
            <button style={{ ...S.btnO, padding: "6px 14px", fontSize: "12px" }} onClick={() => setShowLeaderboard(false)}>✕</button>
          </div>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", color: C.muted, padding: "40px 0" }}>Nessun risultato ancora. Completa uno scenario!</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>#</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>Nome</th>
                <th style={{ textAlign: "center", padding: "8px 12px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>Media</th>
                <th style={{ textAlign: "center", padding: "8px 12px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>Sessioni</th>
              </tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={r.name} style={{ background: r.name === playerName ? `${C.accent}12` : "transparent" }}>
                  <td style={{ padding: "12px", fontSize: "18px" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}</td>
                  <td style={{ padding: "12px", fontWeight: r.name === playerName ? 700 : 400 }}>{r.name} {r.name === playerName && <span style={{ fontSize: "10px", color: C.accent }}>(tu)</span>}</td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: r.avg >= 8 ? C.success : r.avg >= 6 ? C.warn : C.danger }}>{r.avg}</td>
                  <td style={{ padding: "12px", textAlign: "center", color: C.muted }}>{r.count}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ═══ WELCOME ═══
  if (screen === "welcome") {
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={{ ...S.wrap, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px", animation: "fadeUp 0.6s ease" }}>🎯</div>
          <div style={{ ...S.logo, marginBottom: "16px" }}>Alma Pratica</div>
          <h1 style={{ ...S.h1, marginBottom: "8px" }}>Skill Forge</h1>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.6, marginBottom: "36px" }}>Allena le tue soft skills con simulazioni AI</p>
          <div style={{ maxWidth: "360px", width: "100%" }}>
            <div style={{ fontSize: "13px", color: C.muted, marginBottom: "8px", textAlign: "left" }}>Come ti chiami?</div>
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && nameInput.trim()) { savePlayerName(nameInput.trim()); setPlayerName(nameInput.trim()); nav("home"); }}}
              placeholder="Il tuo nome..."
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px", color: C.text, fontSize: "16px", fontFamily: "'DM Sans'", outline: "none", marginBottom: "16px", textAlign: "center" }}
              autoFocus />
            <button style={{ ...S.btn(C.accent, true), opacity: nameInput.trim() ? 1 : 0.4 }}
              onClick={() => { if (nameInput.trim()) { savePlayerName(nameInput.trim()); setPlayerName(nameInput.trim()); nav("home"); }}}>
              Inizia →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ HOME ═══
  if (screen === "home") {
    return (
      <div style={S.app}><style>{CSS}</style>
        {showLeaderboard && <LeaderboardPanel />}
        <div style={S.wrap}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", color: C.muted }}>Ciao, <span style={{ color: C.accent, fontWeight: 600 }}>{playerName}</span></div>
            <button style={{ ...S.btnO, padding: "6px 14px", fontSize: "12px" }} onClick={() => setShowLeaderboard(true)}>🏆 Leaderboard</button>
          </div>
          <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
            <div style={S.logo}>Alma Pratica</div>
            <h1 style={{ ...S.h1, fontSize: "clamp(26px,4.5vw,40px)", marginTop: "8px" }}>Allena le tue<br />Soft Skills</h1>
            <p style={{ fontSize: "14px", color: C.muted, marginTop: "10px" }}>Scegli, simula con l'avatar AI, ricevi feedback</p>
          </div>
          {!selectedCategory ? (
            <div style={S.grid}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{ ...S.glass, cursor: "pointer", transition: "all 0.3s" }}
                  onClick={() => setSelectedCategory(cat)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>{cat.icon}</div>
                  <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "4px" }}>{cat.label}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.5 }}>{cat.description}</div>
                  <div style={{ marginTop: "12px", fontSize: "12px", color: cat.color }}>{cat.scenarios.length} scenari →</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <button style={S.btnO} onClick={() => setSelectedCategory(null)}>← Indietro</button>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "20px 0 16px" }}>
                <span style={{ fontSize: "34px" }}>{selectedCategory.icon}</span>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>{selectedCategory.label}</div>
                  <div style={{ fontSize: "13px", color: C.muted }}>{selectedCategory.description}</div>
                </div>
              </div>
              {selectedCategory.scenarios.map(sc => (
                <div key={sc.id} style={{ ...S.glass, cursor: "pointer", marginBottom: "12px", transition: "all 0.3s" }}
                  onClick={() => { setSelectedScenario(sc); nav("scenario"); }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = selectedCategory.color + "44"; e.currentTarget.style.transform = "translateX(6px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>{sc.title}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.5 }}>{sc.brief}</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                    {sc.evaluation_criteria.slice(0, 3).map(c => <span key={c} style={S.chip(selectedCategory.color)}>{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ SCENARIO BRIEFING + DIFFICULTY ═══
  if (screen === "scenario") {
    const cat = CATEGORIES.find(c => c.scenarios.some(s => s.id === selectedScenario?.id));
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <button style={{ ...S.btnO, marginBottom: "20px" }} onClick={() => { setSelectedScenario(null); nav("home"); }}>← Indietro</button>
          <div style={S.chip(cat?.color || C.accent)}>{cat?.label}</div>
          <h2 style={{ ...S.h1, fontSize: "clamp(22px,4vw,34px)", marginTop: "10px" }}>{selectedScenario.title}</h2>

          <div style={{ ...S.glass, marginTop: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "10px" }}>Scenario</div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{selectedScenario.brief}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
            <div style={{ background: `${C.accent}12`, borderRadius: "12px", padding: "14px", border: `1px solid ${C.accent}25` }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>Il tuo ruolo</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_user}</div>
            </div>
            <div style={{ background: `${C.teal}12`, borderRadius: "12px", padding: "14px", border: `1px solid ${C.teal}25` }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>Parli con</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_ai_full}</div>
            </div>
          </div>

          {/* DIFFICULTY SELECTOR */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "12px" }}>Scegli la difficoltà</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {DIFFICULTIES.map(d => (
                <div key={d.id} onClick={() => setDifficulty(d.id)} style={{
                  background: difficulty === d.id ? `${d.color}18` : C.glass,
                  border: `2px solid ${difficulty === d.id ? d.color : C.border}`,
                  borderRadius: "14px", padding: "16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  transform: difficulty === d.id ? "scale(1.03)" : "scale(1)",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{d.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: difficulty === d.id ? d.color : C.text }}>{d.label}</div>
                  <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px", lineHeight: 1.4 }}>{d.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...S.glass, marginTop: "16px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "14px" }}>💡 Consigli</div>
            {selectedScenario.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "22px", height: "22px", borderRadius: "50%", background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: C.accent }}>{i + 1}</div>
                <div style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>{t}</div>
              </div>
            ))}
          </div>

          <button style={{ ...S.btn(C.accent, true), marginTop: "24px" }}
            onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); nav("roleplay"); }}>
            🎭 Inizia il Roleplay
          </button>
        </div>
      </div>
    );
  }

  // ═══ ROLEPLAY ═══
  if (screen === "roleplay") {
    const diffInfo = DIFFICULTIES.find(d => d.id === difficulty);
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={{ ...S.wrap, display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100dvh", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{selectedScenario.title}</div>
              <div style={{ fontSize: "12px", color: C.muted }}>Turno {turnCount} · {diffInfo.icon} {diffInfo.label}</div>
            </div>
            <button style={{ ...S.btn(C.danger), fontSize: "13px", padding: "8px 16px" }} onClick={generateReport} disabled={conversation.length < 2}>Termina →</button>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "16px 0", overflow: "hidden" }}>
            <Avatar speaking={isSpeaking} thinking={isThinking} size={Math.min(190, window.innerWidth * 0.42)} />
            <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "18px" }}>{selectedScenario.role_ai}</div>
            <div style={{ fontSize: "12px", color: C.muted, marginTop: "3px", height: "18px" }}>
              {isThinking ? "Sta pensando..." : isSpeaking ? "Sta parlando..." : turnCount === 0 ? "In attesa..." : "In ascolto"}
            </div>
            {lastAiText && (
              <div style={{ marginTop: "18px", maxWidth: "500px", width: "100%", background: C.glass, borderRadius: "14px", padding: "14px 18px", fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", textAlign: "center", border: `1px solid ${C.border}`, maxHeight: "110px", overflowY: "auto" }}>{lastAiText}</div>
            )}
            {currentTranscript && (
              <div style={{ marginTop: "10px", maxWidth: "500px", width: "100%", background: `${C.accent}12`, borderRadius: "12px", padding: "10px 16px", fontSize: "13px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "center", border: `1px solid ${C.accent}18` }}>{currentTranscript}</div>
            )}
            {turnCount === 0 && !currentTranscript && (
              <div style={{ marginTop: "14px", fontSize: "14px", color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6 }}>
                Inizia come <span style={{ color: `${C.accent}99` }}>{selectedScenario.role_user}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 0 6px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
              {speechSupported && <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px", background: inputMode === "voice" ? `${C.accent}20` : "transparent", borderColor: inputMode === "voice" ? C.accent : C.border }} onClick={() => setInputMode("voice")}>🎤 Voce</button>}
              <button style={{ ...S.btnO, padding: "5px 12px", fontSize: "12px", background: inputMode === "text" ? `${C.accent}20` : "transparent", borderColor: inputMode === "text" ? C.accent : C.border }} onClick={() => setInputMode("text")}>⌨️ Testo</button>
            </div>
            {inputMode === "voice" ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", height: "30px" }}>
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} style={{ width: "3px", borderRadius: "2px", background: isListening ? `linear-gradient(to top, ${C.danger}, ${C.accent})` : "rgba(255,255,255,0.08)", height: isListening ? undefined : "5px", animation: isListening ? "wave 1.2s ease-in-out infinite" : "none", animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <div style={{ marginTop: "8px" }}>
                  {!isListening ? (
                    <button style={{ ...S.btn(C.accent), borderRadius: "50%", width: "58px", height: "58px", fontSize: "22px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }} onClick={startListening} disabled={isThinking || isSpeaking}>🎤</button>
                  ) : (
                    <button style={{ ...S.btn(C.danger), borderRadius: "50%", width: "58px", height: "58px", fontSize: "22px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s infinite" }} onClick={handleVoiceSend}>⏹</button>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "5px" }}>
                  {isListening ? "Premi per inviare" : isSpeaking ? "Risposta..." : "Premi per parlare"}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={userTextInput} onChange={e => setUserTextInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(userTextInput); }} placeholder="Scrivi..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px 16px", color: C.text, fontSize: "14px", fontFamily: "'DM Sans'", outline: "none" }} disabled={isThinking} />
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
    const diffInfo = DIFFICULTIES.find(d => d.id === difficulty);
    return (
      <div style={S.app}><style>{CSS}</style>
        {showLeaderboard && <LeaderboardPanel />}
        <div style={S.wrap}>
          {isGeneratingReport || !report ? (
            <div style={{ textAlign: "center", paddingTop: "120px" }}>
              <div style={{ width: "48px", height: "48px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
              <div style={{ fontSize: "18px", fontWeight: 600 }}>Analizzo la conversazione...</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
                <div style={S.logo}>Report di Valutazione</div>
                <h2 style={{ ...S.h1, fontSize: "clamp(22px,4vw,32px)" }}>{selectedScenario.title}</h2>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "8px" }}>{playerName} · {diffInfo.icon} {diffInfo.label} · {conversation.length} messaggi</div>
              </div>

              <div style={{ ...S.glass, textAlign: "center", marginBottom: "16px", padding: "28px" }}>
                <ScoreRing score={report.overall_score} size={130} sw={8} />
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>Punteggio</div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginTop: "12px", maxWidth: "520px", margin: "12px auto 0" }}>{report.summary}</p>
              </div>

              <div style={{ ...S.glass, marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "18px" }}>Valutazione per Criterio</div>
                {report.scores.map((s, i) => {
                  const col = s.score >= 8 ? C.success : s.score >= 6 ? C.warn : C.danger;
                  return (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{s.criterion}</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: col }}>{s.score}/10</span>
                      </div>
                      <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "6px" }}>
                        <div style={{ width: `${s.score * 10}%`, height: "100%", borderRadius: "2px", background: col, transition: "width 1.5s" }} />
                      </div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{s.comment}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: `${C.success}0D`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.success}20` }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.success, marginBottom: "12px" }}>✓ Punti di Forza</div>
                  {report.strengths.map((s, i) => <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${C.success}33` }}>{s}</div>)}
                </div>
                <div style={{ background: `${C.danger}0D`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.danger}20` }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.danger, marginBottom: "12px" }}>↑ Aree di Miglioramento</div>
                  {report.improvements.map((s, i) => <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${C.danger}33` }}>{s}</div>)}
                </div>
              </div>

              <div style={{ background: `${C.accent}0D`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.accent}20`, marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.accent, marginBottom: "8px" }}>⚡ Momento Chiave</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{report.key_moment}</div>
              </div>

              {report.mistake_to_avoid && (
                <div style={{ background: `${C.danger}0A`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.danger}15`, marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.danger, marginBottom: "8px" }}>🚫 Errore da Evitare</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{report.mistake_to_avoid}</div>
                </div>
              )}

              {report.better_phrase && (
                <div style={{ background: `${C.success}0A`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.success}15`, marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.success, marginBottom: "8px" }}>💬 Come Dirlo Meglio</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{report.better_phrase}</div>
                </div>
              )}

              <div style={{ background: `linear-gradient(135deg, ${C.accent}12, ${C.teal}12)`, borderRadius: "14px", padding: "18px", border: `1px solid ${C.border}`, marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "8px" }}>🎓 Consiglio dell'Accademia</div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>"{report.academy_tip}"</div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button style={{ ...S.btn(C.accent), flex: 1 }} onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); nav("roleplay"); }}>🔄 Riprova</button>
                <button style={{ ...S.btnO, flex: 1 }} onClick={() => setShowLeaderboard(true)}>🏆 Leaderboard</button>
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
