const demoFavorites = [
  { id: 101, title: "Aurora Protocol", posterUrl: "", vote_average: 8.2, release_date: "2025-03-14" },
  { id: 104, title: "Letters from Europa", posterUrl: "", vote_average: 8.6, release_date: "2023-09-01" }
];

export default function FavoritesApp({ favorites, onMovieSelected, onMovieSelect = () => {}, onRemoveFavorite = () => {}, onClearFavorites }) {
  const items = favorites || demoFavorites;

  function selectMovie(movie) {
    if (onMovieSelected) onMovieSelected(movie);
    else onMovieSelect(movie);
  }

  function clearFavorites() {
    if (window.confirm("Vider toute la liste des favoris ?") && onClearFavorites) {
      onClearFavorites();
    }
  }

  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h4 mb-1">Favoris</h2>
          <p className="text-secondary mb-0">{items.length} film(s) sauvegarde(s) localement.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge text-bg-danger">{items.length}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={items.length === 0 || !onClearFavorites} onClick={clearFavorites}>Vider</button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="alert alert-light border" role="status">Aucun favori pour le moment. Ajoutez un film depuis la liste ou les details.</div>
      ) : (
        <div className="row g-3">
          {items.map((movie) => (
            <div className="col-md-6 col-xl-4" key={movie.id}>
              <div className="border rounded p-3 h-100 d-flex gap-3">
                <img src={movie.posterUrl} className="poster-sm" alt={`Affiche de ${movie.title}`} />
                <div className="flex-grow-1">
                  <h3 className="h6">{movie.title}</h3>
                  <p className="small text-secondary mb-2">{movie.release_date || "Date inconnue"} - Note {Number(movie.vote_average || 0).toFixed(1)}</p>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-danger" onClick={() => selectMovie(movie)}>Ouvrir</button>
                    <button className="btn btn-outline-secondary" onClick={() => onRemoveFavorite(movie.id)} aria-label={`Supprimer ${movie.title}`}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
