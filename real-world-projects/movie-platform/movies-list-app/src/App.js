import { useEffect, useMemo, useState } from "react";
import { getGenres, getPopularMovies } from "./services/api";

export default function MoviesListApp({ selectedMovieId, onMovieSelected, onMovieSelect = () => {}, onFavoriteToggle = () => {}, favorites = [] }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genreId, setGenreId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [source, setSource] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  async function load(pageValue = page, genreValue = genreId) {
    setLoading(true);
    setError("");
    try {
      const [genreResult, movieResult] = await Promise.all([getGenres(), getPopularMovies(pageValue, genreValue)]);
      setGenres(genreResult.data);
      setMovies(movieResult.data);
      setTotalPages(movieResult.totalPages || 1);
      setSource(movieResult.source);
      setWarning(movieResult.warning || genreResult.warning || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, genreId);
    setPage(1);
  }, [genreId]);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((genre) => [genre.id, genre.name])), [genres]);
  const visibleMovies = useMemo(() => {
    const sorted = [...movies];
    if (sortBy === "rating") sorted.sort((a, b) => b.vote_average - a.vote_average);
    if (sortBy === "date") sorted.sort((a, b) => String(b.release_date).localeCompare(String(a.release_date)));
    return sorted;
  }, [movies, sortBy]);

  function selectMovie(movie) {
    if (onMovieSelected) onMovieSelected(movie);
    else onMovieSelect(movie);
  }

  if (loading) {
    return <section className="panel p-4 remote-frame" aria-busy="true"><div className="spinner-border text-danger me-2"></div>Chargement des films...</section>;
  }

  if (error) {
    return <div className="alert alert-danger">Impossible de charger les films. {error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => load()}>Reessayer</button></div>;
  }

  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h4 mb-1">Films populaires</h2>
          <p className="text-secondary mb-0">Source: <span className="badge text-bg-info">{source}</span></p>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <div>
            <label htmlFor="genre-filter" className="form-label">Filtrer par genre</label>
            <select id="genre-filter" className="form-select" value={genreId} onChange={(event) => setGenreId(event.target.value)}>
              <option value="">Tous les genres</option>
              {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sort-filter" className="form-label">Trier</label>
            <select id="sort-filter" className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="popular">Popularite</option>
              <option value="rating">Meilleure note</option>
              <option value="date">Date recente</option>
            </select>
          </div>
        </div>
      </div>
      {warning && <div className="alert alert-warning py-2">API TMDB indisponible: {warning}. Donnees locales utilisees.</div>}
      {movies.length === 0 ? (
        <div className="alert alert-light border">Aucun film trouve pour ce filtre.</div>
      ) : (
        <div className="row g-3">
          {visibleMovies.map((movie) => {
            const isFavorite = favorites.some((item) => item.id === movie.id);
            return (
              <div className="col-sm-6 col-lg-4 col-xxl-3" key={movie.id}>
                <article className={`card h-100 ${selectedMovieId === movie.id ? "border-danger border-2" : ""}`}>
                  <img src={movie.posterUrl} className="poster card-img-top" alt={`Affiche de ${movie.title}`} />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between gap-2">
                      <h3 className="h6">{movie.title}</h3>
                      <span className="badge rating-pill"><i className="bi bi-star-fill me-1"></i>{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <p className="small text-secondary">{movie.release_date || "Date inconnue"}</p>
                    <p className="small flex-grow-1">{movie.overview || "Resume indisponible."}</p>
                    <div className="mb-3 d-flex flex-wrap gap-1">
                      {(movie.genre_ids || []).slice(0, 2).map((id) => <span className="badge text-bg-light" key={id}>{genreMap[id] || id}</span>)}
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-danger focus-ring" onClick={() => selectMovie(movie)}>Details</button>
                      <button className="btn btn-outline-danger focus-ring" onClick={() => onFavoriteToggle(movie)} aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}><i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`}></i></button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
      <nav className="d-flex justify-content-between align-items-center mt-3" aria-label="Pagination des films">
        <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => { const next = page - 1; setPage(next); load(next, genreId); }}><i className="bi bi-chevron-left"></i> Precedent</button>
        <span className="small text-secondary">Page {page} / {totalPages}</span>
        <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => { const next = page + 1; setPage(next); load(next, genreId); }}>Suivant <i className="bi bi-chevron-right"></i></button>
      </nav>
    </section>
  );
}
