# Skill Forge — Soft Skills Training Platform

## Deploy su Vercel (Guida Passo-Passo)

### Prerequisiti
- Account Vercel (già fatto ✓)
- Account GitHub (gratuito)
- API Key di Anthropic (da console.anthropic.com)

### Step 1: Crea un repository GitHub
1. Vai su github.com e crea un account se non ce l'hai
2. Clicca "New Repository" (il pulsante verde "+")
3. Nome: `skillforge`
4. Lascia "Public" e clicca "Create repository"

### Step 2: Carica i file
1. Nella pagina del repository appena creato, clicca "uploading an existing file"
2. Trascina TUTTI i file e le cartelle di questo progetto
3. Clicca "Commit changes"

### Step 3: Collega a Vercel
1. Vai su vercel.com/new
2. Clicca "Import" accanto al repository `skillforge`
3. Framework Preset: seleziona "Vite"
4. Clicca "Deploy"

### Step 4: Aggiungi la API Key (IMPORTANTE!)
1. Vai nelle Settings del progetto su Vercel
2. Vai in "Environment Variables"
3. Aggiungi:
   - Key: `ANTHROPIC_API_KEY`
   - Value: la tua API key (inizia con `sk-ant-...`)
4. Clicca "Save"
5. Vai in "Deployments" e clicca "Redeploy" sull'ultimo deploy

### Fatto! 🎉
Il tuo sito sarà live su `skillforge.vercel.app` (o simile).

## Struttura del Progetto
```
skillforge/
├── api/
│   └── chat.js          # Serverless function (proxy sicuro per API Anthropic)
├── src/
│   ├── App.jsx          # Componente principale dell'app
│   └── main.jsx         # Entry point React
├── index.html           # HTML template
├── package.json         # Dipendenze
├── vite.config.js       # Configurazione Vite
├── vercel.json          # Configurazione Vercel
└── .gitignore
```
