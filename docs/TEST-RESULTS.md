# Dernier bilan d’exécution

- **Date** : 2026-10-11, vers 19:34 (heure locale de la machine de développement)
- **Arbre** : modifications locales de documentation/tests **non commitées** au moment de l’exécution (HEAD git alors `02df18c`)
- **Machine** : Windows, Node utilisé par npm pour Vitest/Playwright

## Commandes réellement exécutées

| Commande | Résultat |
| --- | --- |
| `npx vitest run` | **Réussite** — 11 fichiers, **33** tests |
| `npx tsc --noEmit` (`npm run check`) | **Réussite** |
| `node scripts/prepare-test-db.mjs` | **Réussite** — `Datasource "db": SQLite database "test.db"` ; message d’ignorance de `DATABASE_URL` shell vers `dev.db` |
| `npx vitest run --config vitest.integration.config.ts` | **Réussite** — 1 fichier, **7** tests |
| `npx playwright install chromium` | **Réussite** (binaire Chromium Playwright) |
| `npx next build` | **Réussite** (toutes les routes App Router en dynamique) |
| `npx playwright test` (après correction TEST-F002-02) | **Réussite** — **9** tests |
| `npx eslint .` / `npm run lint` | **Échec** — 5 erreurs préexistantes (SearchBar, FeedExplorer, apostrophes JSX) + 13 warnings `<img>` |
| `npm run test:e2e` première tentative `next dev :3100` | **Échec / bloqué** — Next refuse un second `next dev` si le PID 3000 tourne. Correctif : `next start` sur 3100 |

`npm run test:all` n’a pas été lancé d’un seul tenant ; les sous-commandes ci-dessus l’équivalent (hors lint).

## Détail tests automatisés (dernier run vert)

**Unitaires (33)** : feed-filters, artisan-profile-form, knife-form, knife-images, knife-materials, format, profile, auth-roles, persist-image, test-database-guard, admin-parse.

**Intégration (7)** : isolation URL test.db, annuaire avec/sans couteau, PENDING, approve/reject métier Prisma, create/update knife, update profil.

**E2E (9)** : e-mail HTML5 invalide, login USER, déjà connecté, logout, fil+header, `/profile`→login, `/admin`→login, 404 artisan, 404 couteau.

## Non exécuté / bloqué

- `TEST-F002-04` admin bootstrap vers `/admin` : **manuel**
- `TEST-F010-04`, `TEST-SEC-01` POST API avec/sans cookie : **manuel**
- `TEST-SEC-02` : **manuel** (limitation produit)
- `TEST-F013-02` 404 édition autre artisan : **non E2E**
- Lint : **échec préexistant**, documenté, non masqué
- Couverture Istanbul : **non configurée**

## Écart vs un bilan précédent

Aucun bilan antérieur dans le dépôt.

## Fonctionnalités

Voir le tableau dans [FEATURES.md](./FEATURES.md). F-006 reste `NEEDS_REVIEW`. F-017 `IMPLEMENTED_UNVERIFIED`. F-020 `PLANNED`.
