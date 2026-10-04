import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoadingPanel from "./components/LoadingPanel";
import { getCountries, normalizeCountry } from "./services/api";
import { mockCountries } from "./services/mockData";

const CountriesApp = lazy(() => import("countriesApp/Countries"));
const WeatherApp = lazy(() => import("weatherApp/Weather"));
const CountryDetailsApp = lazy(() => import("countryDetailsApp/CountryDetails"));
const StatisticsApp = lazy(() => import("statisticsApp/Statistics"));

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    getCountries().then((result) => {
      const canada = result.data.find((country) => country.cca3 === "CAN") || result.data[0];
      setSelectedCountry(canada);
      if (result.warning) setToast(`REST Countries indisponible: ${result.warning}. Donnees locales utilisees.`);
    }).catch((error) => {
      const fallback = mockCountries.map(normalizeCountry);
      setSelectedCountry(fallback.find((country) => country.cca3 === "CAN") || fallback[0]);
      setToast(`Mode local active: ${error.message || "API pays indisponible"}.`);
    });
  }, []);

  const summary = useMemo(() => selectedCountry ? `${selectedCountry.displayName} - ${selectedCountry.capitalName} - ${selectedCountry.population.toLocaleString("fr-FR")} habitants` : "Aucun pays selectionne", [selectedCountry]);

  function handleCountrySelect(country) {
    setSelectedCountry(country);
    setToast(`${country.displayName} selectionne`);
    window.dispatchEvent(new CustomEvent("world-dashboard:country-selected", { detail: { cca3: country.cca3 } }));
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#top"><i className="bi bi-globe-americas me-2 text-primary"></i>World Dashboard</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Basculer la navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="#countries">Pays</a></li>
              <li className="nav-item"><a className="nav-link" href="#details">Details</a></li>
              <li className="nav-item"><a className="nav-link" href="#weather">Meteo</a></li>
              <li className="nav-item"><a className="nav-link" href="#stats">Stats</a></li>
            </ul>
            <form className="d-flex" role="search" onSubmit={(event) => event.preventDefault()}>
              <label className="visually-hidden" htmlFor="global-search">Recherche globale</label>
              <input id="global-search" className="form-control" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value.slice(0, 80))} placeholder="Recherche globale" />
            </form>
          </div>
        </div>
      </nav>

      <main id="top" className="container-fluid py-4">
        <section className="row g-3 align-items-stretch mb-4">
          <div className="col-lg-8">
            <div className="panel p-4 h-100">
              <span className="badge text-bg-success mb-2">Micro-Frontend reference</span>
              <h1 className="display-6 fw-bold">Tableau de bord mondial compose avec Module Federation</h1>
              <p className="lead mb-0">Le Host orchestre les remotes Countries, Weather, Country Details et Statistics. La selection courante est centralisee ici puis transmise par props et callbacks.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="panel p-4 h-100">
              <div className="text-secondary">Selection courante</div>
              <h2 className="h4">{selectedCountry?.displayName || "Chargement..."}</h2>
              <p className="mb-2">{summary}</p>
              {selectedCountry && <span className="badge text-bg-primary">{selectedCountry.region}</span>}
            </div>
          </div>
        </section>

        <div className="row g-4">
          <div id="countries" className="col-12">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Countries App" />}><CountriesApp selectedCountry={selectedCountry} onCountrySelect={handleCountrySelect} globalSearch={globalSearch} /></Suspense></ErrorBoundary>
          </div>
          <div id="details" className="col-xl-6">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Country Details App" />}><CountryDetailsApp country={selectedCountry} /></Suspense></ErrorBoundary>
          </div>
          <div id="weather" className="col-xl-6">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Weather App" />}><WeatherApp country={selectedCountry} /></Suspense></ErrorBoundary>
          </div>
          <div id="stats" className="col-12">
            <ErrorBoundary><Suspense fallback={<LoadingPanel label="Chargement de Statistics App" />}><StatisticsApp selectedCountry={selectedCountry} /></Suspense></ErrorBoundary>
          </div>
        </div>
      </main>

      {toast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show" role="status" aria-live="polite">
            <div className="toast-header"><strong className="me-auto">World Dashboard</strong><button type="button" className="btn-close" onClick={() => setToast("")} aria-label="Fermer"></button></div>
            <div className="toast-body">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
