import { useEffect, useMemo, useState } from "react";
import { fetchTasks } from "./services/api";

const STORAGE_KEY = "task-manager.tasks.v1";

export default function Tasks({ status = "all", onStatusChange = () => {}, onTaskSelected = () => {} }) {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [initialized, setInitialized] = useState(false);

  async function load() {
    setLoading(true);
    const result = await fetchTasks();
    let saved = [];
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      saved = [];
    }
    setData(Array.isArray(saved) && saved.length > 0 ? saved : result.data);
    setWarning(result.warning || "");
    setInitialized(true);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, initialized]);

  function addTask(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    setData((items) => [{ id: `local-${Date.now()}`, userId: 1, title: value, completed: false }, ...items]);
    setTitle("");
  }

  function toggleTask(task) {
    setData((items) => items.map((item) => (item.id === task.id ? { ...item, completed: !item.completed } : item)));
  }

  const filtered = useMemo(
    () => data.filter((task) => (status === "all" || (status === "done" && task.completed) || (status === "todo" && !task.completed)) && task.title.toLowerCase().includes(query.toLowerCase())),
    [data, status, query]
  );

  if (loading) {
    return <div className="panel p-4"><span className="spinner-border spinner-border-sm me-2" />Chargement des tâches...</div>;
  }

  return (
    <section className="panel p-4">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h4 mb-1">Tâches</h2>
          <span className="small text-secondary">{filtered.length} résultat(s)</span>
        </div>
        <div className="d-flex gap-2">
          <input className="form-control form-control-sm" aria-label="Rechercher une tâche" placeholder="Rechercher" value={query} onChange={(event) => setQuery(event.target.value.slice(0, 80))} />
          <select className="form-select form-select-sm" aria-label="Filtrer" value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">Toutes</option>
            <option value="todo">À faire</option>
            <option value="done">Terminées</option>
          </select>
        </div>
      </div>

      <form className="input-group mb-3" onSubmit={addTask}>
        <label className="visually-hidden" htmlFor="new-task">Nouvelle tâche</label>
        <input id="new-task" className="form-control" placeholder="Ajouter une tâche locale" value={title} onChange={(event) => setTitle(event.target.value.slice(0, 120))} />
        <button className="btn btn-info" type="submit" disabled={!title.trim()}><i className="bi bi-plus-lg me-1" />Ajouter</button>
      </form>

      {warning && <div className="alert alert-warning py-2">Fallback local : {warning}</div>}
      {filtered.length === 0 ? <div className="alert alert-info">Aucune tâche trouvée.</div> : (
        <div className="vstack gap-2">
          {filtered.map((task) => (
            <div className="task-card border rounded p-3" key={task.id}>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <button type="button" className="btn btn-link text-start text-decoration-none p-0 flex-grow-1" onClick={() => onTaskSelected(task)}>
                  <span className={task.completed ? "text-decoration-line-through text-secondary" : ""}>{task.title}</span>
                </button>
                <span className={`badge ${task.completed ? "text-bg-success" : "text-bg-warning"}`}>{task.completed ? "Terminée" : "À faire"}</span>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleTask(task)} aria-label={task.completed ? "Marquer à faire" : "Marquer terminée"}>
                  <i className={`bi ${task.completed ? "bi-arrow-counterclockwise" : "bi-check2"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn btn-outline-secondary btn-sm mt-3" onClick={load}><i className="bi bi-arrow-clockwise me-1" />Recharger l'API</button>
    </section>
  );
}
