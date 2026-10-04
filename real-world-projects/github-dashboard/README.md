# GitHub Dashboard

## Présentation

Application Micro-Frontend React qui explore un profil GitHub, ses dépôts, les détails du dépôt sélectionné et son activité publique. Le Host orchestre quatre Remotes indépendants avec Webpack 5 Module Federation.

## Architecture

~~~mermaid
graph TD
  H[Host :9700] --> P[Profile :9701]
  H --> R[Repositories :9702]
  H --> D[Repository Details :9703]
  H --> A[Activity :9704]
  R -- callback sélection --> H
  H -- username/repository props --> P
  H -- username/repository props --> D
  H -- username props --> A
~~~

Le Host conserve username et selectedRepository. Les Remotes ne communiquent jamais entre eux : les dépôts remontent au Host via callback, puis le Host transmet la sélection au module de détail.

## API et résilience

L’application utilise l’API REST publique GitHub : profil, dépôts, détail, commits et événements publics. Un token personnel optionnel peut être fourni par GITHUB_TOKEN, mais il n’est jamais affiché ni versionné. Sans authentification, GitHub autorise généralement 60 requêtes par heure et un token personnel apporte généralement 5 000 requêtes par heure. Une réponse 403/429 est affichée clairement et l’interface bascule sur des données locales crédibles.

Chaque appel utilise AbortController, timeout, vérification response.ok, en-têtes GitHub recommandés et bouton de nouvelle tentative. Les états loading, empty, error et success sont présents dans les Remotes.

## Prérequis et installation

- Node.js 18+
- npm

~~~bash
npm install
npm run install:all
~~~

Copiez .env.example vers .env si vous souhaitez configurer un token. Les variables sont GITHUB_API_BASE_URL, GITHUB_API_TIMEOUT et GITHUB_TOKEN.

## Lancement et ports

~~~bash
npm run start:all
~~~

Host : http://localhost:9700/  
Profile : http://localhost:9701/  
Repositories : http://localhost:9702/  
Repository Details : http://localhost:9703/  
Activity : http://localhost:9704/

## Commandes

~~~bash
npm run build:all
~~~

Le build racine est séquentiel afin d’arrêter immédiatement en cas d’erreur. Les bundles remoteEntry.js sont produits par les quatre Remotes.

## Sécurité, accessibilité et dépannage

Bootstrap 5 et Bootstrap Icons fournissent la navigation, les cartes, badges, alertes, spinners, formulaires et pagination. Les liens externes utilisent noopener noreferrer, les saisies sont validées, React échappe les valeurs affichées et aucun dangerouslySetInnerHTML n’est utilisé. En cas de limite GitHub, attendez le renouvellement ou configurez un token local. Les fallbacks permettent de démontrer l’interface sans réseau.

## Captures et checklist

Ajouter des captures du profil, de la liste paginée, du détail d’un dépôt et de l’état de limite API.

- [x] Host et quatre Remotes indépendants
- [x] React 18, Bootstrap 5, Module Federation
- [x] Loading, empty, error, retry et fallback
- [x] .env.example et token ignoré
- [x] Build indépendant de chaque application

## Pourquoi ce projet est utile comme référence Micro-Frontend

Il démontre l’orchestration d’un Host, la communication par props/callbacks, l’état partagé minimal, l’indépendance des Remotes, la gestion d’une API publique limitée, la résilience réseau, le lazy loading avec React.lazy/Suspense, une UX Bootstrap cohérente et le build indépendant de chaque module.
