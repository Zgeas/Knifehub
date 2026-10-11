# Documentation KnifeHub

Fichiers de travail durables. Ils ne remplacent pas le code : ils décrivent ce que l’application doit faire et comment le vérifier.

| Fichier | Rôle |
| --- | --- |
| [FEATURES.md](./FEATURES.md) | Référentiel des fonctionnalités (identifiants stables, statuts, règles). |
| [TEST-PLAN.md](./TEST-PLAN.md) | Scénarios de test liés aux fonctionnalités. |
| [TEST-RESULTS.md](./TEST-RESULTS.md) | Dernier bilan d’exécution réel. |
| [TESTING.md](./TESTING.md) | Commandes, isolation de la base, CI. |
| [../.cursor/rules/knifehub-features-and-tests.mdc](../.cursor/rules/knifehub-features-and-tests.mdc) | Règle Cursor : maintenir docs et tests à chaque tâche. |
| [../AGENTS.md](../AGENTS.md) | Point d’entrée agent (Next.js + liens vers ce dossier). |

Au début d’une session : lire `AGENTS.md`, puis les entrées concernées dans `FEATURES.md` et `TEST-PLAN.md` avant de modifier le code.
