import { useEffect, useMemo, useState } from "react";
import { getCountries } from "./services/api";

const PAGE_SIZE = 8;

export default function CountriesApp({ selectedCountry, onCountrySelect = () => {}, globalSearch = "" }) {
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [warning, setWarning] = useState("");

  async function loadCountries() {
    setLoading(true);
    setError("");
    const result = await getCountries();
    setCountries(result.data);
    setSource(result.source);
    setWarning(result.warning || "");
    setLoading(false);
  }

  useEffect(() => {
    loadCountries().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  useEffect(() => setPage(1), [query, region, globalSearch]);

  const regions = useMemo(() => ["all", ...Array.from(new Set(countries.map((country) => country.region).filter(Boolean))).sort()], [countries]);
  const activeQuery = (globalSearch || query).trim().toLowerCase();
  const filtered = countries.filter((country) => {
    const matchesQuery = !activeQuery || [country.displayName, country.capitalName, country.cca3].join(" ").toLowerCase().includes(activeQuery);
    const matchesRegion = region === "all" || country.region === region;
    return matchesQuery && matchesRegion;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <section className="panel p-4 remote-frame" aria-busy="true">
        <div className="d-flex gap-2 align-items-center mb-3">
          <div className="spinner-border text-primary" role="status" aria-label="Chargement des pays"></div>
          <h2 className="h5 mb-0">Chargement des pays</h2>
        </div>
        <div className="row g-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="col-md-6"><div className="skeleton" style={{ height: 92 }}></div></div>)}</div>
      </section>
    );
  }

  if (error) {
    return <div className="alert alert-danger" role="alert">Impossible de charger les pays. {error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadCountries}>Reessayer</button></div>;
  }

  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h4 mb-1">Explorer les pays</h2>
          <p className="text-secondary mb-0">{filtered.length} pays disponibles. Source: <span className="badge text-bg-info">{source}</span></p>
        </div>
        <div className="d-flex gap-2 flex-column flex-sm-row">
          <label className="visually-hidden" htmlFor="country-search">Rechercher un pays</label>
          <input id="country-search" className="form-control" value={query} onChange={(event) => setQuery(event.target.value.slice(0, 80))} placeholder="Pays, capitale ou code" />
          <label className="visually-hidden" htmlFor="region-filter">Filtrer par continent</label>
          <select id="region-filter" className="form-select" value={region} onChange={(event) => setRegion(event.target.value)}>
            {regions.map((item) => <option key={item} value={item}>{item === "all" ? "Tous les continents" : item}</option>)}
          </select>
        </div>
      </div>
      {warning && <div className="alert alert-warning py-2" role="status">API distante indisponible: {warning}. Donnees locales utilisees.</div>}
      {visible.length === 0 ? (
        <div className="alert alert-light border" role="status">Aucun pays ne correspond a cette recherche.</div>
      ) : (
        <div className="row g-3">
          {visible.map((country) => (
            <div className="col-md-6 col-xl-3" key={country.cca3}>
              <button className={`card h-100 w-100 text-start focus-ring ${selectedCountry?.cca3 === country.cca3 ? "border-primary border-2" : ""}`} onClick={() => onCountrySelect(country)} aria-pressed={selectedCountry?.cca3 === country.cca3}>
                <div className="card-body">
                  <div className="d-flex gap-3 align-items-center mb-3">
                    <img className="flag-img" src={country.flagUrl} alt={country.flagAlt} />
                    <div>
                      <h3 className="h6 mb-1">{country.displayName}</h3>
                      <span className="badge text-bg-light">{country.region}</span>
                    </div>
                  </div>
                  <p className="mb-1"><i className="bi bi-building me-1"></i>{country.capitalName}</p>
                  <p className="mb-0 text-secondary"><i className="bi bi-people me-1"></i>{country.population?.toLocaleString("fr-FR") || "Population indisponible"}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
      <nav className="d-flex justify-content-between align-items-center mt-3" aria-label="Pagination des pays">
        <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><i className="bi bi-chevron-left"></i> Precedent</button>
        <span className="small text-secondary">Page {page} / {pages}</span>
        <button className="btn btn-outline-secondary" disabled={page === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Suivant <i className="bi bi-chevron-right"></i></button>
      </nav>
    </section>
  );
}
