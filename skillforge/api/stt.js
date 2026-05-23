// /api/stt.js — Speech-to-Text fallback for browsers without Web Speech API (iOS Safari, etc.)
// Receives base64 audio from the browser, sends it to Groq Whisper, returns transcription.
//
// Env vars required (set in Vercel):
//   GROQ_API_KEY     — your Groq API key (free tier OK, very fast). Get one at console.groq.com
// OR (fallback):
//   OPENAI_API_KEY   — if you don't have Groq, OpenAI Whisper also works (paid).

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!groqKey && !openaiKey) {
    return res.status(500).json({ error: "No STT API key configured (set GROQ_API_KEY or OPENAI_API_KEY)" });
  }

  try {
    const { audio, mimeType, language } = req.body || {};
    if (!audio) return res.status(400).json({ error: "Missing audio" });

    // Decode base64 → Buffer
    const buffer = Buffer.from(audio, "base64");
    const mt = mimeType || "audio/webm";

    // Filename extension based on mime type
    let ext = "webm";
    if (mt.includes("mp4") || mt.includes("m4a")) ext = "m4a";
    else if (mt.includes("mpeg") || mt.includes("mp3")) ext = "mp3";
    else if (mt.includes("wav")) ext = "wav";
    else if (mt.includes("ogg")) ext = "ogg";

    // Build multipart form-data manually (no extra deps)
    const boundary = "----skillforge" + Math.random().toString(36).slice(2);
    const lang = language || "it";

    const useGroq = !!groqKey;
    const apiUrl = useGroq
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";
    const apiKey = useGroq ? groqKey : openaiKey;
    const model = useGroq ? "whisper-large-v3-turbo" : "whisper-1";

    const parts = [];
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="audio.${ext}"\r\n`));
    parts.push(Buffer.from(`Content-Type: ${mt}\r\n\r\n`));
    parts.push(buffer);
    parts.push(Buffer.from(`\r\n--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="model"\r\n\r\n`));
    parts.push(Buffer.from(model));
    parts.push(Buffer.from(`\r\n--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="language"\r\n\r\n`));
    parts.push(Buffer.from(lang));
    parts.push(Buffer.from(`\r\n--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="response_format"\r\n\r\n`));
    parts.push(Buffer.from("json"));
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    const body = Buffer.concat(parts);

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      console.error("STT error:", r.status, errText);
      return res.status(r.status).json({ error: "Transcription failed", detail: errText.slice(0, 300) });
    }

    const data = await r.json();
    const text = (data?.text || "").trim();
    return res.status(200).json({ text });
  } catch (error) {
    console.error("STT API Error:", error);
    return res.status(500).json({ error: "Failed to transcribe audio", detail: String(error?.message || error) });
  }
}
