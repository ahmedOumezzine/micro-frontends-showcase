export default function CountryDetailsApp({ country }) {
  if (!country) {
    return <section className="panel p-4 remote-frame"><h2 className="h4">Details du pays</h2><p className="text-secondary mb-0">Les informations detaillees apparaitront apres selection.</p></section>;
  }

  const facts = [
    ["Nom officiel", country.officialName],
    ["Capitale", country.capitalName],
    ["Region", country.region],
    ["Sous-region", country.subregion || "Non renseignee"],
    ["Superficie", `${country.area?.toLocaleString("fr-FR") || "N/A"} km2`],
    ["Population", country.population?.toLocaleString("fr-FR") || "N/A"],
    ["Langues", country.languagesList?.join(", ") || "Non renseigne"],
    ["Monnaies", country.currenciesList?.join(", ") || "Non renseigne"]
  ];

  return (
    <section className="panel p-4 remote-frame">
      <div className="d-flex flex-column flex-md-row gap-4">
        <img src={country.flagUrl} alt={country.flagAlt} className="rounded border" style={{ width: 220, maxWidth: "100%", objectFit: "cover" }} />
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-2">
            <h2 className="h4 mb-0">{country.displayName}</h2>
            <span className="badge text-bg-primary">{country.cca3}</span>
          </div>
          <div className="row g-2">
            {facts.map(([label, value]) => (
              <div className="col-sm-6" key={label}>
                <div className="border rounded p-2 h-100">
                  <div className="small text-secondary">{label}</div>
                  <div className="fw-semibold">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}