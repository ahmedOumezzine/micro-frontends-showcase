import { useEffect, useMemo, useState } from "react";
import { getCountries, getPopulationIndicator } from "./services/api";

export default function StatisticsApp({ selectedCountry }) {
  const [countries, setCountries] = useState([]);
  const [compareCodes, setCompareCodes] = useState(["CAN", "JPN", "BRA"]);
  const [indicator, setIndicator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    getCountries().then((result) => {
      setCountries(result.data);
      setWarning(result.warning || "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedCountry?.cca3) {
      setCompareCodes((codes) => Array.from(new Set([selectedCountry.cca3, ...codes])).slice(0, 4));
      getPopulationIndicator(selectedCountry.cca3).then(setIndicator);
    }
  }, [selectedCountry?.cca3]);

  const compared = useMemo(() => countries.filter((country) => compareCodes.includes(country.cca3)), [countries, compareCodes]);
  const maxPopulation = Math.max(...compared.map((country) => country.population || 1), 1);
  const maxArea = Math.max(...compared.map((country) => country.area || 1), 1);

  if (loading) return <section className="panel p-4 remote-frame" aria-busy="true"><div className="spinner-border text-primary me-2"></div>Preparation des statistiques...</section>;

  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h4 mb-1">Statistiques comparees</h2>
          <p className="text-secondary mb-0">Population et superficie pour plusieurs pays.</p>
        </div>
        <div>
          <label className="form-label" htmlFor="compare-select">Ajouter un pays</label>
          <select id="compare-select" className="form-select" onChange={(event) => setCompareCodes((codes) => Array.from(new Set([event.target.value, ...codes])).slice(0, 4))} value="">
            <option value="" disabled>Choisir...</option>
            {countries.slice(0, 80).map((country) => <option key={country.cca3} value={country.cca3}>{country.displayName}</option>)}
          </select>
        </div>
      </div>
      {warning && <div className="alert alert-warning py-2">Pays charges depuis les mocks: {warning}</div>}
      {compared.length === 0 ? <div className="alert alert-light border">Aucune donnee a comparer.</div> : compared.map((country) => (
        <div className="mb-3" key={country.cca3}>
          <div className="d-flex justify-content-between">
            <strong>{country.displayName}</strong>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setCompareCodes((codes) => codes.filter((code) => code !== country.cca3))} aria-label={`Retirer ${country.displayName}`}><i className="bi bi-x-lg"></i></button>
          </div>
          <div className="small text-secondary">Population: {country.population?.toLocaleString("fr-FR") || "Indisponible"}</div>
          <div className="progress mb-2" role="progressbar" aria-label={`Population ${country.displayName}`}><div className="progress-bar bg-success" style={{ width: `${(country.population / maxPopulation) * 100}%` }}></div></div>
          <div className="small text-secondary">Superficie: {country.area?.toLocaleString("fr-FR") || "Indisponible"} km2</div>
          <div className="progress" role="progressbar" aria-label={`Superficie ${country.displayName}`}><div className="progress-bar bg-info" style={{ width: `${(country.area / maxArea) * 100}%` }}></div></div>
        </div>
      ))}
      {indicator?.data?.[0] && <div className="alert alert-light border mt-3">Dernier indicateur World Bank pour {selectedCountry?.displayName}: {indicator.data[0].value?.toLocaleString("fr-FR")} habitants ({indicator.data[0].date}). Source: {indicator.source}</div>}
      {indicator?.warning && <div className="alert alert-warning py-2">World Bank fallback: {indicator.warning}</div>}
    </section>
  );
}
