# Skill Forge v5 — Con Autenticazione

## Setup Completo (15-20 minuti)

### STEP 1: Crea Supabase (Database gratuito)

1. Vai su **supabase.com** e crea un account gratuito
2. Clicca **"New Project"**
   - Nome: `skillforge`
   - Password: scegline una (e salvala)
   - Regione: **Central EU (Frankfurt)** 
3. Aspetta 1-2 min che il progetto si crei
4. Vai in **SQL Editor** (icona nel menu a sinistra)
5. Incolla il contenuto di `supabase-setup.sql` e clicca **Run**
6. Vai in **Project Settings → API** e copia:
   - `Project URL` → sarà il tuo `SUPABASE_URL`
   - `service_role` key (sotto "Project API keys") → sarà `SUPABASE_SERVICE_KEY`
   - ⚠️ USA la `service_role` key, NON la `anon` key!

### STEP 2: Aggiorna GitHub

1. Estrai lo zip `skillforge-v5.zip`
2. Vai nel tuo repo su GitHub
3. Elimina tutti i file esistenti
4. Carica tutti i nuovi file dalla cartella `skillforge`
5. Commit

### STEP 3: Configura Vercel

1. Vai nelle **Settings** del progetto su Vercel
2. Vai in **Environment Variables**
3. Aggiungi queste 4 variabili:

   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` (la tua API key Anthropic) |
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` (da Supabase) |
   | `SUPABASE_SERVICE_KEY` | `eyJhbG...` (service_role key da Supabase) |
   | `AUTH_SECRET` | Una stringa casuale lunga (es. `mia-chiave-segreta-skillforge-2026!`) |

4. Vai in **Deployments** e clicca **Redeploy**

### STEP 4: Crea il tuo account Admin

1. Vai sul sito e registrati con la TUA email
2. Torna su **Supabase → SQL Editor** e esegui:
   ```sql
   UPDATE sf_users SET approved = true, is_admin = true WHERE email = 'TUA_EMAIL@esempio.com';
   ```
3. Ora puoi fare login e vedrai il pulsante **👑 Admin**

### Come funziona

- **Registrazione**: chiunque può registrarsi ma NON può usare l'app
- **Approvazione**: tu (admin) vedi la lista utenti e approvi chi vuoi
- **Login**: solo utenti approvati possono entrare
- **Admin panel**: approva, revoca o elimina utenti
- **Leaderboard**: salvata nel database, condivisa tra tutti
- **Sicurezza**: password hashate, token JWT con scadenza 24h

### Struttura
```
skillforge/
├── api/
│   ├── auth.js    ← Registrazione, login, admin, leaderboard
│   └── chat.js    ← Proxy AI (Haiku)
├── src/
│   ├── App.jsx    ← App completa con auth
│   └── main.jsx
├── supabase-setup.sql  ← Script DB (esegui in Supabase)
├── package.json
├── index.html
├── vite.config.js
└── vercel.json
```
