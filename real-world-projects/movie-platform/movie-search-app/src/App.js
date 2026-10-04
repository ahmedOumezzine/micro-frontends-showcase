import { useEffect, useState } from "react";
import { searchMovies } from "./services/api";

export default function MovieSearchApp({ onMovieSelected, onMovieSelect = () => {} }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  function selectMovie(movie) {
    if (onMovieSelected) onMovieSelected(movie);
    else onMovieSelect(movie);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setWarning("");
    setError("");
    setSource("");
  }

  useEffect(() => {
    const handle = setTimeout(async () => {
      const clean = query.trim();
      if (clean.length < 2) {
        setResults([]);
        setWarning("");
        setError("");
        setSource("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const result = await searchMovies(clean);
        setResults(result.data);
        setWarning(result.warning || "");
        setSource(result.source);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <section className="panel p-4 remote-frame">
      <h2 className="h4">Recherche</h2>
      <label htmlFor="movie-search" className="form-label">Titre de film</label>
      <div className="input-group mb-3">
        <input id="movie-search" className="form-control" value={query} onChange={(event) => setQuery(event.target.value.slice(0, 80))} placeholder="Ex: atlas, neon..." />
        <button className="btn btn-outline-secondary" type="button" onClick={clearSearch} aria-label="Effacer la recherche"><i className="bi bi-x-lg"></i></button>
      </div>
      {query.trim().length > 0 && query.trim().length < 2 ? <div className="alert alert-light border">Saisissez au moins 2 caracteres.</div> : null}
      {loading && <div className="alert alert-light border"><div className="spinner-border spinner-border-sm text-danger me-2"></div>Recherche en cours...</div>}
      {error && <div className="alert alert-danger">Recherche impossible: {error}</div>}
      {warning && <div className="alert alert-warning py-2">Fallback local: {warning}</div>}
      {source && !loading && <p className="small text-secondary">Source: <span className="badge text-bg-info">{source}</span></p>}
      {query.trim().length >= 2 && !loading && results.length === 0 && !error ? <div className="alert alert-light border">Aucun resultat pour cette recherche.</div> : null}
      <div className="list-group">
        {results.slice(0, 6).map((movie) => (
          <button className="list-group-item list-group-item-action focus-ring" key={movie.id} onClick={() => selectMovie(movie)}>
            <div className="d-flex gap-3">
              <img src={movie.posterUrl} className="poster-sm" alt={`Affiche de ${movie.title}`} />
              <div>
                <div className="fw-semibold">{movie.title}</div>
                <div className="small text-secondary">{movie.release_date || "Date inconnue"} · Note {movie.vote_average.toFixed(1)}</div>
                <div className="small">{movie.overview?.slice(0, 96) || "Resume indisponible."}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
