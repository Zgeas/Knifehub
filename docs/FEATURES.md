# Référentiel des fonctionnalités — KnifeHub

Identifiants stables (`F-xxx`). Ne pas réattribuer un identifiant retiré.

**Légende des statuts** : `PLANNED` · `IN_PROGRESS` · `IMPLEMENTED_UNVERIFIED` · `TESTED` · `BLOCKED` · `NEEDS_REVIEW`

**Sources** : code dans le dépôt (confirmé) vs schéma sans UI (partiel) vs idée non validée.

Les statuts `TESTED` ci-dessous ne s’appliquent qu’après exécution réelle des tests listés ; voir [TEST-RESULTS.md](./TEST-RESULTS.md).

## Synthèse

| ID | Nom | État | Périmètre de validation |
| --- | --- | --- | --- |
| F-001 | Compte à la connexion | TESTED | E2E session USER ; pas de lecture SQL du user |
| F-002 | Connexion e-mail | TESTED | E2E ; e-mail invalide = HTML5 ; pas de mot de passe |
| F-003 | Déconnexion | TESTED | E2E |
| F-004 | Session cookie | TESTED | Gardes `/profile` et `/admin` anonymes |
| F-005 | Fil public | TESTED | E2E titre du couteau seed |
| F-006 | Recherche et filtres du fil | NEEDS_REVIEW | Unitaires OK ; hydratation SearchBar / ESLint |
| F-007 | Annuaire artisans | TESTED | Intégration Prisma `knives: { some }` ; pas E2E page |
| F-008 | Page artisan publique | TESTED | E2E 404 ; liens unitaires |
| F-009 | Fiche couteau | TESTED | E2E 404 ; prix unitaire |
| F-010 | Candidature artisan | TESTED | Parseurs + garde PENDING Prisma ; pas HTTP API |
| F-011 | Modération candidatures | TESTED | Parse JSON + transaction Prisma + E2E garde admin |
| F-012 | Création couteau | TESTED | Champs unitaires + create Prisma |
| F-013 | Édition couteau | TESTED | Update Prisma ; 404 autre propriétaire non E2E |
| F-014 | Images de couteau | TESTED | Parseurs unitaires |
| F-015 | Upload fichiers | TESTED | MIME/taille unitaires ; pas POST `/api/upload` |
| F-016 | Édition profil artisan | TESTED | Parse null + update Prisma ; pas E2E formulaire |
| F-017 | Photo de profil | IMPLEMENTED_UNVERIFIED | Dossiers upload seulement |
| F-018 | Navigation | TESTED | E2E liens KnifeHub / Fil |
| F-019 | Rôles et garde-fous | TESTED | Bootstrap unitaire + redirections E2E |
| F-020 | Suivi (Follow) | PLANNED | Schéma uniquement |
| F-021 | Promotion admin bootstrap | TESTED | Unitaire `isBootstrapAdmin` |

Idées **non validées** (pas d’exigence) : favoris, notifications, mot de passe, ateliers distincts des profils artisans.

---

### F-001 — Compte créé à la connexion

- **Objectif** : un visiteur obtient un compte en saisissant un e-mail.
- **Comportement attendu** : e-mail normalisé (trim, minuscule). S’il n’existe pas, `User` créé avec rôle `USER`, sauf e-mail bootstrap admin → `ADMIN`.
- **Observé** : E2E 2026-10-11 — connexion `e2e-user@knifehub.test` affiche « Devenir artisan » (rôle USER).
- **Validation** : présence de `@` côté action login ; pas de format RFC complet.
- **Permissions** : public.
- **Erreurs** : e-mail invalide → `/login?error=invalid-email`.
- **Dépendances** : F-002, F-004, F-019, F-021.
- **Code** : `app/login/actions.ts`, `lib/auth.ts`, modèle `User`.
- **Tests** : TEST-F001-01, TEST-F002-02.

### F-002 — Connexion par e-mail

- **Objectif** : ouvrir une session.
- **Attendu** : formulaire `/login` ; utilisateur déjà connecté redirigé (`/` ou `/admin` si admin). Cookie posé. Admin bootstrap → `/admin`.
- **Règles** : pas de mot de passe, pas de vérification d’e-mail. **Risque de sécurité connu** : quiconque connaît un e-mail peut usurper le compte.
- **Permissions** : public ; page masquée si déjà connecté.
- **Code** : `app/login/page.tsx`, `loginWithEmail`.
- **Tests** : TEST-F002-01 à TEST-F002-04.

### F-003 — Déconnexion

- **Attendu** : bouton « Déconnexion » supprime le cookie et redirige vers `/`.
- **Code** : `logout` dans `app/login/actions.ts`, `Navbar`.
- **Tests** : TEST-F003-01.

### F-004 — Session

- **Attendu** : cookie `userId`, `httpOnly`, `sameSite=lax`, 30 jours. Utilisateur introuvable → traité comme déconnecté (`getCurrentUser` retourne null).
- **Limite** : pas de rotation, pas de CSRF token dédié (sameSite lax).
- **Tests** : TEST-F004-01 (manuel / E2E garde).

### F-005 — Fil public

- **Attendu** : `/` liste les couteaux récents avec artisan, galerie, prix, statut. Vide : message dédié.
- **Permissions** : public.
- **Code** : `app/page.tsx`, `FeedPost`, `FeedExplorer`.
- **Tests** : TEST-F005-01, TEST-F005-02.

### F-006 — Recherche et filtres

- **Attendu** : query `q`, artisans `artisan`, matériaux (noms de champs Prisma) en querystring. Filtrage côté serveur après chargement de tous les couteaux. SearchBar met à jour l’URL (debounce 300 ms) ; hors `/` la recherche navigue vers `/` avec `q`.
- **Problème connu** : overlay Next « hydration » sur `SearchBar` (branche client / `searchParams`). Statut `NEEDS_REVIEW`.
- **Code** : `lib/feed-filters.ts`, `components/SearchBar.tsx`, `FeedExplorer`.
- **Tests** : TEST-F006-01 à TEST-F006-04 (unitaires prioritaires).

### F-007 — Annuaire artisans

- **Attendu** : `/artisans` liste les profils ayant **au moins un couteau**, cartes avec avatar ou initiale.
- **Limite** : artisan sans publication invisible ici.
- **Code** : `app/artisans/page.tsx`, `MakerCard`.
- **Tests** : TEST-F007-01.

### F-008 — Profil artisan public

- **Attendu** : `/artisan/[id]` : photo, bio, liens, adresse, SIRET, créations. Bouton « Modifier le profil » seulement pour le propriétaire connecté.
- **404** si id inconnu.
- **Code** : `app/artisan/[id]/page.tsx`.
- **Tests** : TEST-F008-01, TEST-F008-02.

### F-009 — Fiche couteau

- **Attendu** : `/knives/[id]` galerie, specs matériaux, prix EUR, statut, lien artisan. « Modifier » si `user.artisanProfile.id === knife.artisanProfileId`.
- **Code** : `app/knives/[id]/page.tsx`.
- **Tests** : TEST-F009-01, TEST-F009-02.

### F-010 — Candidature artisan

- **Attendu** : USER connecté, `/become-artisan`. POST `/api/artisan-request` : nom affiché obligatoire ; refus si déjà ARTISAN/ADMIN, si demande PENDING. GET retourne le dernier statut. UI : pending / approved / rejected / déjà artisan.
- **Permissions** : connecté ; rôle USER pour soumettre.
- **Code** : `BecomeArtisanForm`, `app/api/artisan-request/route.ts`.
- **Tests** : TEST-F010-01 à TEST-F010-04.

### F-011 — Modération admin

- **Attendu** : `/admin` layout : non connecté → login, non ADMIN → `/`. Liste PENDING ou toutes. Approuver : rôle ARTISAN + upsert `ArtisanProfile`. Refuser : statut REJECTED. Uniquement si PENDING.
- **API** : POST `/api/admin/artisan-request/approve|reject` JSON `{ requestId }` ; 401/403 sinon.
- **Code** : `app/admin/*`, `lib/admin-api.ts`.
- **Tests** : TEST-F011-01 à TEST-F011-05.

### F-012 — Création de couteau

- **Attendu** : ARTISAN/ADMIN **avec** profil, `/knives/new`. Nom obligatoire. Prix saisi en euros, stocké en centimes. Lié au profil.
- **USER** → `/become-artisan`.
- **Code** : `app/knives/new/*`, `buildKnifeFields`.
- **Tests** : TEST-F012-01, TEST-F012-02.

### F-013 — Édition / propriété du couteau

- **Attendu** : même formulaire ; 404 si autre artisan. Pas de suppression dans l’UI.
- **Tests** : TEST-F013-01, TEST-F013-02.

### F-014 — Images de couteau

- **Attendu** : jusqu’à 5 images, une couverture, ordre, angle/focus optionnels, payload JSON `imagesPayload`. Payload invalide → liste vide (pas d’erreur utilisateur explicite).
- **Code** : `lib/knife-images.ts`, `ImageUploader`, `syncKnifeImages`.
- **Tests** : TEST-F014-01 à TEST-F014-03.

### F-015 — Upload

- **Attendu** : POST `/api/upload` multipart `file` + `folder` `knives`|`profiles`. JPEG/PNG/WebP/GIF, max 5 Mo. `knives` : artisan avec profil, pas USER. `profiles` : tout utilisateur connecté. Fichiers dans `public/uploads/...`.
- **Non connecté** : 401.
- **Tests** : TEST-F015-01, TEST-F015-02 (fichier invalide unitaire via `persistImageFile`).

### F-016 — Édition du profil artisan

- **Attendu** : `/profile`, `requireArtisanProfile`. Champs optionnels vidés → `null`. Redirection vers page publique.
- **Tests** : TEST-F016-01, TEST-F016-02.

### F-017 — Photo de profil

- **Attendu** : upload ou URL (y compris chemin `/uploads/...`), aperçu, suppression. Affichage fil, annuaire, page artisan.
- **Tests** : TEST-F017-01.

### F-018 — Navigation

- **Attendu** : header sticky. Liens Fil, Artisans, recherche. Connexion / e-mail + déconnexion. USER : Devenir artisan. Artisan+profil : Mon profil, Ajouter un couteau. ADMIN : Admin.
- **Tests** : TEST-F018-01.

### F-019 — Rôles

- **Attendu** : USER, ARTISAN, ADMIN. `requireArtisanProfile` : USER ou sans profil → become-artisan. Admin layout + API.
- **Tests** : TEST-F019-01 (unitaires bootstrap), TEST-F019-02 (E2E gardes).

### F-020 — Follow

- **État** : `PLANNED` (table Prisma uniquement, seed efface les follows). Aucune page, API ou bouton.
- **Ne pas traiter comme livré.**

### F-021 — Bootstrap admin

- **Attendu** : e-mails listés dans `BOOTSTRAP_ADMIN_EMAILS` obtiennent le rôle ADMIN à la création ou à la connexion si le rôle n’est pas déjà ADMIN.
- **Limite** : adresses en clair dans le dépôt.
- **Tests** : TEST-F021-01.

## Données (confirmé)

`User` 1—0..1 `ArtisanProfile` 1—* `Knife` 1—* `KnifeImage`. `ArtisanRequest` *—1 `User`. `Follow` *—* `User` (inutilisé en UI).

## Technique

Auth cookie ; images URLs en base ; Prisma SQLite ; pas de suite de tests historique avant cette mise en place.
