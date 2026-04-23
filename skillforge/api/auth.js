import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash: `${salt}:${hash}`, salt };
}

function verifyPassword(password, stored) {
  const [salt, original] = stored.split(":");
  const { hash } = hashPassword(password, salt);
  return hash === stored;
}

// Simple JWT-like token (signed with secret)
function createToken(userId, email, isAdmin) {
  const payload = JSON.stringify({ id: userId, email, isAdmin, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const sig = crypto.createHmac("sha256", process.env.AUTH_SECRET || "sf-secret-key-change-me").update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + sig;
}

function verifyToken(token) {
  try {
    const [payloadB64, sig] = token.split(".");
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", process.env.AUTH_SECRET || "sf-secret-key-change-me").update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action } = req.body || {};

  // ─── REGISTER ─────────────────────────────────────────────
  if (action === "register") {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    if (password.length < 6) return res.status(400).json({ error: "Password minimo 6 caratteri" });

    const { data: existing } = await supabase.from("sf_users").select("id").eq("email", email.toLowerCase().trim()).single();
    if (existing) return res.status(400).json({ error: "Email già registrata" });

    const { hash } = hashPassword(password);
    const { error } = await supabase.from("sf_users").insert({ email: email.toLowerCase().trim(), password_hash: hash, name: name.trim() });
    if (error) return res.status(500).json({ error: "Errore registrazione: " + error.message });

    return res.status(200).json({ success: true, message: "Registrazione completata. Attendi l'approvazione dell'amministratore." });
  }

  // ─── LOGIN ────────────────────────────────────────────────
  if (action === "login") {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email e password richieste" });

    const { data: user } = await supabase.from("sf_users").select("*").eq("email", email.toLowerCase().trim()).single();
    if (!user) return res.status(401).json({ error: "Email o password errata" });
    if (!verifyPassword(password, user.password_hash)) return res.status(401).json({ error: "Email o password errata" });
    if (!user.approved) return res.status(403).json({ error: "Account in attesa di approvazione. Contatta l'amministratore." });

    const token = createToken(user.id, user.email, user.is_admin);
    // Parse enabled_sections
    let enabledSections = null;
    if (user.enabled_sections) {
      try { enabledSections = JSON.parse(user.enabled_sections); } catch { enabledSections = null; }
    }
    return res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, enabledSections } });
  }

  // ─── VERIFY TOKEN ─────────────────────────────────────────
  if (action === "verify") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Token non valido" });

    let { data: user } = await supabase.from("sf_users").select("id, name, email, is_admin, approved, enabled_sections").eq("id", decoded.id).single();
    // Fallback if enabled_sections column doesn't exist
    if (!user) {
      const { data: userFallback } = await supabase.from("sf_users").select("id, name, email, is_admin, approved").eq("id", decoded.id).single();
      user = userFallback ? { ...userFallback, enabled_sections: null } : null;
    }
    if (!user || !user.approved) return res.status(401).json({ error: "Accesso non autorizzato" });

    let enabledSections = null;
    if (user.enabled_sections) {
      try { enabledSections = JSON.parse(user.enabled_sections); } catch { enabledSections = null; }
    }
    return res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, enabledSections } });
  }

  // ─── ADMIN: LIST USERS ────────────────────────────────────
  if (action === "admin_list_users") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ error: "Accesso negato" });

    const { data: users, error: usersError } = await supabase.from("sf_users").select("id, email, name, approved, is_admin, daily_limit, enabled_sections, created_at").order("created_at", { ascending: false });

    // Fallback: if enabled_sections column doesn't exist yet, retry without it
    let finalUsers = users;
    if (usersError) {
      const { data: usersFallback } = await supabase.from("sf_users").select("id, email, name, approved, is_admin, daily_limit, created_at").order("created_at", { ascending: false });
      finalUsers = (usersFallback || []).map(u => ({ ...u, enabled_sections: null }));
    }

    // Get global default
    const { data: config } = await supabase.from("sf_config").select("value").eq("key", "daily_limit").single();
    const globalLimit = config ? parseInt(config.value) : 5;

    return res.status(200).json({ success: true, users: finalUsers || [], globalLimit });
  }

  // ─── ADMIN: APPROVE / REJECT / DELETE USER ────────────────
  if (action === "admin_update_user") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ error: "Accesso negato" });

    const { userId, approved, remove, daily_limit, enabled_sections } = req.body;
    if (!userId) return res.status(400).json({ error: "userId richiesto" });

    if (remove) {
      await supabase.from("sf_scores").delete().eq("user_id", userId);
      await supabase.from("sf_users").delete().eq("id", userId);
    } else if (daily_limit !== undefined) {
      // Set per-user limit (null = use global default)
      const val = daily_limit === null || daily_limit === "" ? null : parseInt(daily_limit);
      await supabase.from("sf_users").update({ daily_limit: val }).eq("id", userId);
    } else if (enabled_sections !== undefined) {
      // Set per-user enabled sections — always save as JSON array
      const val = (enabled_sections && Array.isArray(enabled_sections)) ? JSON.stringify(enabled_sections) : null;
      try {
        await supabase.from("sf_users").update({ enabled_sections: val }).eq("id", userId);
      } catch {
        return res.status(500).json({ error: "Colonna enabled_sections non trovata. Esegui: ALTER TABLE sf_users ADD COLUMN enabled_sections TEXT DEFAULT NULL;" });
      }
    } else {
      await supabase.from("sf_users").update({ approved }).eq("id", userId);
    }
    return res.status(200).json({ success: true });
  }

  // ─── SAVE SCORE ───────────────────────────────────────────
  if (action === "save_score") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Non autenticato" });

    const { scenarioId, difficulty, score, duration_seconds } = req.body;
    await supabase.from("sf_scores").insert({ user_id: decoded.id, scenario_id: scenarioId, difficulty, score, duration_seconds: duration_seconds || null });
    return res.status(200).json({ success: true });
  }

  // ─── CHECK DAILY LIMIT ────────────────────────────────────
  if (action === "check_daily_limit") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Non autenticato" });

    // Get user's personal limit
    const { data: userData } = await supabase.from("sf_users").select("daily_limit, is_admin").eq("id", decoded.id).single();

    // Get global default limit
    const { data: config } = await supabase.from("sf_config").select("value").eq("key", "daily_limit").single();
    const globalLimit = config ? parseInt(config.value) : 5;

    // Per-user limit overrides global, null = use global
    const dailyLimit = (userData?.daily_limit != null) ? userData.daily_limit : globalLimit;

    // Count today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count } = await supabase.from("sf_scores").select("id", { count: "exact", head: true })
      .eq("user_id", decoded.id)
      .gte("created_at", today.toISOString());

    // Admin has no limit
    if (userData?.is_admin) return res.status(200).json({ success: true, allowed: true, used: count || 0, limit: dailyLimit, isAdmin: true });

    return res.status(200).json({ success: true, allowed: (count || 0) < dailyLimit, used: count || 0, limit: dailyLimit });
  }

  // ─── ADMIN: GET/SET CONFIG ────────────────────────────────
  if (action === "admin_get_config") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ error: "Accesso negato" });

    const { data: config } = await supabase.from("sf_config").select("key, value");
    const configMap = {};
    (config || []).forEach(c => { configMap[c.key] = c.value; });
    return res.status(200).json({ success: true, config: configMap });
  }

  if (action === "admin_set_config") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ error: "Accesso negato" });

    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Key richiesta" });

    // Upsert
    const { data: existing } = await supabase.from("sf_config").select("key").eq("key", key).single();
    if (existing) {
      await supabase.from("sf_config").update({ value: String(value) }).eq("key", key);
    } else {
      await supabase.from("sf_config").insert({ key, value: String(value) });
    }
    return res.status(200).json({ success: true });
  }

  // ─── ADMIN: USER STATS ─────────────────────────────────────
  if (action === "admin_user_stats") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ error: "Accesso negato" });

    // Fetch all scores with user info
    const { data: scores } = await supabase
      .from("sf_scores")
      .select("user_id, scenario_id, difficulty, score, duration_seconds, created_at")
      .order("created_at", { ascending: false });

    // Aggregate per user
    const stats = {};
    (scores || []).forEach(s => {
      if (!stats[s.user_id]) {
        stats[s.user_id] = {
          lastAccess: s.created_at,
          scenarios: [],
          totalMinutes: 0,
          totalScore: 0,
          count: 0
        };
      }
      const st = stats[s.user_id];
      // lastAccess is already the most recent since ordered desc
      st.scenarios.push({
        scenarioId: s.scenario_id,
        difficulty: s.difficulty,
        score: s.score,
        durationSeconds: s.duration_seconds,
        date: s.created_at
      });
      if (s.duration_seconds) st.totalMinutes += s.duration_seconds / 60;
      st.totalScore += s.score;
      st.count += 1;
    });

    return res.status(200).json({ success: true, stats });
  }

  // ─── GET LEADERBOARD ──────────────────────────────────────
  if (action === "leaderboard") {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Non autenticato" });

    const { data: scores } = await supabase.from("sf_scores").select("user_id, score, sf_users(name)");
    // Aggregate
    const agg = {};
    (scores || []).forEach(s => {
      const name = s.sf_users?.name || "?";
      if (!agg[s.user_id]) agg[s.user_id] = { name, total: 0, count: 0 };
      agg[s.user_id].total += s.score;
      agg[s.user_id].count += 1;
    });
    const rows = Object.entries(agg).map(([uid, d]) => ({
      userId: uid, name: d.name, avg: Math.round((d.total / d.count) * 10) / 10, count: d.count
    })).sort((a, b) => b.avg - a.avg || b.count - a.count);

    return res.status(200).json({ success: true, leaderboard: rows });
  }

  return res.status(400).json({ error: "Azione non riconosciuta" });
}
