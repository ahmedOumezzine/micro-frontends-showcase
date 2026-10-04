import { useState } from "react";
const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export default function MealPlanner({ planning = {}, onPlanningChange = () => {}, selectedRecipe = null }) {
  const [day, setDay] = useState("Lundi");
  function remove(key) { const next = { ...planning }; delete next[key]; onPlanningChange(next); }
  function assign() { if (selectedRecipe) onPlanningChange({ ...planning, [day]: selectedRecipe }); }
  return <section className="panel p-4"><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3"><div><h2 className="h4">Planning hebdomadaire</h2><p className="text-secondary mb-0">Choisissez un jour puis ajoutez la recette selectionnee.</p></div><div className="d-flex gap-2"><select className="form-select planner-day" value={day} onChange={event => setDay(event.target.value)} aria-label="Jour">{days.map(item => <option key={item}>{item}</option>)}</select><button className="btn btn-success" disabled={!selectedRecipe} onClick={assign}><i className="bi bi-calendar-plus me-1"/>Ajouter</button></div></div><div className="row g-2">{days.map(key => <div className="col-sm-6 col-lg-4" key={key}><div className="border rounded p-3 h-100"><div className="fw-semibold">{key}</div>{planning[key] ? <><div className="small mt-2">{planning[key].title}</div><button className="btn btn-sm btn-outline-danger mt-2" onClick={() => remove(key)}>Supprimer</button></> : <div className="small text-secondary mt-2">Aucune recette</div>}</div></div>)}</div></section>;
}
