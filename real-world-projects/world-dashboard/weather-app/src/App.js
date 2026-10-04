import { useEffect, useState } from "react";
import { getWeatherForCountry } from "./services/api";

export default function WeatherApp({ country }) {
  const [state, setState] = useState({ loading: false, data: null, error: "", source: "", warning: "" });

  async function loadWeather() {
    if (!country) return;
    setState({ loading: true, data: null, error: "", source: "", warning: "" });
    try {
      const result = await getWeatherForCountry(country);
      setState({ loading: false, data: result.data, error: "", source: result.source, warning: result.warning || "" });
    } catch (error) {
      setState({ loading: false, data: null, error: error.message, source: "", warning: "" });
    }
  }

  useEffect(() => {
    loadWeather();
  }, [country?.cca3]);

  if (!country) return <section className="panel p-4 remote-frame"><h2 className="h4">Meteo</h2><p className="text-secondary mb-0">Selectionnez un pays pour afficher la meteo de sa capitale.</p></section>;
  if (state.loading) return <section className="panel p-4 remote-frame" aria-busy="true"><div className="spinner-border text-primary me-2" role="status"></div>Chargement de la meteo...</section>;
  if (state.error) return <div className="alert alert-danger">Meteo indisponible: {state.error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadWeather}>Reessayer</button></div>;

  const current = state.data?.current || {};
  const daily = state.data?.daily || {};
  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="h4 mb-1">Meteo a {country.capitalName}</h2>
          <span className="badge text-bg-info">{state.source}</span>
        </div>
        <i className="bi bi-cloud-sun fs-1 text-warning" aria-hidden="true"></i>
      </div>
      {state.warning && <div className="alert alert-warning py-2">Fallback local: {state.warning}</div>}
      <div className="row g-3 mb-3">
        <div className="col-sm-4"><div className="border rounded p-3 h-100"><div className="text-secondary">Temperature</div><div className="fs-3 fw-bold">{current.temperature_2m ?? "--"} deg C</div></div></div>
        <div className="col-sm-4"><div className="border rounded p-3 h-100"><div className="text-secondary">Humidite</div><div className="fs-3 fw-bold">{current.relative_humidity_2m ?? "--"}%</div></div></div>
        <div className="col-sm-4"><div className="border rounded p-3 h-100"><div className="text-secondary">Vent</div><div className="fs-3 fw-bold">{current.wind_speed_10m ?? "--"} km/h</div></div></div>
      </div>
      <h3 className="h6">Previsions simples</h3>
      <div className="d-flex flex-wrap gap-2">
        {(daily.time || []).map((day, index) => (
          <div className="border rounded px-3 py-2" key={day}>
            <div className="fw-semibold">{day}</div>
            <div className="small text-secondary">{daily.temperature_2m_min?.[index]} / {daily.temperature_2m_max?.[index]} deg C</div>
            <div className="small">Pluie {daily.precipitation_probability_max?.[index] ?? 0}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}