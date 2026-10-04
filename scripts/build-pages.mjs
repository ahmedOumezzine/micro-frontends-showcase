import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "site");
const projects = [
  { name: "world-dashboard", remotes: ["countries-app", "weather-app", "country-details-app", "statistics-app"] },
  { name: "movie-platform", remotes: ["movies-list-app", "movie-details-app", "movie-search-app", "favorites-app"] },
  { name: "news-portal", remotes: ["headlines-app", "news-details-app", "categories-app", "bookmarks-app"] },
  { name: "fake-amazon", remotes: ["products-app", "product-details-app", "cart-app", "checkout-app"] },
  { name: "recipes-app", remotes: ["recipes-list-app", "recipe-details-app", "favorites-app", "meal-planner-app"] },
  { name: "travel-dashboard", remotes: ["destinations-app", "weather-app", "currency-app", "trip-planner-app"] },
  { name: "github-dashboard", remotes: ["profile-app", "repositories-app", "repository-details-app", "activity-app"] },
  { name: "task-manager", remotes: ["tasks-app", "task-details-app", "activity-app"] },
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

  links.push(`<li><a href="./${project.name}/">${project.name}</a></li>`);
}

await writeFile(path.join(output, "index.html"), `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Micro Frontends Showcase</title></head>
  <body><main><h1>Micro Frontends Showcase</h1><p>Applications React et Webpack Module Federation.</p><ul>${links.join("")}</ul></main></body>
</html>`);
