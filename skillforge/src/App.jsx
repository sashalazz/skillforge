import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA: Soft Skill Categories & Scenarios ────────────────────────────────
const CATEGORIES = [
  {
    id: "feedback",
    icon: "💬",
    label: "Dare Feedback",
    color: "#E8655A",
    description: "Impara a comunicare feedback costruttivo ed efficace",
    scenarios: [
      {
        id: "fb1",
        title: "Performance Insufficiente",
        brief: "Un membro del tuo team non sta raggiungendo gli obiettivi da 2 mesi. Devi comunicare il problema in modo chiaro ma empatico, mantenendo la motivazione.",
        role_user: "Manager del team marketing",
        role_ai: "Marco, il tuo diretto report che sottoperforma",
        ai_personality: "Marco è un dipendente che era performante ma da 2 mesi ha un calo. È un po' difensivo ma ragionevole. Rispondi come Marco: inizialmente un po' sorpreso e sulla difensiva, poi gradualmente più aperto se il manager comunica bene. Usa frasi come 'Ma io sto facendo del mio meglio...' o 'Non sapevo che fosse così grave'. Se il manager è troppo aggressivo, chiuditi. Se è troppo vago, chiedi chiarimenti.",
        tips: [
          "Usa il modello SBI: Situazione, Comportamento, Impatto",
          "Inizia riconoscendo i punti di forza prima delle aree di miglioramento",
          "Sii specifico con esempi concreti, evita generalizzazioni",
          "Chiedi il punto di vista dell'altra persona",
          "Concludi con un piano d'azione concordato insieme"
        ],
        evaluation_criteria: ["Empatia e tono", "Specificità del feedback", "Struttura della conversazione", "Orientamento alla soluzione", "Ascolto attivo"]
      },
      {
        id: "fb2",
        title: "Feedback a un Senior",
        brief: "Devi dare feedback costruttivo a un collega con più esperienza di te che ha gestito male una presentazione al cliente. Il collega tende ad essere orgoglioso del proprio lavoro.",
        role_user: "Project Manager junior",
        role_ai: "Laura, Senior Consultant con 15 anni di esperienza",
        ai_personality: "Laura è una professionista esperta e un po' orgogliosa. Rispondi come Laura: inizialmente un po' scettica che qualcuno più junior le dia feedback. Se il feedback è dato con rispetto e dati concreti, diventa più ricettiva. Se è dato in modo presuntuoso, reagisci con irritazione sottile. Usa frasi come 'Apprezzo il tuo punto di vista, ma...' o 'Ho gestito presentazioni del genere per anni'.",
        tips: [
          "Chiedi il permesso prima di dare feedback",
          "Usa 'io ho notato' invece di 'tu hai fatto'",
          "Riconosci la loro esperienza e competenza",
          "Focalizzati sull'impatto sul progetto, non sulla persona",
          "Proponi come supporto, non come critica"
        ],
        evaluation_criteria: ["Rispetto della seniority", "Diplomazia", "Uso di dati oggettivi", "Posizionamento del feedback", "Gestione della resistenza"]
      }
    ]
  },
  {
    id: "difficult",
    icon: "🔥",
    label: "Conversazioni Difficili",
    color: "#D4812F",
    description: "Gestisci conflitti, malumori e situazioni delicate",
    scenarios: [
      {
        id: "dc1",
        title: "Conflitto nel Team",
        brief: "Due membri del tuo team sono in conflitto aperto e questo sta impattando la produttività. Devi mediare tra loro durante una riunione congiunta.",
        role_user: "Team Lead di un team di sviluppo software",
        role_ai: "Andrea, uno dei due sviluppatori in conflitto",
        ai_personality: "Andrea è frustrato perché sente che il collega (Giulia) non rispetta le deadline e lui deve sempre coprire. È emotivo ma professionale. Rispondi come Andrea: esponi le tue frustrazioni, a volte interrompi, ma se il Team Lead gestisce bene la mediazione, inizia a vedere il punto di vista dell'altro. Se il Team Lead non prende controllo della situazione, diventa più acceso.",
        tips: [
          "Stabilisci regole base all'inizio della conversazione",
          "Ascolta entrambe le parti senza schierarti",
          "Riformula quello che senti per validare le emozioni",
          "Cerca gli interessi comuni sotto le posizioni opposte",
          "Fai convergere verso soluzioni pratiche e misurabili"
        ],
        evaluation_criteria: ["Neutralità e imparzialità", "Gestione delle emozioni", "Riformulazione attiva", "Capacità di mediazione", "Raggiungimento di un accordo"]
      },
      {
        id: "dc2",
        title: "Comunicare un Licenziamento",
        brief: "Devi comunicare a un dipendente che la sua posizione è stata eliminata a causa di una ristrutturazione aziendale. Non è legato alla sua performance.",
        role_user: "HR Manager",
        role_ai: "Fabio, dipendente da 5 anni con buone performance",
        ai_personality: "Fabio non si aspetta questa notizia. Rispondi come Fabio: inizialmente sotto shock, poi arrabbiato ('Ma io ho sempre dato il massimo!'), poi preoccupato per il futuro. Se l'HR Manager è empatico e chiaro, gradualmente accetta e chiede informazioni pratiche. Se è freddo o vago, diventa molto più emotivo e ostile.",
        tips: [
          "Vai dritto al punto nei primi 30 secondi",
          "Esprimi empatia genuina senza essere paternalistico",
          "Spiega chiaramente le ragioni (ristrutturazione, non performance)",
          "Fornisci dettagli pratici su next steps e supporto",
          "Dai spazio alle emozioni senza cercare di 'aggiustare' tutto"
        ],
        evaluation_criteria: ["Chiarezza del messaggio", "Empatia genuina", "Gestione delle reazioni emotive", "Informazioni pratiche fornite", "Dignità e rispetto"]
      }
    ]
  },
  {
    id: "sales",
    icon: "📞",
    label: "Sales & Cold Calls",
    color: "#4A8FE7",
    description: "Perfeziona le tue tecniche di vendita e primo contatto",
    scenarios: [
      {
        id: "sc1",
        title: "Cold Call B2B",
        brief: "Stai chiamando il responsabile acquisti di un'azienda media per proporre il tuo software di project management. Hai 60 secondi per catturare l'attenzione prima che riattacchi.",
        role_user: "Sales Development Representative",
        role_ai: "Dott.ssa Bianchi, Responsabile Acquisti occupatissima",
        ai_personality: "La Dott.ssa Bianchi è molto impegnata e scettica verso le cold call. Rispondi come lei: inizialmente fredda e sbrigativa ('Non ho tempo', 'Abbiamo già un fornitore'). Se il venditore è davvero bravo a catturare attenzione con una value proposition specifica, mostra un minimo di interesse. Se fa un pitch generico, taglia corto. Usa obiezioni classiche: 'Quanto costa?', 'Mandi una email', 'Non è il momento giusto'.",
        tips: [
          "I primi 10 secondi sono critici: presenta il valore, non il prodotto",
          "Fai una ricerca sulla persona prima di chiamare",
          "Usa domande aperte per capire i pain points",
          "Gestisci le obiezioni come opportunità di dialogo",
          "L'obiettivo non è vendere, è ottenere un secondo meeting"
        ],
        evaluation_criteria: ["Opening hook efficace", "Gestione delle obiezioni", "Domande di discovery", "Value proposition chiara", "Chiusura con next step"]
      },
      {
        id: "sc2",
        title: "Negoziazione Prezzo",
        brief: "Il cliente è interessato al tuo servizio ma vuole uno sconto del 40%. Il massimo che puoi offrire è il 15%. Devi negoziare mantenendo il valore percepito.",
        role_user: "Account Executive",
        role_ai: "Giorgio, CFO di un'azienda cliente",
        ai_personality: "Giorgio è un negoziatore esperto. Rispondi come Giorgio: usa tattiche classiche di negoziazione ('Il vostro competitor offre il 30% in meno', 'Il budget è quello, prendere o lasciare', 'Devo parlarne con il board'). Se il venditore negozia bene con value-based selling, accetta gradualmente un compromesso. Se cede subito, chiedi ancora di più.",
        tips: [
          "Mai giustificare il prezzo, giustifica il valore",
          "Chiedi cosa motiva la richiesta di sconto",
          "Offri alternative creative (payment terms, bundle, pilot)",
          "Usa il silenzio come strumento di negoziazione",
          "Ancora sempre la conversazione ai risultati business"
        ],
        evaluation_criteria: ["Difesa del valore", "Creatività nelle alternative", "Gestione della pressione", "Comprensione dei bisogni reali", "Raggiungimento di un win-win"]
      }
    ]
  },
  {
    id: "leadership",
    icon: "🎯",
    label: "Leadership",
    color: "#6C5CE7",
    description: "Sviluppa la tua capacità di guidare e ispirare il team",
    scenarios: [
      {
        id: "ld1",
        title: "Delegare Efficacemente",
        brief: "Devi delegare un progetto critico a un membro del team che è capace ma insicuro. Devi bilanciare autonomia e supporto.",
        role_user: "Director of Engineering",
        role_ai: "Sara, sviluppatrice talentuosa ma con poca fiducia in sé stessa",
        ai_personality: "Sara è molto competente tecnicamente ma ha poca fiducia quando si tratta di gestire progetti interi. Rispondi come Sara: mostra entusiasmo misto a preoccupazione ('Wow, è un grande progetto... ma sei sicuro che sia la persona giusta?'). Se il leader la supporta bene con struttura e fiducia, diventa più sicura. Se la micromanaggia, si frustra.",
        tips: [
          "Spiega il 'perché' hai scelto proprio lei/lui",
          "Definisci chiaramente outcome attesi e confini di autonomia",
          "Stabilisci checkpoint regolari senza micromanagement",
          "Anticipa le paure e fornisci risorse/supporto",
          "Mostra fiducia genuina nelle capacità della persona"
        ],
        evaluation_criteria: ["Chiarezza nella delega", "Empowerment vs micromanagement", "Supporto strutturato", "Costruzione della fiducia", "Definizione di success criteria"]
      },
      {
        id: "ld2",
        title: "Annunciare un Cambiamento",
        brief: "L'azienda sta passando a un nuovo modello di lavoro ibrido che non piacerà a tutti. Devi comunicarlo al team in modo che lo accettino e lo supportino.",
        role_user: "People Manager",
        role_ai: "Il team (rappresentato da Luca, il più vocale del gruppo)",
        ai_personality: "Luca rappresenta il sentiment del team. Rispondi come Luca: inizialmente resistente al cambiamento ('Ma perché? Stavamo bene così!'), con domande provocatorie ('Chi ha deciso questo?'), preoccupazioni pratiche ('E chi ha figli piccoli?'). Se il manager comunica bene il razionale e ascolta le preoccupazioni, diventa più costruttivo. Se impone senza spiegare, organizza la resistenza.",
        tips: [
          "Comunica prima il 'perché' e poi il 'cosa'",
          "Riconosci le emozioni e le preoccupazioni legittime",
          "Sii trasparente su cosa è negoziabile e cosa no",
          "Coinvolgi il team nella definizione dei dettagli implementativi",
          "Condividi una timeline chiara e i prossimi passi"
        ],
        evaluation_criteria: ["Comunicazione del razionale", "Gestione della resistenza", "Trasparenza", "Coinvolgimento del team", "Visione e motivazione"]
      }
    ]
  },
  {
    id: "networking",
    icon: "🤝",
    label: "Networking & Relazioni",
    color: "#00B894",
    description: "Costruisci relazioni professionali autentiche e durature",
    scenarios: [
      {
        id: "nw1",
        title: "Elevator Pitch",
        brief: "Sei a un evento di settore e hai 90 secondi per presentarti a un potenziale investitore/partner. Devi essere memorabile senza essere invadente.",
        role_user: "Founder di una startup early-stage",
        role_ai: "Roberto, Business Angel che riceve 50 pitch a settimana",
        ai_personality: "Roberto è gentile ma ha poco tempo e ha visto di tutto. Rispondi come Roberto: educato ma distratto, controlla il telefono. Se il pitch è davvero originale e conciso, si ferma ad ascoltare. Se è generico o troppo lungo, taglia con gentilezza ('Interessante, mandi una email'). Fa domande mirate se incuriosito: 'Qual è la traction?', 'Chi è nel team?'.",
        tips: [
          "Inizia con un hook che crei curiosità, non con il nome dell'azienda",
          "Descrivi il problema prima della soluzione",
          "Usa numeri e risultati concreti quando possibile",
          "Adatta il linguaggio all'interlocutore",
          "Chiudi chiedendo qualcosa di specifico e ragionevole"
        ],
        evaluation_criteria: ["Impatto nei primi secondi", "Conciseness", "Storytelling", "Adattamento all'audience", "Call to action chiara"]
      },
      {
        id: "nw2",
        title: "Chiedere un Favore Professionale",
        brief: "Devi chiedere a un ex collega che non senti da mesi di presentarti a un suo contatto importante. La relazione è tiepida.",
        role_user: "Professionista in cerca di nuove opportunità",
        role_ai: "Alessia, ex collega con cui hai un rapporto cordiale ma non stretto",
        ai_personality: "Alessia è disponibile ma nota quando qualcuno la contatta solo per interesse. Rispondi come Alessia: se il messaggio è autentico e mostra interesse genuino per lei come persona, è felice di aiutare. Se è un messaggio freddo tipo 'Ciao, come stai? Mi serve un favore...', rispondi con educato distacco. Apprezza quando qualcuno offre valore in cambio.",
        tips: [
          "Riconnettiti prima come persona, non come chi ha bisogno",
          "Offri valore prima di chiederne",
          "Sii specifico su cosa ti serve e perché",
          "Rendi facile per l'altro dire sì (o no)",
          "Follow up con gratitudine e aggiornamenti"
        ],
        evaluation_criteria: ["Autenticità del contatto", "Reciprocità", "Specificità della richiesta", "Facilità di azione per l'altro", "Rispetto della relazione"]
      }
    ]
  },
  {
    id: "emotional",
    icon: "🧠",
    label: "Intelligenza Emotiva",
    color: "#E17055",
    description: "Gestisci le emozioni tue e degli altri in modo efficace",
    scenarios: [
      {
        id: "ei1",
        title: "Collega in Difficoltà",
        brief: "Un tuo collega è visibilmente stressato e in burnout. La produttività sta calando e l'umore impatta il team. Devi affrontare la situazione con sensibilità.",
        role_user: "Team Lead",
        role_ai: "Chiara, collega in evidente stato di burnout",
        ai_personality: "Chiara è esausta ma cerca di nasconderlo. Rispondi come Chiara: inizialmente minimizza ('Sto bene, solo un po' stanca'), poi se il leader mostra empatia genuina, si apre un po' ('In realtà è un periodo molto difficile...'). Se il leader è troppo diretto o aziendalista, si chiude completamente. Apprezza chi ascolta senza giudicare o dare soluzioni immediate.",
        tips: [
          "Scegli un momento e un luogo privato e informale",
          "Osserva senza giudicare: 'Ho notato che...'",
          "Ascolta più di quanto parli (regola 80/20)",
          "Non cercare di 'risolvere' — offri supporto",
          "Rispetta i confini ma fai sapere che sei disponibile"
        ],
        evaluation_criteria: ["Empatia e sensibilità", "Ascolto attivo", "Rispetto dei confini", "Supporto pratico offerto", "Evitare giudizio"]
      }
    ]
  }
];

// ─── Utility: build system prompt for roleplay ──────────────────────────────
function buildSystemPrompt(scenario) {
  return `Sei un simulatore di roleplay per l'allenamento di soft skills professionali. 
  
RUOLO CHE INTERPRETI: ${scenario.role_ai}

CONTESTO: ${scenario.brief}

PERSONALITÀ E COMPORTAMENTO: ${scenario.ai_personality}

REGOLE IMPORTANTI:
- Resta SEMPRE nel personaggio. Non uscire mai dal ruolo.
- Rispondi in italiano, con un linguaggio naturale e colloquiale professionale.
- Le tue risposte devono essere brevi e realistiche (2-4 frasi max), come in una vera conversazione.
- Reagisci emotivamente in modo coerente al personaggio.
- NON dare consigli o suggerimenti all'utente. Tu sei il personaggio, non il coach.
- Se l'utente fa qualcosa di efficace, rispondi positivamente (nel personaggio).
- Se l'utente fa qualcosa di inefficace, reagisci negativamente (nel personaggio).
- Dopo circa 8-10 scambi, inizia a portare la conversazione verso una conclusione naturale.

Inizia rispondendo al primo messaggio dell'utente come farebbe il tuo personaggio in questa situazione.`;
}

function buildEvaluationPrompt(scenario, conversation) {
  const convoText = conversation.map(m => `${m.role === "user" ? "UTENTE" : "PERSONAGGIO"}: ${m.text}`).join("\n");
  return `Sei un executive coach esperto di soft skills. Hai appena osservato un roleplay di allenamento.

SCENARIO: ${scenario.brief}
RUOLO DELL'UTENTE: ${scenario.role_user}
CRITERI DI VALUTAZIONE: ${scenario.evaluation_criteria.join(", ")}

CONVERSAZIONE:
${convoText}

Genera un report di feedback dettagliato in formato JSON con questa struttura ESATTA (rispondi SOLO con il JSON, nessun testo prima o dopo, nessun backtick):
{
  "overall_score": <numero da 1 a 10>,
  "summary": "<2-3 frasi di valutazione complessiva>",
  "scores": [
    {"criterion": "<nome criterio>", "score": <1-10>, "comment": "<feedback specifico per questo criterio con esempi dalla conversazione>"}
  ],
  "strengths": ["<punto di forza 1>", "<punto di forza 2>", "<punto di forza 3>"],
  "improvements": ["<area di miglioramento 1>", "<area di miglioramento 2>", "<area di miglioramento 3>"],
  "key_moment": "<il momento più significativo della conversazione e perché>",
  "academy_tip": "<un consiglio pratico da 'accademia' per migliorare>"
}`;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          borderRadius: "50%",
          background: `rgba(255,255,255,${Math.random() * 0.08 + 0.02})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${Math.random() * 20 + 15}s ease-in-out infinite`,
          animationDelay: `${Math.random() * -20}s`,
        }} />
      ))}
    </div>
  );
}

function VoiceWave({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", height: "40px" }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{
          width: "3px",
          borderRadius: "2px",
          background: active ? "linear-gradient(to top, #E8655A, #6C5CE7)" : "rgba(255,255,255,0.15)",
          height: active ? undefined : "8px",
          animation: active ? `wave 1.2s ease-in-out infinite` : "none",
          animationDelay: `${i * 0.05}s`,
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function ScoreRing({ score, size = 100, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? "#00B894" : score >= 6 ? "#FDCB6E" : "#E8655A";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s ease" }} />
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
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userTextInput, setUserTextInput] = useState("");
  const [inputMode, setInputMode] = useState("voice");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const chatEndRef = useRef(null);
  const convoRef = useRef([]);

  useEffect(() => { convoRef.current = conversation; }, [conversation]);

  useEffect(() => {
    const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(hasSpeech);
    if (!hasSpeech) setInputMode("text");
    synthRef.current = window.speechSynthesis;
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [conversation, currentTranscript]);

  const navigate = useCallback((to) => {
    setAnimateIn(false);
    setTimeout(() => { setScreen(to); setAnimateIn(true); }, 300);
  }, []);

  // ─── AI Call (via serverless function) ──────────────────────
  const callAI = async (messages, system) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, system }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
  
      return data.response || "";
    } catch (e) {
      console.error("AI Error:", e);
      return "Mi scusi, ho perso il filo del discorso. Può ripetere?";
    }
  };

  // ─── Speech ─────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!synthRef.current) return Promise.resolve();
    return new Promise(resolve => {
      synthRef.current.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "it-IT";
      utt.rate = 0.95;
      utt.pitch = 1;
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
    const recognition = new SR();
    recognition.lang = "it-IT";
    recognition.interimResults = true;
    recognition.continuous = true;
    let finalT = "";

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalT += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setCurrentTranscript(finalT + interim);
    };

    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
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

    const apiMessages = newConvo.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const aiText = await callAI(apiMessages, buildSystemPrompt(selectedScenario));
    const aiMsg = { role: "ai", text: aiText };
    setConversation(prev => [...prev, aiMsg]);
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
    const prompt = buildEvaluationPrompt(selectedScenario, convoRef.current);
    const raw = await callAI([{ role: "user", content: prompt }], "Sei un coach esperto. Rispondi SOLO con JSON valido, senza testo aggiuntivo, senza backtick.");
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      setReport(JSON.parse(clean));
    } catch {
      setReport({
        overall_score: 7, summary: "Buona performance complessiva con margini di miglioramento.",
        scores: selectedScenario.evaluation_criteria.map(c => ({ criterion: c, score: 7, comment: "Valutazione generata." })),
        strengths: ["Buona comunicazione"], improvements: ["Più specificità"],
        key_moment: "La conversazione ha mostrato impegno.", academy_tip: "Pratica regolarmente."
      });
    }
    setIsGeneratingReport(false);
  }, [selectedScenario, navigate]);

  const restart = () => {
    setConversation([]);
    setReport(null);
    setSelectedScenario(null);
    setSelectedCategory(null);
    setCurrentTranscript("");
    navigate("home");
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    app: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0F0F1A 0%, #1A1A2E 40%, #16213E 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#E8E8F0",
      position: "relative",
      overflow: "hidden",
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "20px",
      position: "relative",
      zIndex: 1,
      opacity: animateIn ? 1 : 0,
      transform: animateIn ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    header: {
      textAlign: "center",
      padding: "40px 0 20px",
    },
    logo: {
      fontSize: "12px",
      letterSpacing: "6px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)",
      marginBottom: "12px",
    },
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(28px, 5vw, 44px)",
      fontWeight: 700,
      lineHeight: 1.1,
      margin: 0,
      background: "linear-gradient(135deg, #FFFFFF 0%, #B8B8D0 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: "15px",
      color: "rgba(255,255,255,0.5)",
      marginTop: "12px",
      lineHeight: 1.5,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "16px",
      marginTop: "32px",
    },
    card: (color, isSelected) => ({
      background: isSelected
        ? `linear-gradient(135deg, ${color}22, ${color}11)`
        : "rgba(255,255,255,0.03)",
      border: `1px solid ${isSelected ? color + "66" : "rgba(255,255,255,0.06)"}`,
      borderRadius: "16px",
      padding: "24px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    }),
    scenarioCard: (color) => ({
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      padding: "20px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginBottom: "12px",
    }),
    btn: (color = "#6C5CE7", full = false) => ({
      background: color,
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: full ? "16px 32px" : "12px 24px",
      fontSize: full ? "16px" : "14px",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s ease",
      width: full ? "100%" : "auto",
      letterSpacing: "0.3px",
    }),
    btnOutline: {
      background: "transparent",
      color: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
      padding: "12px 24px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s ease",
    },
    chip: (color) => ({
      display: "inline-block",
      background: color + "20",
      color: color,
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.5px",
    }),
    chatBubble: (isUser) => ({
      maxWidth: "80%",
      padding: "14px 18px",
      borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: isUser
        ? "linear-gradient(135deg, #6C5CE7, #5A4BD1)"
        : "rgba(255,255,255,0.07)",
      marginLeft: isUser ? "auto" : 0,
      marginRight: isUser ? 0 : "auto",
      marginBottom: "12px",
      fontSize: "14px",
      lineHeight: 1.6,
      wordWrap: "break-word",
    }),
  };

  // ─── SCREENS ──────────────────────────────────────────────────────────────

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); }
      33% { transform: translateY(-20px) translateX(10px); }
      66% { transform: translateY(10px) translateX(-10px); }
    }
    @keyframes wave {
      0%, 100% { height: 8px; }
      50% { height: 32px; }
    }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  // HOME
  if (screen === "home") {
    return (
      <div style={S.app}>
        <style>{globalStyles}</style>
        <Particles />
        <div style={S.container}>
          <div style={S.header}>
            <div style={S.logo}>Skill Forge</div>
            <h1 style={S.h1}>Allena le tue<br />Soft Skills</h1>
            <p style={S.subtitle}>
              Pratica conversazioni reali con un coach AI.<br />
              Scegli uno scenario, simula la situazione, ricevi feedback.
            </p>
          </div>

          {!selectedCategory ? (
            <div style={S.grid}>
              {CATEGORIES.map((cat, ci) => (
                <div key={cat.id} style={{
                  ...S.card(cat.color, false),
                  animationDelay: `${ci * 0.08}s`,
                }}
                  onClick={() => setSelectedCategory(cat)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{cat.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>{cat.label}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{cat.description}</div>
                  <div style={{ marginTop: "14px", fontSize: "12px", color: cat.color }}>
                    {cat.scenarios.length} scenari →
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "24px" }}>
              <button style={S.btnOutline} onClick={() => setSelectedCategory(null)}>
                ← Tutte le categorie
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0 20px" }}>
                <span style={{ fontSize: "36px" }}>{selectedCategory.icon}</span>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{selectedCategory.label}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{selectedCategory.description}</div>
                </div>
              </div>

              {selectedCategory.scenarios.map(sc => (
                <div key={sc.id} style={S.scenarioCard(selectedCategory.color)}
                  onClick={() => { setSelectedScenario(sc); navigate("scenario"); }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = selectedCategory.color + "44"; e.currentTarget.style.transform = "translateX(6px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "6px" }}>{sc.title}</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{sc.brief.slice(0, 120)}...</div>
                    </div>
                    <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.2)", marginLeft: "16px" }}>→</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                    {sc.evaluation_criteria.slice(0, 3).map(c => (
                      <span key={c} style={S.chip(selectedCategory.color)}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCENARIO BRIEFING
  if (screen === "scenario") {
    const cat = CATEGORIES.find(c => c.scenarios.some(s => s.id === selectedScenario?.id));
    return (
      <div style={S.app}>
        <style>{globalStyles}</style>
        <Particles />
        <div style={S.container}>
          <button style={{ ...S.btnOutline, marginBottom: "24px" }} onClick={() => { setSelectedScenario(null); navigate("home"); }}>
            ← Scegli altro scenario
          </button>

          <div style={S.chip(cat?.color || "#6C5CE7")}>{cat?.label}</div>
          <h2 style={{ ...S.h1, fontSize: "clamp(24px, 4vw, 36px)", marginTop: "12px" }}>{selectedScenario.title}</h2>

          <div style={{ marginTop: "28px", background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>Scenario</div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>{selectedScenario.brief}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <div style={{ background: "rgba(108,92,231,0.1)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(108,92,231,0.2)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Il tuo ruolo</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_user}</div>
            </div>
            <div style={{ background: "rgba(232,101,90,0.1)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(232,101,90,0.2)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Interlocutore</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{selectedScenario.role_ai}</div>
            </div>
          </div>

          <div style={{ marginTop: "24px", background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
              💡 Consigli dell'Accademia
            </div>
            {selectedScenario.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "rgba(108,92,231,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#6C5CE7" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>{tip}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
            Sarai valutato su
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {selectedScenario.evaluation_criteria.map(c => (
              <span key={c} style={S.chip(cat?.color || "#6C5CE7")}>{c}</span>
            ))}
          </div>

          <button style={{ ...S.btn("#6C5CE7", true), marginTop: "32px" }}
            onClick={() => { setConversation([]); navigate("roleplay"); }}>
            🎭 Inizia il Roleplay
          </button>
        </div>
      </div>
    );
  }

  // ROLEPLAY
  if (screen === "roleplay") {
    return (
      <div style={S.app}>
        <style>{globalStyles}</style>
        <div style={{ ...S.container, display: "flex", flexDirection: "column", height: "100vh", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{selectedScenario.title}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Stai parlando con: {selectedScenario.role_ai}</div>
            </div>
            <button style={{ ...S.btn("#E8655A"), fontSize: "13px", padding: "8px 16px" }}
              onClick={generateReport}
              disabled={conversation.length < 2}>
              Termina → Report
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
            {conversation.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎭</div>
                <div style={{ fontSize: "15px", lineHeight: 1.6 }}>
                  La conversazione è tua.<br />
                  Inizia come se stessi davvero parlando con {selectedScenario.role_ai.split(",")[0]}.
                </div>
              </div>
            )}

            {conversation.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginBottom: "4px", padding: "0 4px" }}>
                  {msg.role === "user" ? "Tu" : selectedScenario.role_ai.split(",")[0]}
                </div>
                <div style={S.chatBubble(msg.role === "user")}>{msg.text}</div>
              </div>
            ))}

            {isThinking && (
              <div style={{ ...S.chatBubble(false), display: "inline-flex", gap: "6px", padding: "16px 20px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.4)",
                    animation: "pulse 1s infinite",
                    animationDelay: `${i * 0.2}s`
                  }} />
                ))}
              </div>
            )}

            {currentTranscript && (
              <div style={{ ...S.chatBubble(true), opacity: 0.6, fontStyle: "italic" }}>
                {currentTranscript}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 0 8px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
              {speechSupported && (
                <button style={{
                  ...S.btnOutline,
                  padding: "6px 14px",
                  fontSize: "12px",
                  background: inputMode === "voice" ? "rgba(108,92,231,0.2)" : "transparent",
                  borderColor: inputMode === "voice" ? "#6C5CE7" : "rgba(255,255,255,0.15)"
                }} onClick={() => setInputMode("voice")}>🎤 Voce</button>
              )}
              <button style={{
                ...S.btnOutline,
                padding: "6px 14px",
                fontSize: "12px",
                background: inputMode === "text" ? "rgba(108,92,231,0.2)" : "transparent",
                borderColor: inputMode === "text" ? "#6C5CE7" : "rgba(255,255,255,0.15)"
              }} onClick={() => setInputMode("text")}>⌨️ Testo</button>
            </div>

            {inputMode === "voice" ? (
              <div style={{ textAlign: "center" }}>
                <VoiceWave active={isListening || isSpeaking} />
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "12px" }}>
                  {!isListening ? (
                    <button style={{
                      ...S.btn("#6C5CE7"),
                      borderRadius: "50%",
                      width: "64px",
                      height: "64px",
                      fontSize: "24px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                      onClick={startListening}
                      disabled={isThinking || isSpeaking}>
                      🎤
                    </button>
                  ) : (
                    <button style={{
                      ...S.btn("#E8655A"),
                      borderRadius: "50%",
                      width: "64px",
                      height: "64px",
                      fontSize: "24px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pulse 1.5s infinite",
                    }}
                      onClick={handleVoiceSend}>
                      ⏹
                    </button>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "8px" }}>
                  {isListening ? "Sto ascoltando... premi per inviare" : isSpeaking ? "In ascolto della risposta..." : "Premi per parlare"}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={userTextInput}
                  onChange={e => setUserTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSend(userTextInput); }}
                  placeholder="Scrivi il tuo messaggio..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    color: "#E8E8F0",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                  disabled={isThinking}
                />
                <button style={S.btn("#6C5CE7")}
                  onClick={() => handleSend(userTextInput)}
                  disabled={!userTextInput.trim() || isThinking}>
                  Invia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // REPORT
  if (screen === "report") {
    return (
      <div style={S.app}>
        <style>{globalStyles}</style>
        <Particles />
        <div style={S.container}>
          {isGeneratingReport || !report ? (
            <div style={{ textAlign: "center", paddingTop: "120px" }}>
              <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#6C5CE7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
              <div style={{ fontSize: "18px", fontWeight: 600 }}>Analizzo la conversazione...</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>Il tuo report personalizzato è in arrivo</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
                <div style={S.logo}>Report di Valutazione</div>
                <h2 style={{ ...S.h1, fontSize: "clamp(22px, 4vw, 32px)" }}>{selectedScenario.title}</h2>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                marginBottom: "20px"
              }}>
                <ScoreRing score={report.overall_score} size={120} strokeWidth={8} />
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>Punteggio Complessivo</div>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginTop: "12px", maxWidth: "500px", margin: "12px auto 0" }}>
                  {report.summary}
                </p>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "20px"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "20px" }}>
                  Valutazione per Criterio
                </div>
                {report.scores.map((s, i) => (
                  <div key={i} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{s.criterion}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: s.score >= 8 ? "#00B894" : s.score >= 6 ? "#FDCB6E" : "#E8655A" }}>{s.score}/10</span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "8px" }}>
                      <div style={{
                        width: `${s.score * 10}%`,
                        height: "100%",
                        borderRadius: "2px",
                        background: s.score >= 8 ? "#00B894" : s.score >= 6 ? "#FDCB6E" : "#E8655A",
                        transition: "width 1.5s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s.comment}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(0,184,148,0.08)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,184,148,0.15)" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#00B894", marginBottom: "14px" }}>✓ Punti di Forza</div>
                  {report.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "8px", paddingLeft: "12px", borderLeft: "2px solid rgba(0,184,148,0.3)" }}>
                      {s}
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(232,101,90,0.08)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(232,101,90,0.15)" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#E8655A", marginBottom: "14px" }}>↑ Aree di Miglioramento</div>
                  {report.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "8px", paddingLeft: "12px", borderLeft: "2px solid rgba(232,101,90,0.3)" }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: "rgba(108,92,231,0.08)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(108,92,231,0.15)",
                marginBottom: "20px"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#6C5CE7", marginBottom: "10px" }}>⚡ Momento Chiave</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{report.key_moment}</div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(108,92,231,0.12), rgba(232,101,90,0.12))",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "32px"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>🎓 Consiglio dell'Accademia</div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontStyle: "italic" }}>
                  "{report.academy_tip}"
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ ...S.btn("#6C5CE7"), flex: 1 }}
                  onClick={() => { setConversation([]); navigate("roleplay"); }}>
                  🔄 Riprova lo Scenario
                </button>
                <button style={{ ...S.btnOutline, flex: 1 }} onClick={restart}>
                  🏠 Torna alla Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
