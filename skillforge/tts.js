export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ElevenLabs API key not configured" });

  try {
    const { text, voice_id } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "Missing text" });

    const voiceId = voice_id || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.78,
          similarity_boost: 0.88,
          style: 0.18,
          speed: 0.9,
          use_speaker_boost: true,
        },
      }),
    });

    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      console.error("ElevenLabs error:", r.status, errData);
      return res.status(r.status).json({ error: errData?.detail?.message || "ElevenLabs request failed" });
    }

    // Stream audio back as mp3
    const audioBuffer = await r.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength);
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS API Error:", error);
    return res.status(500).json({ error: "Failed to generate speech" });
  }
}
