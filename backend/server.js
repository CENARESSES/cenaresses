import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

// Le mot de passe admin se règle via une variable d'environnement en
// production (voir README). Une valeur par défaut est fournie pour
// simplifier les tests en local.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cenaresses2026';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors()); // en production, restreindre à l'origine de votre site (voir README)
app.use(express.json());

/* -------------------------------------------------------------- */
/*  Authentification très simple par jeton en mémoire              */
/*  (suffisant pour un seul site avec un ou deux administrateurs). */
/* -------------------------------------------------------------- */
const activeSessions = new Set();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Non autorisé. Merci de vous reconnecter.' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(24).toString('hex');
    activeSessions.add(token);
    return res.json({ token });
  }
  res.status(401).json({ error: 'Mot de passe incorrect.' });
});

app.post('/api/admin/logout', requireAuth, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.slice(7);
  activeSessions.delete(token);
  res.json({ ok: true });
});

/* -------------------------------------------------------------- */
/*  Contenu du site (projets, publications, équipe, actualités)   */
/* -------------------------------------------------------------- */

app.get('/api/content', async (req, res) => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Lecture du contenu impossible :', err);
    res.status(500).json({ error: 'Impossible de lire le contenu.' });
  }
});

// Remplace l'intégralité du contenu (le frontend envoie l'objet complet
// après chaque ajout/modification/suppression). Simple et suffisant
// pour le volume de données d'un site vitrine.
app.put('/api/content', requireAuth, async (req, res) => {
  try {
    const next = req.body;
    if (!next || typeof next !== 'object') {
      return res.status(400).json({ error: 'Contenu invalide.' });
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Écriture du contenu impossible :', err);
    res.status(500).json({ error: "Impossible d'enregistrer le contenu." });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend CENARESSES à l'écoute sur http://localhost:${PORT}`);
});
