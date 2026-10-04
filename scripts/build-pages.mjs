import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "site");
const projects = [
  { name: "world-dashboard", title: "World Dashboard", description: "Pays, météo, détails et statistiques mondiales.", api: "REST Countries, Open-Meteo", remotes: ["countries-app", "weather-app", "country-details-app", "statistics-app"] },
  { name: "movie-platform", title: "Movie Platform", description: "Films populaires, recherche, détails et favoris.", api: "TMDB avec fallback local", remotes: ["movies-list-app", "movie-details-app", "movie-search-app", "favorites-app"] },
  { name: "news-portal", title: "News Portal", description: "Actualités, catégories, détails et favoris.", api: "Hacker News Algolia", remotes: ["headlines-app", "news-details-app", "categories-app", "bookmarks-app"] },
  { name: "fake-amazon", title: "Fake Amazon", description: "Catalogue, panier et parcours de commande simulé.", api: "DummyJSON Products", remotes: ["products-app", "product-details-app", "cart-app", "checkout-app"] },
  { name: "recipes-app", title: "Recipes App", description: "Recettes, favoris et planning hebdomadaire.", api: "TheMealDB", remotes: ["recipes-list-app", "recipe-details-app", "favorites-app", "meal-planner-app"] },
  { name: "travel-dashboard", title: "Travel Dashboard", description: "Destinations, météo, devises et préparation de voyage.", api: "REST Countries, Open-Meteo", remotes: ["destinations-app", "weather-app", "currency-app", "trip-planner-app"] },
  { name: "github-dashboard", title: "GitHub Dashboard", description: "Profils, dépôts, détails et activité GitHub.", api: "GitHub REST API", remotes: ["profile-app", "repositories-app", "repository-details-app", "activity-app"] },
  { name: "task-manager", title: "Task Manager", description: "Tâches filtrables, détails et activité récente.", api: "JSONPlaceholder", remotes: ["tasks-app", "task-details-app", "activity-app"] },
];

async function collectJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectJavaScript(entryPath));
    else if (entry.name.endsWith(".js")) files.push(entryPath);
  }
  return files;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");

const links = [];
for (const project of projects) {
  const projectRoot = path.join(root, "real-world-projects", project.name);
  const hostSource = path.join(projectRoot, "host-app", "dist");
  const projectOutput = path.join(output, project.name);
  await cp(hostSource, projectOutput, { recursive: true });

  const remoteByPort = new Map();
  for (const remote of project.remotes) {
    const remoteSource = path.join(projectRoot, remote, "dist");
    await cp(remoteSource, path.join(projectOutput, remote), { recursive: true });
  }

  const hostConfig = await readFile(path.join(projectRoot, "host-app", "webpack.config.js"), "utf8");
  const ports = [...hostConfig.matchAll(/localhost:(\d+)\/remoteEntry\.js/g)].map((match) => match[1]);
  ports.forEach((port, index) => remoteByPort.set(port, project.remotes[index]));

  for (const file of await collectJavaScript(projectOutput)) {
    if (file.includes(`${path.sep}host-app${path.sep}`)) continue;
    let content = await readFile(file, "utf8");
    for (const [port, remote] of remoteByPort) {
      content = content.replaceAll(`http://localhost:${port}/remoteEntry.js`, `./${remote}/remoteEntry.js`);
    }
    await writeFile(file, content);
  }

  links.push(`<article class="project-card"><span class="project-number">${String(links.length + 1).padStart(2, "0")}</span><h2>${project.title}</h2><p>${project.description}</p><small>${project.api}</small><a class="project-link" href="./${project.name}/">Ouvrir le projet <span aria-hidden="true">&#8594;</span></a></article>`);
}

await writeFile(path.join(output, "index.html"), `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Collection de projets React Micro-Frontend avec Webpack Module Federation."><title>Micro Frontends Showcase</title><style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17324d;background:#f3f7fb}*{box-sizing:border-box}body{margin:0}main{max-width:1180px;margin:0 auto;padding:64px 24px 72px}.eyebrow{color:#087f8c;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(2.3rem,5vw,4.8rem);line-height:1.02;max-width:780px;margin:12px 0 16px}header p{color:#537087;font-size:1.1rem;max-width:650px;margin:0}.projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin-top:46px}.project-card{position:relative;display:flex;min-height:255px;flex-direction:column;border:1px solid #d7e3ec;border-radius:12px;background:#fff;padding:24px;box-shadow:0 12px 28px rgba(26,65,92,.08)}.project-number{color:#087f8c;font-size:.8rem;font-weight:800}.project-card h2{font-size:1.35rem;margin:28px 0 10px}.project-card p{color:#537087;line-height:1.55;margin:0 0 16px}.project-card small{color:#6d8190;margin-top:auto}.project-link{display:inline-flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;color:#087f8c;font-weight:800;text-decoration:none}.project-link:hover,.project-link:focus-visible{text-decoration:underline}.project-link:focus-visible{outline:3px solid #f4b942;outline-offset:4px;border-radius:4px}@media(max-width:600px){main{padding:40px 18px 52px}.projects{margin-top:32px}}
  </style></head>
  <body><main><header><div class="eyebrow">React · Webpack 5 · Module Federation</div><h1>Micro Frontends Showcase</h1><p>Une collection de projets indépendants qui explorent l’orchestration, les APIs publiques, l’état partagé et la résilience frontend.</p></header><section class="projects" aria-label="Projets disponibles">${links.join("")}</section></main></body>
</html>`);
