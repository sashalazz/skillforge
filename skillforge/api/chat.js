export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }
  try {
    const { messages, system, max_tokens } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }
    const trimmedMessages = messages.slice(-6);
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: max_tokens || 200,
        system: system || "",
        messages: trimmedMessages,
      }),
    });
    const data = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      console.error("Anthropic API error:", data);
      return res.status(anthropicResponse.status).json({
        error: data?.error?.message || "Anthropic request failed",
      });
    }
    const text =
      data?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n")
        ?.trim() || "";
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to call AI" });
  }
}
