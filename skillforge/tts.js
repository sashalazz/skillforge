// /api/tts.js — Text-to-Speech con ElevenLabs.
// Tre voci distinte:
//   - "avatar" + gender="M"  → voce maschile italiana (Antoni)
//   - "avatar" + gender="F"  → voce femminile italiana (Sarah / configurabile)
//   - "narrator"             → voce neutra sobria (Adam), indipendente dal genere
//
// Env vars (impostabili su Vercel → Settings → Environment Variables):
//   ELEVENLABS_API_KEY              (obbligatoria)
//   ELEVENLABS_VOICE_ID_M           ID voce avatar maschile   (default: Antoni)
//   ELEVENLABS_VOICE_ID_F           ID voce avatar femminile  (default: Sarah)
//   ELEVENLABS_VOICE_ID             alias compat. → mappata su _M se _M non c'è
//   ELEVENLABS_NARRATOR_VOICE_ID    ID voce narratore         (default: Adam)
//   ELEVENLABS_MODEL_ID             default: eleven_multilingual_v2
//
// Voci consigliate (ElevenLabs Voice Library):
//   Antoni    ErXwobaYiN019PkySvjV   maschile, caldo, conversazionale
//   Giovanni  zcAOhNBS3c14rBihAFp1   maschile italiano, professionale
//   Sarah     EXAVITQu4vr4xnSDxMaL   femminile, professionale (multilingue, ottima in italiano)
//   Rachel    21m00Tcm4TlvDq8ikWAM   femminile (multilingue)
//   Adam      pNInz6obpgDQGcFmaJgB   maschile profondo da documentario
//
// Per voci italiane native cerca su https://elevenlabs.io/app/voice-library con filtro
// Language=Italian, copia l'ID, e impostalo nelle env vars (no redeploy del codice).

const DEFAULT_AVATAR_VOICE_M  = "ErXwobaYiN019PkySvjV"; // Antoni
const DEFAULT_AVATAR_VOICE_F  = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const DEFAULT_NARRATOR_VOICE  = "pNInz6obpgDQGcFmaJgB"; // Adam

// Settings ottimizzati per ciascun ruolo:
// - avatar:    più espressività (stability bassa, style alto, similarity boost alto)
// - narrator:  neutro e stabile (stability altissima, style zero)
const VOICE_SETTINGS = {
  avatar: {
    stability: 0.42,         // più variazione → suona più "umano"
    similarity_boost: 0.85,
    style: 0.55,             // più stile/emozione
    use_speaker_boost: true,
  },
  narrator: {
    stability: 0.92,         // molto stabile → tono uniforme da narratore
    similarity_boost: 0.75,
    style: 0.0,              // nessuna emozione → neutro
    use_speaker_boost: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ElevenLabs API key not configured" });

  try {
    const { text, role, gender, voice_id } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "Missing text" });

    // role: "avatar" (default) o "narrator"
    const r = role === "narrator" ? "narrator" : "avatar";
    // gender: "F" o "M" (default M). Ignorato per il narratore.
    const g = gender === "F" ? "F" : "M";

    // Risoluzione voiceId:
    //   1) voice_id esplicito nel body
    //   2) env var per ruolo+genere
    //   3) default per ruolo+genere
    let voiceId = voice_id;
    if (!voiceId) {
      if (r === "narrator") {
        voiceId = process.env.ELEVENLABS_NARRATOR_VOICE_ID || DEFAULT_NARRATOR_VOICE;
      } else if (g === "F") {
        voiceId = process.env.ELEVENLABS_VOICE_ID_F || DEFAULT_AVATAR_VOICE_F;
      } else {
        // M (o default): supporta sia ELEVENLABS_VOICE_ID_M sia il vecchio ELEVENLABS_VOICE_ID
        voiceId = process.env.ELEVENLABS_VOICE_ID_M || process.env.ELEVENLABS_VOICE_ID || DEFAULT_AVATAR_VOICE_M;
      }
    }

    const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
    const voiceSettings = VOICE_SETTINGS[r];

    const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });

    if (!elRes.ok) {
      const errData = await elRes.json().catch(() => ({}));
      console.error("ElevenLabs error:", elRes.status, errData);
      return res.status(elRes.status).json({ error: errData?.detail?.message || errData?.detail || "ElevenLabs request failed" });
    }

    const audioBuffer = await elRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength);
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS API Error:", error);
    return res.status(500).json({ error: "Failed to generate speech" });
  }
}
