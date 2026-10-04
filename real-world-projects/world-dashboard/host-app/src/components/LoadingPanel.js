export default function LoadingPanel({ label = "Chargement du module" }) {
  return (
    <div className="panel p-4 remote-frame" aria-live="polite" aria-busy="true">
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status" aria-label={label}></div>
        <span className="fw-semibold">{label}</span>
      </div>
      <div className="skeleton mb-2" style={{ width: "85%", height: 16 }}></div>
      <div className="skeleton mb-2" style={{ width: "65%", height: 16 }}></div>
      <div className="skeleton" style={{ width: "45%", height: 16 }}></div>
    </div>
  );
}