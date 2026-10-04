# Task Manager

## Présentation

Application de productivité Micro-Frontend avec un Host et trois Remotes : liste filtrable des tâches, détail de la tâche sélectionnée et activité récente. JSONPlaceholder est utilisé comme API publique sans clé ; des données locales prennent le relais si l’API ou le réseau est indisponible.

~~~mermaid
graph TD
 H[Host :9800] --> T[Tasks :9801]
 H --> D[Task Details :9802]
 H --> A[Activity :9803]
 T -- callback tâche --> H
 H -- task prop --> D
~~~

## Installation et lancement

~~~bash
npm install
npm run install:all
npm run start:all
~~~

Host : http://localhost:9800/  
Tasks : http://localhost:9801/  
Task Details : http://localhost:9802/  
Activity : http://localhost:9803/

## Architecture et résilience

Le Host conserve uniquement la tâche sélectionnée et le filtre global. Les Remotes restent indépendants et communiquent par props/callbacks. Chaque appel utilise un timeout AbortController, gère les erreurs HTTP et affiche un fallback local. React.lazy et Suspense assurent le chargement distant.

## Build et dépannage

~~~bash
npm run build:all
~~~

Si un Remote ne s’affiche pas, vérifier son port et son fichier remoteEntry.js. Les données locales permettent de démontrer la recherche, les statuts et le détail sans JSONPlaceholder.

## Pourquoi ce projet est utile comme référence Micro-Frontend

Il montre une orchestration simple, une sélection partagée, des Remotes autonomes, une API REST sans clé, des états loading/empty/error/success, une UX Bootstrap responsive et des builds indépendants.
