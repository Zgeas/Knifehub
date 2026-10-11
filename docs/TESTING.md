# Commandes de test et isolation

## Isolation de la base

- Développement : `DATABASE_URL` du fichier `.env` (en pratique `file:./dev.db` via Prisma). **Ne jamais réinitialiser cette base depuis un script de test.**
- Tests : URL forcée `file:<racine>/prisma/test.db` par `scripts/prepare-test-db.mjs`, Vitest d’intégration et Playwright. Cette URL est vérifiée : un chemin contenant `dev.db` fait échouer le script.
- Les tests d’intégration n’utilisent pas le singleton `lib/db.ts` : ils ouvrent un `PrismaClient` avec l’URL de test explicite.
- Les fichiers `prisma/test.db*` sont ignorés par git.

## Commandes

| Commande | Rôle | Serveur | Base | Obligatoire ? |
| --- | --- | --- | --- | --- |
| `npm run check` | `tsc --noEmit` | Non | Non | Oui |
| `npm run lint` / `check:lint` | ESLint | Non | Non | **Actuellement en échec** : 5 erreurs préexistantes (SearchBar / FeedExplorer `setState` dans `useEffect`, apostrophes JSX). Ne pas les « corriger » en changeant le comportement sans tests. |
| `npm run test` | Tests unitaires Vitest (`lib/**/*.test.ts`) | Non | Non | Oui |
| `npm run test:db:prepare` | `prisma db push` + seed sur `prisma/test.db` uniquement | Non | Test | Prérequis intégration / E2E |
| `npm run test:integration` | Prépare la base test puis Vitest intégration | Non | Test | Oui |
| `npm run test:e2e` | Prépare `test.db`, **build** Next, Playwright + `next start` **3100** (auth, gardes, **responsive** `tests/e2e/responsive.spec.ts`) | `next start` 3100 (pas `next dev`, pour coexister avec le serveur 3000) | Test | Oui si Chromium Playwright est installé |
| `npm run test:all` | `check` + unitaires + intégration + E2E (sans lint) | Voir E2E | Test pour intégration/E2E | Campagne complète |
| `npm run build` | Build de production Next | Non | Utilise `DATABASE_URL` du shell / `.env` | Facultatif ; ne pas lancer avec un reset destructif |

Échec : code de sortie non nul. Relancer un fichier : `npx vitest run lib/feed-filters.test.ts`. Relancer un spec E2E : `npx playwright test tests/e2e/auth-guards.spec.ts`.

`npm run test:e2e` n’utilise **pas** le serveur `localhost:3000` de développement, pour éviter d’écrire dans `dev.db`.

Playwright installe Chromium via `npx playwright install chromium` (une fois par machine). Sans binaire, `test:e2e` est bloqué : le documenter dans `TEST-RESULTS.md`, ne pas inventer un succès.

Ne pas utiliser `next dev` pour l’E2E tant qu’une instance existe déjà (Next 16 refuse un second serveur). L’E2E utilise `next start` après `next build`.

## CI

`.github/workflows/test.yml` exécute `check`, unitaires, intégration, installation Chromium, puis E2E, avec `DATABASE_URL` pointant vers `prisma/test.db`. Aucun secret n’est requis.
