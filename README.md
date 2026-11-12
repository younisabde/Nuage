# Nuage

Un espace pour vider son sac. On raconte ce qui ne va pas, et Nuage répond avec chaleur, écoute et petits conseils concrets, comme un ami, pas comme un robot. Bouboule, le doudou, permet aussi d'en parler à voix haute.

### Ce que fait l'app
- **Accueil** : prénom (facultatif), « météo intérieure » (☀️ ⛅ 🌫️ 🌧️ ⛈️) et **style d'écoute** : 👂 juste écouter, 💡 des conseils, ou 🎈 me changer les idées. Le style se change aussi pendant la conversation.
- **Conversation** : des messages courts et chaleureux, une question à la fois. Nuage « tape » ses réponses, et le petit nuage s'anime quand il écrit.
- **Mémoire** : toutes les 4 réponses et en fin de conversation, Nuage met à jour un petit carnet (8 faits maximum + le dernier sujet abordé). À la visite suivante, il prend des nouvelles (« la dernière fois tu me parlais de… »). Le carnet est visible, et chaque élément peut être effacé (« Ce que je retiens de toi »).
- **Menu en bas** : Parler, Bouboule, Outils, Journal, Mon Nuage.
- **Bouboule, le doudou vocal** : un ours en peluche animé (il écoute en remuant les oreilles, réfléchit, bouge la bouche quand il parle). On appuie pour parler, on rappuie pour envoyer ; il répond à voix haute, en phrases courtes et câlines. Reconnaissance et synthèse vocale du navigateur (Chrome, Edge, Safari récent) ; sinon on peut lui écrire.
- **Évacue ta colère** (mis en avant dans Outils et dans la conversation) : on note sa colère sur 10, on écrit tout, et le texte prend feu et part en fumée ; on note ensuite sa colère à nouveau pour voir la différence. Rien n'est gardé ni envoyé.
- **Journal météo** : chaque météo choisie est notée par jour (on peut aussi la noter sans discuter). Calendrier des 4 dernières semaines et bilan comparé à la semaine précédente.
- **Boîte à outils** : respiration guidée (4 s inspire, 4 s pause, 6 s expire), ancrage 5-4-3-2-1, liste de petits plaisirs avec tirage au hasard. Nuage s'appuie sur cette liste pour remonter le moral.
- **Nuage évolue** : chaque jour où l'on prend soin de soi (météo notée, outil utilisé, conversation), il gagne des accessoires : écharpe (2 jours), fleur (5), lunettes (10), arc-en-ciel (15), étoiles (25). Il ne perd jamais rien.
- **Sécurité** : bouton **Aide** toujours visible (3114, 112/15, SOS Amitié, Fil Santé Jeunes, 3919, 119), bandeau d'aide immédiat si un message contient des mots de détresse, consignes de crise dans la personnalité de Nuage.
- **Confidentialité** : conversation, carnet et journal sont stockés seulement dans le navigateur (`localStorage`). Le serveur ne garde rien.

### Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Toute l'interface (HTML, CSS et JS sans dépendance) |
| `api/_nuage.js` | Personnalité de Nuage et de Bouboule, consignes du carnet et contexte envoyé à l'IA. C'est le fichier à modifier pour changer leur ton |
| `api/chat.js` | Route serveur : appelle Claude et renvoie la réponse en direct |
| `api/memo.js` | Route serveur : met à jour le carnet |
| `dev-server.js` | Petit serveur pour tester en local |

### Lancer en local
```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run dev
# puis ouvrir http://localhost:3000/
```

### Mettre en ligne (Vercel, gratuit)
1. Sur [vercel.com](https://vercel.com), se connecter avec GitHub, puis **Add New → Project** et importer ce dépôt (aucun réglage de build n'est nécessaire).
2. Dans *Environment Variables*, ajouter `ANTHROPIC_API_KEY` (clé créée sur [console.anthropic.com](https://console.anthropic.com)).
3. **Deploy**. Nuage est en ligne à l'adresse donnée par Vercel, et se met à jour à chaque envoi sur GitHub.

La clé reste sur le serveur : elle n'est jamais envoyée au navigateur. GitHub Pages ne suffit pas, car il faut un serveur pour cacher la clé.

### À prévoir avant une ouverture au public
- Ajouter une limite de messages par personne ou par adresse IP (par exemple avec Vercel KV ou Upstash), pour éviter les abus sur la facture.
- Faire relire la personnalité et le parcours de crise par un professionnel de santé mentale.
- Ajouter des mentions légales et une politique de confidentialité (les données de santé sont sensibles au sens du RGPD).
