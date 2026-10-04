import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoadingPanel from "./components/LoadingPanel";
import { getMovieDetails, loadFavorites, saveFavorites } from "./services/api";

const MoviesListApp = lazy(() => import("moviesListApp/MoviesList"));
const MovieDetailsApp = lazy(() => import("movieDetailsApp/MovieDetails"));
const MovieSearchApp = lazy(() => import("movieSearchApp/MovieSearch"));
const FavoritesApp = lazy(() => import("favoritesApp/Favorites"));

export default function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(101);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    getMovieDetails(selectedMovieId).then((result) => setSelectedMovie(result.data));
  }, [selectedMovieId]);

  async function selectMovie(movieOrId) {
    const movie = typeof movieOrId === "object" ? movieOrId : (await getMovieDetails(movieOrId)).data;
    setSelectedMovieId(movie.id);
    setSelectedMovie(movie);
    setToast(`${movie.title} selectionne`);
  }

  function toggleFavorite(movie) {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === movie.id);
      const next = exists ? current.filter((item) => item.id !== movie.id) : [{ id: movie.id, title: movie.title, posterUrl: movie.posterUrl, vote_average: movie.vote_average, release_date: movie.release_date }, ...current];
      setToast(exists ? "Favori retire" : "Favori ajoute");
      return next;
    });
  }

  function removeFavorite(id) {
    setFavorites((current) => current.filter((item) => item.id !== id));
    setToast("Favori supprime");
  }

  function addFavorite(movie) {
    setFavorites((current) => current.some((item) => item.id === movie.id) ? current : [{ id: movie.id, title: movie.title, posterUrl: movie.posterUrl, vote_average: movie.vote_average, release_date: movie.release_date }, ...current]);
    setToast("Favori ajoute");
  }

  function clearFavorites() {
    setFavorites([]);
    setToast("Tous les favoris ont ete supprimes");
  }

  const selectedTitle = useMemo(() => selectedMovie?.title || "Chargement...", [selectedMovie]);

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#top"><i className="bi bi-film me-2 text-danger"></i>Movie Platform</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#movieNav" aria-controls="movieNav" aria-expanded="false" aria-label="Basculer la navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="movieNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="#movies">Films</a></li>
              <li className="nav-item"><a className="nav-link" href="#search">Recherche</a></li>
              <li className="nav-item"><a className="nav-link" href="#details">Details</a></li>
              <li className="nav-item"><a className="nav-link" href="#favorites">Favoris <span className="badge text-bg-danger">{favorites.length}</span></a></li>
            </ul>
            <span className="navbar-text text-secondary">Selection : {selectedTitle}</span>
          </div>
        </div>
      </nav>

      <main id="top" className="container-fluid py-4">
        <section className="row g-3 align-items-stretch mb-4">
          <div className="col-lg-8">
            <div className="panel p-4 h-100">
              <span className="badge text-bg-danger mb-2">Micro-Frontend cinema</span>
              <h1 className="display-6 fw-bold">Films, recherche et favoris avec Module Federation</h1>
              <p className="lead mb-0">Le Host centralise le film selectionne et les favoris. Les Remotes communiquent uniquement par props et callbacks.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="panel p-4 h-100">
              <div className="text-secondary">Film courant</div>
              <h2 className="h4">{selectedTitle}</h2>
              <button className="btn btn-outline-danger" disabled={!selectedMovie} onClick={() => selectedMovie && toggleFavorite(selectedMovie)}>
                <i className={`bi ${favorites.some((item) => item.id === selectedMovie?.id) ? "bi-heart-fill" : "bi-heart"} me-2`}></i>
                {favorites.some((item) => item.id === selectedMovie?.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              </button>
            </div>
          </div>
        </section>

        <div className="row g-4">
          <div id="search" className="col-xl-4">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Movie Search App" />}><MovieSearchApp onMovieSelected={selectMovie} onMovieSelect={selectMovie} /></Suspense></ErrorBoundary>
          </div>
          <div id="details" className="col-xl-8">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Movie Details App" />}><MovieDetailsApp movieId={selectedMovieId} movie={selectedMovie} favorites={favorites} onAddFavorite={addFavorite} onRemoveFavorite={removeFavorite} onFavoriteToggle={toggleFavorite} isFavorite={favorites.some((item) => item.id === selectedMovieId)} /></Suspense></ErrorBoundary>
          </div>
          <div id="movies" className="col-12">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Movies List App" />}><MoviesListApp selectedMovieId={selectedMovieId} onMovieSelected={selectMovie} onMovieSelect={selectMovie} onFavoriteToggle={toggleFavorite} favorites={favorites} /></Suspense></ErrorBoundary>
          </div>
          <div id="favorites" className="col-12">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Favorites App" />}><FavoritesApp favorites={favorites} onMovieSelected={selectMovie} onMovieSelect={selectMovie} onRemoveFavorite={removeFavorite} onClearFavorites={clearFavorites} /></Suspense></ErrorBoundary>
          </div>
        </div>
      </main>

      <footer className="border-top py-3 text-center text-secondary small">
        Movie Platform - Micro-Frontend reference built with React, Bootstrap and Webpack Module Federation.
      </footer>

      {toast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show" role="status" aria-live="polite">
            <div className="toast-header"><strong className="me-auto">Movie Platform</strong><button type="button" className="btn-close" onClick={() => setToast("")} aria-label="Fermer"></button></div>
            <div className="toast-body">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
