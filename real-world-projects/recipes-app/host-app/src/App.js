import { lazy, Suspense, useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { F, P, load, loadFavorites, save } from "./services/storage";
import "./styles/app.css";

const RecipesList = lazy(() => import("recipesListApp/RecipesList"));
const RecipeDetails = lazy(() => import("recipeDetailsApp/RecipeDetails"));
const Favorites = lazy(() => import("favoritesApp/Favorites"));
const MealPlanner = lazy(() => import("mealPlannerApp/MealPlanner"));

export default function App() {
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [planning, setPlanning] = useState(() => load(P));
  useEffect(() => save(F, favorites), [favorites]);
  useEffect(() => save(P, planning), [planning]);
  function favorite(recipe) { setFavorites(items => items.some(item => item.id === recipe.id) ? items.filter(item => item.id !== recipe.id) : [recipe, ...items]); }
  const fallback = <div className="panel p-4"><div className="spinner-border text-success me-2"/>Chargement du module...</div>;
  return <div className="app-shell"><nav className="navbar navbar-expand-lg bg-success navbar-dark sticky-top"><div className="container-fluid"><a className="navbar-brand fw-bold" href="#top"><i className="bi bi-egg-fried me-2"/>Recipes App</a><button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#recipe-nav" aria-label="Menu"><span className="navbar-toggler-icon"/></button><div className="collapse navbar-collapse" id="recipe-nav"><ul className="navbar-nav me-auto"><li className="nav-item"><a className="nav-link" href="#recipes">Recettes</a></li><li className="nav-item"><a className="nav-link" href="#details">Details</a></li><li className="nav-item"><a className="nav-link" href="#favorites">Favoris <span className="badge text-bg-warning">{favorites.length}</span></a></li><li className="nav-item"><a className="nav-link" href="#planner">Planning</a></li></ul><span className="navbar-text">TheMealDB · cle de test gratuite</span></div></div></nav><main id="top" className="container-fluid py-4"><section className="panel p-4 mb-4 hero"><span className="badge text-bg-success mb-2">Micro-Frontend cuisine</span><h1 className="display-6 fw-bold">Cuisiner, sauvegarder et planifier</h1><p className="lead mb-0">Le Host centralise la recette selectionnee, les favoris et le planning hebdomadaire.</p></section><div className="row g-4"><div id="recipes" className="col-12"><ErrorBoundary><Suspense fallback={fallback}><RecipesList onRecipeSelected={setSelected} onFavoriteToggle={favorite} favorites={favorites}/></Suspense></ErrorBoundary></div><div id="details" className="col-xl-8"><ErrorBoundary><Suspense fallback={fallback}><RecipeDetails recipe={selected} onFavoriteToggle={favorite} isFavorite={favorites.some(item => item.id === selected?.id)} onAddToPlanner={recipe => setPlanning({...planning, Lundi: recipe})}/></Suspense></ErrorBoundary></div><div id="favorites" className="col-xl-4"><ErrorBoundary><Suspense fallback={fallback}><Favorites favorites={favorites} onRecipeSelected={setSelected} onFavoriteToggle={favorite}/></Suspense></ErrorBoundary></div><div id="planner" className="col-12"><ErrorBoundary><Suspense fallback={fallback}><MealPlanner planning={planning} onPlanningChange={setPlanning} selectedRecipe={selected}/></Suspense></ErrorBoundary></div></div></main><footer className="text-center text-secondary small border-top py-3">Recipes App · React · Bootstrap 5 · Module Federation</footer></div>;
}
