import { useEffect, useState } from "react";
import { getMovieDetails } from "./services/api";

export default function MovieDetailsApp({ movieId = 101, movie: selectedMovie = null, favorites = [], onAddFavorite, onRemoveFavorite, onFavoriteToggle = () => {}, isFavorite = false }) {
  const [state, setState] = useState({ loading: true, movie: null, error: "", source: "", warning: "" });

  async function load() {
    setState({ loading: true, movie: null, error: "", source: "", warning: "" });
    try {
      const result = await getMovieDetails(selectedMovie || movieId);
      setState({ loading: false, movie: result.data, error: "", source: result.source, warning: result.warning || "" });
    } catch (error) {
      setState({ loading: false, movie: null, error: error.message, source: "", warning: "" });
    }
  }

  useEffect(() => {
    load();
  }, [movieId, selectedMovie?.id]);

  if (state.loading) return <section className="panel p-4 remote-frame" aria-busy="true"><div className="spinner-border text-danger me-2"></div>Chargement des details...</section>;
  if (state.error) return <div className="alert alert-danger">Details indisponibles: {state.error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={load}>Reessayer</button></div>;

  const movie = state.movie;
  const rating = Number(movie.vote_average || 0);
  const favorite = isFavorite || favorites.some((item) => item.id === movie.id);

  function handleFavorite() {
    if (favorite && onRemoveFavorite) onRemoveFavorite(movie.id);
    else if (!favorite && onAddFavorite) onAddFavorite(movie);
    else onFavoriteToggle(movie);
  }

  return (
    <section className="panel p-4 remote-frame">
      {state.warning && <div className="alert alert-warning py-2">Fallback local: {state.warning}</div>}
      <div className="row g-4">
        <div className="col-md-4">
          <img src={movie.posterUrl} className="poster rounded border" alt={`Affiche de ${movie.title}`} />
        </div>
        <div className="col-md-8">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            <div>
              <span className="badge text-bg-info mb-2">{state.source}</span>
              <h2 className="h3">{movie.title}</h2>
              {movie.original_title && movie.original_title !== movie.title ? <p className="small text-secondary mb-1">Titre original : {movie.original_title}</p> : null}
              <p className="text-secondary">{movie.release_date || "Date inconnue"} - {movie.runtime || "N/A"} min - <i className="bi bi-star-fill text-warning"></i> {rating.toFixed(1)}</p>
            </div>
            <button className="btn btn-outline-danger align-self-start" onClick={handleFavorite}>
              <i className={`bi ${favorite ? "bi-heart-fill" : "bi-heart"} me-2`}></i>{favorite ? "Retirer" : "Ajouter"}
            </button>
          </div>
          <p>{movie.overview || "Resume indisponible."}</p>
          <div className="row g-2 mb-3">
            <div className="col-sm-4">
              <div className="border rounded p-2 h-100">
                <div className="small text-secondary">Note</div>
                <div className="fw-semibold">{rating.toFixed(1)} / 10</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="border rounded p-2 h-100">
                <div className="small text-secondary">Sortie</div>
                <div className="fw-semibold">{movie.release_date || "N/A"}</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="border rounded p-2 h-100">
                <div className="small text-secondary">Duree</div>
                <div className="fw-semibold">{movie.runtime || "N/A"} min</div>
              </div>
            </div>
          </div>
          <div className="mb-3 d-flex flex-wrap gap-2">
            {(movie.genres || []).map((genre) => <span className="badge text-bg-light" key={genre.id}>{genre.name}</span>)}
          </div>
          <h3 className="h5">Production</h3>
          {(movie.production_companies || []).length === 0 ? <div className="alert alert-light border">Societes de production indisponibles.</div> : (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {movie.production_companies.slice(0, 5).map((company) => <span className="badge text-bg-secondary" key={company.id || company.name}>{company.name}</span>)}
            </div>
          )}
          <div className="mb-3">
            <a className="btn btn-sm btn-outline-light" href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-box-arrow-up-right me-1"></i>Source officielle
            </a>
          </div>
          <h3 className="h5">Casting</h3>
          {(movie.cast || []).length === 0 ? <div className="alert alert-light border">Casting indisponible.</div> : (
            <div className="row g-2">
              {movie.cast.slice(0, 6).map((person) => (
                <div className="col-sm-6 col-lg-4" key={person.id}>
                  <div className="border rounded p-2 h-100">
                    <div className="fw-semibold">{person.name}</div>
                    <div className="small text-secondary">{person.character || "Role non renseigne"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
