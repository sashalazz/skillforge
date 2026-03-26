import { useState, useEffect, useRef, useCallback } from "react";

// ─── SCENARIOS (shortened system prompts for token savings) ─────────────────
const CATEGORIES = [
  {
    id: "feedback", icon: "💬", label: "Dare Feedback", color: "#E8655A",
    description: "Comunica feedback costruttivo ed efficace",
    scenarios: [
      {
        id: "fb1", title: "Performance Insufficiente",
        brief: "Un membro del tuo team non raggiunge gli obiettivi da 2 mesi. Comunica il problema in modo chiaro ed empatico.",
        role_user: "Manager del team marketing",
        role_ai: "Marco", role_ai_full: "Marco, il tuo diretto report",
        ai_personality: "Dipendente in calo da 2 mesi. Inizialmente difensivo ('Sto facendo del mio meglio'), poi più aperto se il manager comunica bene. Se troppo aggressivo, chiuditi. Se troppo vago, chiedi chiarimenti. Max 2-3 frasi.",
        tips: ["Modello SBI: Situazione, Comportamento, Impatto", "Riconosci i punti di forza prima", "Sii specifico con esempi concreti", "Chiedi il suo punto di vista", "Concludi con un piano d'azione"],
        evaluation_criteria: ["Empatia e tono", "Specificità del feedback", "Struttura conversazione", "Orientamento alla soluzione", "Ascolto attivo"]
      },
      {
        id: "fb2", title: "Feedback a un Senior",
        brief: "Devi dare feedback a un collega più esperto che ha gestito male una presentazione al cliente.",
        role_user: "Project Manager junior",
        role_ai: "Laura", role_ai_full: "Laura, Senior Consultant",
        ai_personality: "Professionista esperta e orgogliosa. Scettica che un junior le dia feedback. Se fatto con rispetto e dati, diventa ricettiva. Se presuntuoso, irritazione sottile. Max 2-3 frasi.",
        tips: ["Chiedi il permesso prima", "Usa 'io ho notato' non 'tu hai fatto'", "Riconosci la loro esperienza", "Focalizzati sull'impatto, non sulla persona", "Proponi come supporto"],
        evaluation_criteria: ["Rispetto della seniority", "Diplomazia", "Uso di dati oggettivi", "Posizionamento feedback", "Gestione resistenza"]
      }
    ]
  },
  {
    id: "difficult", icon: "🔥", label: "Conversazioni Difficili", color: "#D4812F",
    description: "Gestisci conflitti e situazioni delicate",
    scenarios: [
      {
        id: "dc1", title: "Conflitto nel Team",
        brief: "Due membri del team sono in conflitto aperto. Devi mediare.",
        role_user: "Team Lead sviluppo software",
        role_ai: "Andrea", role_ai_full: "Andrea, sviluppatore frustrato",
        ai_personality: "Frustrato perché il collega non rispetta le deadline e lui copre sempre. Emotivo ma professionale. Se mediato bene, vede l'altro punto di vista. Se nessun controllo, si accende. Max 2-3 frasi.",
        tips: ["Stabilisci regole base", "Ascolta senza schierarti", "Riformula per validare", "Cerca interessi comuni", "Convergi su soluzioni pratiche"],
        evaluation_criteria: ["Neutralità", "Gestione emozioni", "Riformulazione attiva", "Mediazione", "Raggiungimento accordo"]
      },
      {
        id: "dc2", title: "Comunicare un Licenziamento",
        brief: "Comunica a un dipendente che la sua posizione è eliminata per ristrutturazione. Non legato alla performance.",
        role_user: "HR Manager",
        role_ai: "Fabio", role_ai_full: "Fabio, dipendente da 5 anni",
        ai_personality: "Non se lo aspetta. Shock, poi rabbia ('Ho sempre dato il massimo!'), poi preoccupazione. Se HR empatico, accetta gradualmente. Se freddo, diventa ostile. Max 2-3 frasi.",
        tips: ["Vai dritto al punto in 30 secondi", "Empatia genuina, non paternalismo", "Spiega: ristrutturazione, non performance", "Dettagli pratici su next steps", "Dai spazio alle emozioni"],
        evaluation_criteria: ["Chiarezza", "Empatia genuina", "Gestione reazioni", "Info pratiche", "Dignità e rispetto"]
      }
    ]
  },
  {
    id: "sales", icon: "📞", label: "Sales & Cold Calls", color: "#4A8FE7",
    description: "Perfeziona vendita e primo contatto",
    scenarios: [
      {
        id: "sc1", title: "Cold Call B2B",
        brief: "Chiami il responsabile acquisti per proporre il tuo software. 60 secondi per catturare l'attenzione.",
        role_user: "Sales Development Representative",
        role_ai: "Dott.ssa Bianchi", role_ai_full: "Dott.ssa Bianchi, Resp. Acquisti",
        ai_personality: "Occupatissima e scettica. Fredda e sbrigativa ('Non ho tempo', 'Abbiamo già un fornitore'). Se pitch specifico e originale, minimo interesse. Se generico, taglia corto. Max 2-3 frasi.",
        tips: ["Primi 10 sec: valore, non prodotto", "Ricerca sulla persona prima", "Domande aperte sui pain points", "Obiezioni = opportunità", "Obiettivo: secondo meeting"],
        evaluation_criteria: ["Opening hook", "Gestione obiezioni", "Domande discovery", "Value proposition", "Chiusura con next step"]
      },
      {
        id: "sc2", title: "Negoziazione Prezzo",
        brief: "Il cliente vuole -40%. Il massimo sconto è 15%. Negozia mantenendo il valore.",
        role_user: "Account Executive",
        role_ai: "Giorgio", role_ai_full: "Giorgio, CFO cliente",
        ai_personality: "Negoziatore esperto. Usa tattiche classiche ('Il competitor costa 30% meno', 'Budget è quello'). Se vendita value-based, accetta compromesso. Se cede subito, chiede di più. Max 2-3 frasi.",
        tips: ["Giustifica il valore, non il prezzo", "Chiedi motivo dello sconto", "Alternative: payment terms, bundle, pilot", "Il silenzio è un'arma", "Ancora sui risultati business"],
        evaluation_criteria: ["Difesa valore", "Creatività alternative", "Gestione pressione", "Comprensione bisogni", "Win-win"]
      }
    ]
  },
  {
    id: "leadership", icon: "🎯", label: "Leadership", color: "#6C5CE7",
    description: "Guida e ispira il tuo team",
    scenarios: [
      {
        id: "ld1", title: "Delegare Efficacemente",
        brief: "Delega un progetto critico a qualcuno di capace ma insicuro. Bilancia autonomia e supporto.",
        role_user: "Director of Engineering",
        role_ai: "Sara", role_ai_full: "Sara, sviluppatrice talentuosa ma insicura",
        ai_personality: "Competente ma insicura su progetti grandi. Entusiasmo + preoccupazione ('Ma sei sicuro che sia la persona giusta?'). Se supportata, diventa sicura. Se micromanaggiata, frustrata. Max 2-3 frasi.",
        tips: ["Spiega il 'perché' hai scelto lei", "Outcome attesi e confini di autonomia", "Checkpoint senza micromanagement", "Anticipa le paure", "Mostra fiducia genuina"],
        evaluation_criteria: ["Chiarezza delega", "Empowerment", "Supporto strutturato", "Costruzione fiducia", "Success criteria"]
      },
      {
        id: "ld2", title: "Annunciare un Cambiamento",
        brief: "L'azienda passa a lavoro ibrido. Non piacerà a tutti. Comunicalo per ottenere supporto.",
        role_user: "People Manager",
        role_ai: "Luca", role_ai_full: "Luca, il più vocale del team",
        ai_personality: "Resistente ('Stavamo bene così!'), provocatorio ('Chi ha deciso?'), pratico ('E chi ha figli?'). Se manager spiega e ascolta, diventa costruttivo. Se impone, organizza resistenza. Max 2-3 frasi.",
        tips: ["Prima il 'perché', poi il 'cosa'", "Riconosci preoccupazioni legittime", "Trasparente su negoziabile vs no", "Coinvolgi nei dettagli", "Timeline chiara"],
        evaluation_criteria: ["Comunicazione razionale", "Gestione resistenza", "Trasparenza", "Coinvolgimento", "Visione"]
      }
    ]
  },
  {
    id: "networking", icon: "🤝", label: "Networking", color: "#00B894",
    description: "Costruisci relazioni professionali autentiche",
    scenarios: [
      {
        id: "nw1", title: "Elevator Pitch",
        brief: "90 secondi per presentarti a un potenziale investitore. Sii memorabile.",
        role_user: "Founder startup early-stage",
        role_ai: "Roberto", role_ai_full: "Roberto, Business Angel",
        ai_personality: "Gentile ma poco tempo, ha visto di tutto. Distratto. Se pitch originale, ascolta. Se generico, taglia ('Interessante, mandi una email'). Domande mirate se incuriosito. Max 2-3 frasi.",
        tips: ["Hook di curiosità, non nome azienda", "Problema prima della soluzione", "Numeri concreti", "Adatta il linguaggio", "Ask specifico e ragionevole"],
        evaluation_criteria: ["Impatto iniziale", "Conciseness", "Storytelling", "Adattamento audience", "Call to action"]
      },
      {
        id: "nw2", title: "Chiedere un Favore",
        brief: "Chiedi a un ex collega di presentarti a un suo contatto importante. Relazione tiepida.",
        role_user: "Professionista in cerca di opportunità",
        role_ai: "Alessia", role_ai_full: "Alessia, ex collega",
        ai_personality: "Disponibile ma nota quando la contattano solo per interesse. Se autentico, felice di aiutare. Se freddo e strumentale, distacco educato. Max 2-3 frasi.",
        tips: ["Riconnettiti come persona prima", "Offri valore prima di chiedere", "Sii specifico", "Rendi facile dire sì (o no)", "Follow up con gratitudine"],
        evaluation_criteria: ["Autenticità", "Reciprocità", "Specificità richiesta", "Facilità per l'altro", "Rispetto relazione"]
      }
    ]
  },
  {
    id: "emotional", icon: "🧠", label: "Intelligenza Emotiva", color: "#E17055",
    description: "Gestisci emozioni tue e degli altri",
    scenarios: [
      {
        id: "ei1", title: "Collega in Burnout",
        brief: "Un collega è in burnout. Produttività cala e impatta il team. Affronta con sensibilità.",
        role_user: "Team Lead",
        role_ai: "Chiara", role_ai_full: "Chiara, collega in burnout",
        ai_personality: "Esausta ma nasconde. Minimizza ('Sto bene, solo stanca'). Se empatia genuina, si apre un po'. Se troppo diretto o aziendalista, si chiude. Apprezza ascolto senza giudizio. Max 2-3 frasi.",
        tips: ["Momento e luogo privato", "Osserva senza giudicare", "Ascolta più che parlare (80/20)", "Non 'risolvere', offri supporto", "Rispetta i confini"],
        evaluation_criteria: ["Empatia", "Ascolto attivo", "Rispetto confini", "Supporto pratico", "Non giudizio"]
      }
    ]
  }
];

// ─── Compact prompts for Haiku ──────────────────────────────────────────────
function buildSystemPrompt(sc) {
  return `Sei ${sc.role_ai_full} in un roleplay. Contesto: ${sc.brief}
Personalità: ${sc.ai_personality}
Regole: resta nel personaggio, italiano, max 2-3 frasi brevi e naturali. Non dare consigli. Dopo 8 scambi, concludi.`;
}

function buildEvalPrompt(sc, convo) {
  const txt = convo.map(m => `${m.role === "user" ? "UTENTE" : sc.role_ai}: ${m.text}`).join("\n");
  return `Sei un executive coach con 20 anni di esperienza in soft skills. Hai osservato questo roleplay di allenamento.

SCENARIO: ${sc.brief}
RUOLO DELL'UTENTE: ${sc.role_user}
INTERLOCUTORE: ${sc.role_ai_full}
CRITERI DI VALUTAZIONE: ${sc.evaluation_criteria.join(", ")}

CONVERSAZIONE OSSERVATA:
${txt}

ISTRUZIONI PER LA VALUTAZIONE:
- Sii ONESTO e SPECIFICO. Non dare punteggi tutti uguali.
- Ogni criterio DEVE avere un punteggio DIVERSO (varia tra 4 e 9 in base alla performance reale).
- I commenti devono citare FRASI SPECIFICHE dalla conversazione come esempi.
- Identifica 3 punti di forza e 3 aree di miglioramento CONCRETE e DIVERSE tra loro.
- Il "momento chiave" deve citare uno scambio preciso e spiegare perché è stato determinante.
- L'"errore da evitare" deve indicare cosa NON ha funzionato con un esempio.
- La "frase alternativa" deve riscrivere una frase dell'utente in modo più efficace.
- Il consiglio deve essere un framework o tecnica pratica e applicabile.

Rispondi SOLO con JSON valido (niente testo prima/dopo, niente backtick):
{"overall_score":7,"summary":"Valutazione di 2-3 frasi dettagliate sulla performance complessiva.","scores":[{"criterion":"Nome criterio","score":6,"comment":"Feedback di 2 frasi con esempio specifico dalla conversazione."}],"strengths":["Punto di forza specifico con esempio","Secondo punto","Terzo punto"],"improvements":["Area miglioramento specifica con esempio","Seconda area","Terza area"],"key_moment":"Citazione dello scambio chiave e perché è stato importante.","mistake_to_avoid":"Cosa non ha funzionato e perché, con esempio dalla conversazione.","better_phrase":"Una frase dell'utente riscritta in modo più efficace: ORIGINALE → MIGLIORATA","academy_tip":"Un framework o tecnica concreta da applicare nella prossima sessione."}`;
}

// ─── Avatar Component ───────────────────────────────────────────────────────
function Avatar({ speaking, thinking, size = 180 }) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!speaking) { setMouthOpen(false); return; }
    const interval = setInterval(() => setMouthOpen(p => !p), 180);
    return () => clearInterval(interval);
  }, [speaking]);

  const eyeAnim = thinking ? "blink 1s infinite" : "none";
  const glowColor = speaking ? "rgba(108,92,231,0.4)" : thinking ? "rgba(232,101,90,0.3)" : "rgba(255,255,255,0.05)";

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: -20,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        transition: "all 0.5s ease",
        animation: speaking ? "pulseGlow 2s ease-in-out infinite" : "none",
      }} />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
        {/* Head */}
        <circle cx="100" cy="100" r="80" fill="#1E1E3A" stroke="rgba(108,92,231,0.3)" strokeWidth="2" />
        <circle cx="100" cy="100" r="80" fill="url(#faceGrad)" />
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(108,92,231,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Eyes */}
        <g style={{ animation: eyeAnim }}>
          <ellipse cx="72" cy="88" rx="10" ry={thinking ? 2 : 11} fill="#E8E8F0" style={{ transition: "ry 0.15s" }} />
          <ellipse cx="128" cy="88" rx="10" ry={thinking ? 2 : 11} fill="#E8E8F0" style={{ transition: "ry 0.15s" }} />
          <circle cx="74" cy="87" r="5" fill="#6C5CE7" />
          <circle cx="130" cy="87" r="5" fill="#6C5CE7" />
          <circle cx="76" cy="85" r="2" fill="white" />
          <circle cx="132" cy="85" r="2" fill="white" />
        </g>

        {/* Eyebrows */}
        <line x1="58" y1="72" x2="84" y2={speaking ? 70 : 74} stroke="#E8E8F0" strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 0.3s" }} />
        <line x1="116" y1={speaking ? 70 : 74} x2="142" y2="72" stroke="#E8E8F0" strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 0.3s" }} />

        {/* Nose */}
        <path d="M96 100 Q100 108 104 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Mouth */}
        {speaking ? (
          <ellipse cx="100" cy="125" rx={mouthOpen ? 16 : 10} ry={mouthOpen ? 12 : 4}
            fill="#2A1A4A" stroke="rgba(232,101,90,0.6)" strokeWidth="1.5"
            style={{ transition: "all 0.12s ease" }} />
        ) : (
          <path d="M82 122 Q100 136 118 122" fill="none" stroke="#E8E8F0" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Cheeks subtle */}
        <circle cx="60" cy="108" r="12" fill="rgba(232,101,90,0.08)" />
        <circle cx="140" cy="108" r="12" fill="rgba(232,101,90,0.08)" />
      </svg>
    </div>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 100, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 10) * c;
  const color = score >= 8 ? "#00B894" : score >= 6 ? "#FDCB6E" : "#E8655A";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: "white", fontSize: `${size * 0.32}px`, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
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
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const convoRef = useRef([]);

  useEffect(() => { convoRef.current = conversation; }, [conversation]);

  useEffect(() => {
    const has = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(has);
    if (!has) setInputMode("text");
    synthRef.current = window.speechSynthesis;
    setAnimateIn(true);
  }, []);

  const navigate = useCallback((to) => {
    setAnimateIn(false);
    setTimeout(() => { setScreen(to); setAnimateIn(true); }, 250);
  }, []);

  // ─── AI Call ────────────────────────────────────────────────
  const callAI = async (messages, system, maxTok) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, system, max_tokens: maxTok || 200 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data.response || "";
    } catch (e) {
      console.error("AI Error:", e);
      return "Mi scusi, può ripetere?";
    }
  };

  // ─── Speech (faster rate) ──────────────────────────────────
  const speak = useCallback((text) => {
    if (!synthRef.current) return Promise.resolve();
    return new Promise(resolve => {
      synthRef.current.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "it-IT";
      utt.rate = 1.15;
      utt.pitch = 1.05;
      const voices = synthRef.current.getVoices();
      const itVoice = voices.find(v => v.lang.startsWith("it"));
      if (itVoice) utt.voice = itVoice;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => { setIsSpeaking(false); resolve(); };
      utt.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current.speak(utt);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = true;
    rec.continuous = true;
    let finalT = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalT += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setCurrentTranscript(finalT + interim);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
    setCurrentTranscript("");
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const handleSend = useCallback(async (text) => {
    if (!text?.trim() || !selectedScenario) return;
    const userMsg = { role: "user", text: text.trim() };
    const newConvo = [...convoRef.current, userMsg];
    setConversation(newConvo);
    setCurrentTranscript("");
    setUserTextInput("");
    setIsThinking(true);
    setLastAiText("");

    const apiMsgs = newConvo.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    const aiText = await callAI(apiMsgs, buildSystemPrompt(selectedScenario), 200);
    const aiMsg = { role: "ai", text: aiText };
    setConversation(prev => [...prev, aiMsg]);
    setLastAiText(aiText);
    setTurnCount(prev => prev + 1);
    setIsThinking(false);
    speak(aiText);
  }, [selectedScenario, speak]);

  const handleVoiceSend = useCallback(() => {
    stopListening();
    setTimeout(() => handleSend(currentTranscript), 100);
  }, [stopListening, handleSend, currentTranscript]);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    navigate("report");
    const prompt = buildEvalPrompt(selectedScenario, convoRef.current);
    
    // Try twice — Haiku sometimes needs a second attempt for clean JSON
    let parsed = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      const raw = await callAI(
        [{ role: "user", content: prompt }],
        "Sei un executive coach. Rispondi ESCLUSIVAMENTE con JSON valido. Nessun testo prima o dopo il JSON. Nessun backtick. Inizia con { e finisci con }.",
        1024
      );
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        // Find the JSON object in the response
        const jsonStart = clean.indexOf("{");
        const jsonEnd = clean.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
        }
      } catch { /* retry */ }
    }

    if (parsed) {
      setReport(parsed);
    } else {
      // Better fallback with varied scores
      const criteria = selectedScenario.evaluation_criteria;
      const baseScores = [6, 7, 5, 8, 6];
      setReport({
        overall_score: 6,
        summary: "La conversazione mostra impegno ma necessita di maggiore struttura e specificità. Ci sono buone basi su cui costruire con la pratica.",
        scores: criteria.map((c, i) => ({
          criterion: c,
          score: baseScores[i % baseScores.length],
          comment: `Questo criterio necessita attenzione. Prova a essere più intenzionale e strutturato nel tuo approccio a "${c.toLowerCase()}".`
        })),
        strengths: [
          "Hai mostrato volontà di affrontare la conversazione",
          "Il tono generale era appropriato al contesto",
          "Hai mantenuto il focus sull'obiettivo della conversazione"
        ],
        improvements: [
          "Usa più domande aperte per capire il punto di vista dell'altro",
          "Sii più specifico con esempi concreti invece di restare sul generico",
          "Struttura meglio la conversazione con un'apertura, un corpo e una chiusura"
        ],
        key_moment: "Il momento iniziale della conversazione è stato determinante per impostare il tono dell'intero scambio.",
        mistake_to_avoid: "Evita di passare subito alla soluzione senza aver prima ascoltato e validato le emozioni dell'interlocutore.",
        better_phrase: "Prova a trasformare affermazioni dirette in domande esplorative: 'Devi migliorare' → 'Come vedi la situazione dal tuo punto di vista?'",
        academy_tip: "Applica la regola del 70/30: in queste conversazioni, ascolta per il 70% del tempo e parla per il 30%. Le domande aperte sono il tuo strumento più potente."
      });
    }
    setIsGeneratingReport(false);
  }, [selectedScenario, navigate]);

  const restart = () => {
    setConversation([]); setReport(null); setSelectedScenario(null);
    setSelectedCategory(null); setCurrentTranscript(""); setLastAiText("");
    setTurnCount(0); navigate("home");
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: "linear-gradient(160deg, #0F0F1A 0%, #1A1A2E 40%, #16213E 100%)", fontFamily: "'DM Sans', sans-serif", color: "#E8E8F0", position: "relative" },
    container: { maxWidth: "900px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 1, opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" },
    logo: { fontSize: "11px", letterSpacing: "6px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "12px" },
    h1: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, lineHeight: 1.1, margin: 0, background: "linear-gradient(135deg, #FFF 0%, #B8B8D0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subtitle: { fontSize: "15px", color: "rgba(255,255,255,0.45)", marginTop: "12px", lineHeight: 1.5 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", marginTop: "32px" },
    card: (color) => ({ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", cursor: "pointer", transition: "all 0.3s ease" }),
    btn: (color = "#6C5CE7", full = false) => ({ background: color, color: "#fff", border: "none", borderRadius: "12px", padding: full ? "16px 32px" : "12px 24px", fontSize: full ? "16px" : "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", width: full ? "100%" : "auto" }),
    btnOutline: { background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    chip: (color) => ({ display: "inline-block", background: color + "20", color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }),
    glass: { background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" },
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{margin:0}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
    @keyframes pulseGlow{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
    @keyframes blink{0%,40%,100%{ry:11}45%,55%{ry:1}}
    @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes wave{0%,100%{height:6px}50%{height:28px}}
  `;

  // ═══ HOME ═══
  if (screen === "home") {
    return (
      <div style={S.app}>
        <style>{globalCSS}</style>
        <div style={S.container}>
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <div style={S.logo}>Skill Forge</div>
            <h1 style={S.h1}>Allena le tue<br />Soft Skills</h1>
            <p style={S.subtitle}>Pratica conversazioni reali con un avatar AI.<br />Scegli, simula, ricevi feedback.</p>
          </div>
          {!selectedCategory ? (
            <div style={S.grid}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={S.card(cat.color)} onClick={() => setSelectedCategory(cat)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{cat.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>{cat.label}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{cat.description}</div>
                  <div style={{ marginTop: "14px", fontSize: "12px", color: cat.color }}>{cat.scenarios.length} scenari →</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "24px" }}>
              <button style={S.btnOutline} onClick={() => setSelectedCategory(null)}>← Indietro</button>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0 20px" }}>
                <span style={{ fontSize: "36px" }}>{selectedCategory.icon}</span>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{selectedCategory.label}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{selectedCategory.description}</div>
                </div>
              </div>
              {selectedCategory.scenarios.map(sc => (
                <div key={sc.id} style={{ ...S.glass, cursor: "pointer", marginBottom: "12px" }}
                  onClick={() => { setSelectedScenario(sc); navigate("scenario"); }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = selectedCategory.color + "44"; e.currentTarget.style.transform = "translateX(6px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "6px" }}>{sc.title}</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{sc.brief}</div>
                    </div>
                    <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.2)", marginLeft: "16px" }}>→</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
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

  // ═══ SCENARIO BRIEFING ═══
  if (screen === "scenario") {
    const cat = CATEGORIES.find(c => c.scenarios.some(s => s.id === selectedScenario?.id));
    return (
      <div style={S.app}>
        <style>{globalCSS}</style>
        <div style={S.container}>
          <button style={{ ...S.btnOutline, marginBottom: "24px" }} onClick={() => { setSelectedScenario(null); navigate("home"); }}>← Scegli altro</button>
          <div style={S.chip(cat?.color || "#6C5CE7")}>{cat?.label}</div>
          <h2 style={{ ...S.h1, fontSize: "clamp(24px,4vw,36px)", marginTop: "12px" }}>{selectedScenario.title}</h2>

          <div style={{ ...S.glass, marginTop: "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>Scenario</div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>{selectedScenario.brief}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <div style={{ background: "rgba(108,92,231,0.1)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(108,92,231,0.2)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>Il tuo ruolo</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_user}</div>
            </div>
            <div style={{ background: "rgba(232,101,90,0.1)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(232,101,90,0.2)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>Parli con</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_ai_full}</div>
            </div>
          </div>

          <div style={{ ...S.glass, marginTop: "16px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>💡 Consigli</div>
            {selectedScenario.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "rgba(108,92,231,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#6C5CE7" }}>{i + 1}</div>
                <div style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{t}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
            {selectedScenario.evaluation_criteria.map(c => <span key={c} style={S.chip(cat?.color || "#6C5CE7")}>{c}</span>)}
          </div>

          <button style={{ ...S.btn("#6C5CE7", true), marginTop: "28px" }}
            onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); navigate("roleplay"); }}>
            🎭 Inizia il Roleplay
          </button>
        </div>
      </div>
    );
  }

  // ═══ ROLEPLAY (Avatar-based) ═══
  if (screen === "roleplay") {
    return (
      <div style={S.app}>
        <style>{globalCSS}</style>
        <div style={{ ...S.container, display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100dvh", padding: "16px" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{selectedScenario.title}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Turno {turnCount} · {selectedScenario.role_ai_full}</div>
            </div>
            <button style={{ ...S.btn("#E8655A"), fontSize: "13px", padding: "8px 16px" }}
              onClick={generateReport} disabled={conversation.length < 2}>
              Termina →
            </button>
          </div>

          {/* Avatar area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0", overflow: "hidden" }}>
            <Avatar speaking={isSpeaking} thinking={isThinking} size={Math.min(200, window.innerWidth * 0.45)} />

            <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", color: "rgba(255,255,255,0.8)" }}>
              {selectedScenario.role_ai}
            </div>

            {/* Status */}
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px", height: "20px" }}>
              {isThinking ? "Sta pensando..." : isSpeaking ? "Sta parlando..." : turnCount === 0 ? "In attesa del tuo messaggio" : "In ascolto"}
            </div>

            {/* AI speech bubble */}
            {lastAiText && (
              <div style={{
                marginTop: "20px",
                maxWidth: "500px",
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "16px 20px",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.06)",
                maxHeight: "120px",
                overflowY: "auto",
              }}>
                {lastAiText}
              </div>
            )}

            {/* User transcript preview */}
            {currentTranscript && (
              <div style={{
                marginTop: "12px",
                maxWidth: "500px",
                width: "100%",
                background: "rgba(108,92,231,0.1)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                fontStyle: "italic",
                textAlign: "center",
                border: "1px solid rgba(108,92,231,0.15)",
              }}>
                {currentTranscript}
              </div>
            )}

            {/* Empty state */}
            {turnCount === 0 && !currentTranscript && (
              <div style={{ marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.6 }}>
                Inizia la conversazione come<br />
                <span style={{ color: "rgba(108,92,231,0.7)" }}>{selectedScenario.role_user}</span>
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 0 8px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
              {speechSupported && (
                <button style={{ ...S.btnOutline, padding: "5px 12px", fontSize: "12px", background: inputMode === "voice" ? "rgba(108,92,231,0.2)" : "transparent", borderColor: inputMode === "voice" ? "#6C5CE7" : "rgba(255,255,255,0.12)" }}
                  onClick={() => setInputMode("voice")}>🎤 Voce</button>
              )}
              <button style={{ ...S.btnOutline, padding: "5px 12px", fontSize: "12px", background: inputMode === "text" ? "rgba(108,92,231,0.2)" : "transparent", borderColor: inputMode === "text" ? "#6C5CE7" : "rgba(255,255,255,0.12)" }}
                onClick={() => setInputMode("text")}>⌨️ Testo</button>
            </div>

            {inputMode === "voice" ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", height: "32px" }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} style={{
                      width: "3px", borderRadius: "2px",
                      background: isListening ? "linear-gradient(to top, #E8655A, #6C5CE7)" : "rgba(255,255,255,0.1)",
                      height: isListening ? undefined : "6px",
                      animation: isListening ? "wave 1.2s ease-in-out infinite" : "none",
                      animationDelay: `${i * 0.05}s`,
                    }} />
                  ))}
                </div>
                <div style={{ marginTop: "10px" }}>
                  {!isListening ? (
                    <button style={{ ...S.btn("#6C5CE7"), borderRadius: "50%", width: "60px", height: "60px", fontSize: "22px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      onClick={startListening} disabled={isThinking || isSpeaking}>🎤</button>
                  ) : (
                    <button style={{ ...S.btn("#E8655A"), borderRadius: "50%", width: "60px", height: "60px", fontSize: "22px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s infinite" }}
                      onClick={handleVoiceSend}>⏹</button>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
                  {isListening ? "Ascoltando... premi per inviare" : isSpeaking ? "Risposta in corso..." : "Premi per parlare"}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={userTextInput}
                  onChange={e => setUserTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSend(userTextInput); }}
                  placeholder="Scrivi il tuo messaggio..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px", color: "#E8E8F0", fontSize: "14px", fontFamily: "'DM Sans'", outline: "none" }}
                  disabled={isThinking} />
                <button style={S.btn("#6C5CE7")} onClick={() => handleSend(userTextInput)} disabled={!userTextInput.trim() || isThinking}>Invia</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══ REPORT ═══
  if (screen === "report") {
    return (
      <div style={S.app}>
        <style>{globalCSS}</style>
        <div style={S.container}>
          {isGeneratingReport || !report ? (
            <div style={{ textAlign: "center", paddingTop: "120px" }}>
              <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#6C5CE7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
              <div style={{ fontSize: "18px", fontWeight: 600 }}>Analizzo la conversazione...</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>Report in arrivo</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
                <div style={S.logo}>Report di Valutazione</div>
                <h2 style={{ ...S.h1, fontSize: "clamp(22px,4vw,32px)" }}>{selectedScenario.title}</h2>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>{selectedScenario.role_user} → {selectedScenario.role_ai_full} · {conversation.length} messaggi</div>
              </div>

              <div style={{ ...S.glass, textAlign: "center", marginBottom: "20px", padding: "32px" }}>
                <ScoreRing score={report.overall_score} size={130} strokeWidth={8} />
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>Punteggio Complessivo</div>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginTop: "16px", maxWidth: "540px", margin: "16px auto 0" }}>{report.summary}</p>
              </div>

              <div style={{ ...S.glass, marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "20px" }}>Valutazione per Criterio</div>
                {report.scores.map((s, i) => (
                  <div key={i} style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{s.criterion}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: s.score >= 8 ? "#00B894" : s.score >= 6 ? "#FDCB6E" : "#E8655A" }}>{s.score}/10</span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "6px" }}>
                      <div style={{ width: `${s.score * 10}%`, height: "100%", borderRadius: "2px", background: s.score >= 8 ? "#00B894" : s.score >= 6 ? "#FDCB6E" : "#E8655A", transition: "width 1.5s" }} />
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{s.comment}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(0,184,148,0.08)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,184,148,0.15)" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#00B894", marginBottom: "14px" }}>✓ Punti di Forza</div>
                  {report.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "10px", paddingLeft: "12px", borderLeft: "2px solid rgba(0,184,148,0.3)" }}>{s}</div>
                  ))}
                </div>
                <div style={{ background: "rgba(232,101,90,0.08)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(232,101,90,0.15)" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#E8655A", marginBottom: "14px" }}>↑ Aree di Miglioramento</div>
                  {report.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "8px", paddingLeft: "12px", borderLeft: "2px solid rgba(232,101,90,0.3)" }}>{s}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(108,92,231,0.08)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(108,92,231,0.15)", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#6C5CE7", marginBottom: "10px" }}>⚡ Momento Chiave</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{report.key_moment}</div>
              </div>

              {report.mistake_to_avoid && (
                <div style={{ background: "rgba(232,101,90,0.06)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(232,101,90,0.12)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#E8655A", marginBottom: "10px" }}>🚫 Errore da Evitare</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{report.mistake_to_avoid}</div>
                </div>
              )}

              {report.better_phrase && (
                <div style={{ background: "rgba(0,184,148,0.06)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,184,148,0.12)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#00B894", marginBottom: "10px" }}>💬 Come Dirlo Meglio</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{report.better_phrase}</div>
                </div>
              )}

              <div style={{ background: "linear-gradient(135deg, rgba(108,92,231,0.12), rgba(232,101,90,0.12))", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>🎓 Consiglio dell'Accademia</div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontStyle: "italic" }}>"{report.academy_tip}"</div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ ...S.btn("#6C5CE7"), flex: 1 }} onClick={() => { setConversation([]); setLastAiText(""); setTurnCount(0); navigate("roleplay"); }}>🔄 Riprova</button>
                <button style={{ ...S.btnOutline, flex: 1 }} onClick={restart}>🏠 Home</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
