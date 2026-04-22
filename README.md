# Cardify

Application web de génération de cartes scolaires pour établissements d'enseignement. Permet d'importer une liste d'élèves (Excel ou saisie manuelle), d'associer des photos, et d'exporter un PDF de cartes prêt à imprimer.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| Base de données | PostgreSQL via Prisma + Neon (serverless) |
| Auth | JWT (jose) + cookie HTTP-only |
| State | Zustand (persisté localStorage) |
| PDF | @react-pdf/renderer |
| Excel | xlsx |
| UI | Tailwind CSS v4, Framer Motion, Lucide |

---

## Prérequis

- Node.js ≥ 18
- Une base de données PostgreSQL (ex. [Neon](https://neon.tech))

---

## Installation

```bash
git clone <repo>
cd Cardify
npm install
```

Créer un fichier `.env.local` :

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=<secret-long-et-aleatoire>
```

Initialiser la base de données :

```bash
npx prisma generate
npx prisma db push
```

Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/         # login, logout, register, me
│   │   ├── students/     # CRUD élèves
│   │   ├── settings/     # Paramètres école
│   │   ├── generate/     # Historique de génération
│   │   └── projects/     # Projets
│   ├── dashboard/        # Page principale (pipeline)
│   ├── login/
│   └── register/
├── components/
│   ├── card/             # Aperçu d'une carte élève
│   ├── dashboard/        # Composants du pipeline
│   ├── pdf/              # Génération PDF
│   └── ui/               # Composants génériques
├── hooks/
│   ├── useAuth.ts        # Authentification côté client
│   └── useSync.ts        # Sync auto store ↔ base de données
├── lib/
│   ├── auth.ts           # JWT, session cookie
│   ├── db.ts             # Client Prisma
│   ├── excel.ts          # Parse Excel, mapping, validation
│   ├── qrcode.ts         # Génération QR code
│   └── validators.ts     # Schémas Zod
├── store/index.ts        # Store Zustand global
└── types/index.ts        # Types TypeScript partagés
```

---

## Fonctionnalités

### Pipeline en 5 étapes

1. **Import / Saisie** — Choisir entre import Excel ou saisie manuelle d'un élève
2. **Mapping des colonnes** — Associer les colonnes du fichier Excel aux champs attendus
3. **Validation** — Détection des champs manquants et matricules dupliqués
4. **Prévisualisation** — Galerie des cartes avec gestion des photos
5. **Export PDF** — Génération d'un PDF (grille 2×4) prêt à imprimer

### Gestion de l'école

- Nom, adresse, téléphone, année scolaire
- Logo, drapeau, signature (stockés en base64)
- Couleur de thème personnalisable
- Plans `free` (50 élèves max) et `premium`

### Authentification

- Inscription / connexion par email + mot de passe (bcrypt)
- Session JWT dans un cookie HTTP-only (durée 7 jours)
- Rôles : `ADMIN`, `SECRETAIRE`, `VIEWER`

### Synchronisation

Le hook `useSync` charge automatiquement les données de la base au montage et sauvegarde les paramètres école avec un debounce de 1,5 s. Les élèves sont sauvegardés manuellement lors de la progression dans le pipeline.

---

## API Routes

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| POST | `/api/auth/logout` | Se déconnecter |
| GET | `/api/auth/me` | Session courante |
| GET | `/api/students` | Lister les élèves |
| POST | `/api/students` | Remplacer tous les élèves |
| DELETE | `/api/students` | Supprimer un élève |
| GET/PUT | `/api/settings` | Paramètres de l'école |
| GET/POST | `/api/generate` | Historique de génération |
| GET/POST | `/api/projects` | Projets |

---

## Modèle de données

```
User       → appartient à une School
School     → possède des Students, GenerationHistory, Projects
Student    → matricule unique par école, photo optionnelle
GenerationHistory → log de chaque export PDF
Project    → regroupement d'élèves (fonctionnalité future)
```

---

## Build & déploiement

```bash
npm run build   # prisma generate + next build
npm run start
```

Déploiement recommandé sur [Vercel](https://vercel.com) avec une base Neon. Ajouter les variables d'environnement `DATABASE_URL` et `JWT_SECRET` dans les paramètres du projet.
