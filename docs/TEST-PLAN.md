# Plan de test — KnifeHub

Priorité : P0 parcours critique / données / auth · P1 métier important · P2 confort.

Les scénarios **Automatisé** doivent exister sous forme de fichier de test. **Manuel** : à exécuter dans le navigateur (dev, base `dev.db`).

| ID | F | Objectif | Type | Auto | Prio |
| --- | --- | --- | --- | --- | --- |
| TEST-F001-01 | F-001 | Création de compte si e-mail inconnu | E2E | oui | P0 |
| TEST-F002-01 | F-002 | Connexion e-mail valide | E2E | oui | P0 |
| TEST-F002-02 | F-002 | E-mail sans `@` refusé (validation HTML `type=email` ; garde-fou serveur `includes('@')` si le navigateur est contourné) | E2E | oui | P0 |
| TEST-F002-03 | F-002 | Déjà connecté → redirection | E2E | oui | P1 |
| TEST-F002-04 | F-002 | Admin bootstrap → `/admin` | Manuel | non | P1 |
| TEST-F003-01 | F-003 | Déconnexion | E2E | oui | P1 |
| TEST-F004-01 | F-004 | Pages protégées sans cookie | E2E | oui | P0 |
| TEST-F005-01 | F-005 | Fil avec au moins un couteau | E2E | oui | P0 |
| TEST-F005-02 | F-005 | Fil vide (données) | Intégration | partiel | P2 |
| TEST-F006-01 | F-006 | Filtre texte sur nom | Unitaire | oui | P0 |
| TEST-F006-02 | F-006 | Filtre artisan | Unitaire | oui | P0 |
| TEST-F006-03 | F-006 | Filtre matériau | Unitaire | oui | P1 |
| TEST-F006-04 | F-006 | Querystring `q` + `artisan` | Unitaire | oui | P1 |
| TEST-F007-01 | F-007 | Artisan sans couteau absent de l’annuaire | Intégration | oui | P1 |
| TEST-F008-01 | F-008 | Liens profil http(s) | Unitaire | oui | P1 |
| TEST-F008-02 | F-008 | 404 artisan inconnu | E2E | oui | P2 |
| TEST-F009-01 | F-009 | Prix en centimes → EUR | Unitaire | oui | P0 |
| TEST-F009-02 | F-009 | 404 couteau inconnu | E2E | oui | P2 |
| TEST-F010-01 | F-010 | Nom affiché requis | Unitaire | oui | P0 |
| TEST-F010-02 | F-010 | Champs optionnels | Unitaire | oui | P1 |
| TEST-F010-03 | F-010 | Doublon PENDING (règle API) | Intégration | oui | P0 |
| TEST-F010-04 | F-010 | Non authentifié 401 | Manuel / futur API | non | P0 |
| TEST-F011-01 | F-011 | `parseRequestId` JSON invalide | Unitaire | oui | P0 |
| TEST-F011-02 | F-011 | Approuver crée/maj le profil | Intégration | oui | P0 |
| TEST-F011-03 | F-011 | Refuser une PENDING | Intégration | oui | P0 |
| TEST-F011-04 | F-011 | Refus si déjà traitée | Intégration | oui | P1 |
| TEST-F011-05 | F-011 | Non admin redirigé | E2E | oui | P0 |
| TEST-F012-01 | F-012 | Prix et statut par défaut | Unitaire | oui | P0 |
| TEST-F012-02 | F-012 | Création Prisma liée au profil | Intégration | oui | P0 |
| TEST-F013-01 | F-013 | Update propriétaire | Intégration | oui | P0 |
| TEST-F013-02 | F-013 | Autre artisan ne voit pas l’édition (404) | E2E | partiel | P1 |
| TEST-F014-01 | F-014 | Payload JSON images | Unitaire | oui | P0 |
| TEST-F014-02 | F-014 | Max 5 + couverture unique | Unitaire | oui | P0 |
| TEST-F014-03 | F-014 | JSON cassé → [] | Unitaire | oui | P1 |
| TEST-F015-01 | F-015 | Type MIME refusé | Unitaire | oui | P0 |
| TEST-F015-02 | F-015 | Fichier trop volumineux | Unitaire | oui | P1 |
| TEST-F016-01 | F-016 | Champ vide → null | Unitaire | oui | P0 |
| TEST-F016-02 | F-016 | Mise à jour Prisma | Intégration | oui | P0 |
| TEST-F017-01 | F-017 | Dossiers upload `knives`/`profiles` | Unitaire | oui | P2 |
| TEST-F018-01 | F-018 | Header KnifeHub + Fil | E2E | oui | P1 |
| TEST-F019-01 | F-019 | `isBootstrapAdmin` | Unitaire | oui | P0 |
| TEST-F019-02 | F-019 | `/profile` anonyme → login | E2E | oui | P0 |
| TEST-F021-01 | F-021 | E-mail bootstrap reconnu | Unitaire | oui | P1 |
| TEST-SEC-01 | F-002, F-015 | Upload anonyme | Manuel | non | P0 |
| TEST-SEC-02 | F-002 | Auth sans mot de passe | Manuel | non | P0 |
| TEST-DB-01 | tech | Scripts de test refusent `dev.db` | Unitaire/script | oui | P0 |

## Détails P0 (extraits)

### TEST-F006-01

- **Prérequis** : aucun.
- **Données** : couteau nom « Gyuto », autre « Hunter ».
- **Étapes** : `filterKnives` avec `query=gyuto`.
- **Attendu** : seul Gyuto.
- **Fichier** : `lib/feed-filters.test.ts`.

### TEST-F010-03

- **Prérequis** : `prisma/test.db`.
- **Étapes** : USER + une `ArtisanRequest` PENDING ; tenter d’en créer une seconde PENDING (même règle que l’API : recherche existante).
- **Attendu** : la couche test reproduit le garde-fou (count PENDING = 1 si on applique la même condition).
- **Fichier** : `tests/integration/artisan-request.test.ts`.

### TEST-F011-02

- **Étapes** : USER + PENDING ; appliquer la même transaction que la route approve.
- **Attendu** : rôle ARTISAN, profil `displayName` recopié.
- **Limite** : n’appelle pas HTTP (pas de cookies Next) ; couvre la règle métier Prisma.

### TEST-F015-01

- **Étapes** : `persistImageFile` avec `type: text/plain`.
- **Attendu** : exception « Type de fichier non pris en charge ».
- **Pas d’écriture disque**.

### TEST-DB-01

- **Étapes** : `isForbiddenDevDatabaseUrl('file:./dev.db')` vrai ; URL `test.db` faux.
- **Fichier** : `lib/test-database-guard.test.ts` (helper `lib/test-database-guard.ts` utilisé par le script).

## Non couvert (lacunes assumées)

- Vrai POST `/api/upload` avec session cookie (besoin de mock Next cookies).
- Concurrence deux onglets.
- CSRF au-delà de sameSite.
- Accessibilité, perf, mobile.
- Hydratation SearchBar (manuel jusqu’à correction F-006).
- Suppression de couteau (fonctionnalité absente).

## Campagne complète

Voir [TESTING.md](./TESTING.md) : `npm run test:all`.
