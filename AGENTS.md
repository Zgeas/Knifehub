<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KnifeHub — contexte agent

Next.js 16 App Router, React 19, Prisma 6, SQLite, Tailwind 4.

## Démarrage de session

1. Lire ce fichier.
2. Ouvrir [docs/README.md](docs/README.md).
3. Pour la tâche : `docs/FEATURES.md` (IDs `F-xxx`) et `docs/TEST-PLAN.md`.
4. Appliquer `.cursor/rules/knifehub-features-and-tests.mdc`.

## Commandes

- App : `npm run dev` (port 3000, base `.env` / `dev.db`).
- Qualité : `npm run check` (TypeScript). `npm run lint` signale encore des erreurs préexistantes (voir `docs/TEST-RESULTS.md`).
- Tests : voir [docs/TESTING.md](docs/TESTING.md) — `npm run test`, `test:integration`, `test:e2e` (inclut le responsive), `test:all`.
- UI : toute nouvelle surface doit rester utilisable sur mobile (F-022) ; PWA (F-023) hors périmètre sauf demande.

## Contraintes

- Ne pas réinitialiser `prisma/dev.db` depuis les tests.
- Ne pas committer `.env` ni recopier des secrets.
- Auth actuelle : cookie e-mail sans mot de passe (limitation documentée F-002).
