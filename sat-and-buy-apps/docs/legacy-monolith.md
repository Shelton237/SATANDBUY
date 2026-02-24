# Monolithe SAT & BUY (archive)

Le backend historique (`SAT-AND-BUY-BACKEND`) a été déplacé dans `archive/SAT-AND-BUY-BACKEND`. Il n’est plus démarré par Docker Compose ni référencé par l’API Gateway.

Pourquoi le conserver ?

- consultation ponctuelle des anciennes routes ou scripts de migration ;
- audit des implémentations initiales avant portage dans les packages `@satandbuy/*-domain`.

Bonnes pratiques :

- ne pas réintroduire ce code dans les services ; préférer les packages partagés ;
- si une fonctionnalité manque encore côté microservices, créer un package de domaine dédié plutôt que de « copier-coller » depuis l’archive ;
- supprimer l’archive lorsqu’elle ne sert plus qu’à l’historique (ou la déplacer dans un dépôt séparé).

Les nouvelles stacks locales/CI/CD n’ont besoin que des services listés dans `services/` plus l’API Gateway – aucune variable d’environnement ne pointe vers l’ancien monolithe.
