import { mockCountries, mockWeather, mockWorldBank } from "./mockData";

export async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText || "API request failed"}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La requete a expire. Verifiez votre connexion puis reessayez.");
    }
    throw new Error(error.message || "Impossible de contacter le service distant.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function normalizeCountry(country) {
  return {
    ...country,
    displayName: country.name?.common || "Pays inconnu",
    officialName: country.name?.official || country.name?.common || "Nom officiel indisponible",
    capitalName: country.capital?.[0] || "Capitale indisponible",
    flagUrl: country.flags?.svg || country.flags?.png || "",
    flagAlt: country.flags?.alt || `Drapeau de ${country.name?.common || "pays"}`,
    languagesList: Object.values(country.languages || {}),
    currenciesList: Object.values(country.currencies || {}).map((currency) => currency.name)
  };
}

export function normalizeMledozeCountry(country) {
  const languageEntries = Object.values(country.languages || {}).map((language, index) => [`lang${index}`, language]);

  return {
    name: {
      common: country.name?.common || "Pays inconnu",
      official: country.name?.official || country.name?.common || "Nom officiel indisponible"
    },
    cca2: country.cca2,
    cca3: country.cca3,
    capital: country.capital || [],
    region: country.region,
    subregion: country.subregion,
    population: country.population,
    area: country.area,
    latlng: country.latlng,
    capitalInfo: { latlng: country.capitalInfo?.latlng || country.latlng },
    flags: {
      svg: country.flags?.svg || (country.cca2 ? `https://flagcdn.com/${country.cca2.toLowerCase()}.svg` : ""),
      png: country.flags?.png || (country.cca2 ? `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png` : ""),
      alt: `Drapeau de ${country.name?.common || "pays"}`
    },
    languages: Object.fromEntries(languageEntries),
    currencies: country.currencies || {}
  };
}

export async function getCountries() {
  try {
    const fields = "name,cca3,capital,region,subregion,population,area,flags,languages,currencies,latlng,capitalInfo";
    const data = await fetchWithTimeout(`https://restcountries.com/v3.1/all?fields=${fields}`);
    return { data: data.map(normalizeCountry).sort((a, b) => a.displayName.localeCompare(b.displayName)), source: "REST Countries" };
  } catch (restCountriesError) {
    try {
      const data = await fetchWithTimeout("https://raw.githubusercontent.com/mledoze/countries/master/countries.json");
      const countries = data
        .filter((country) => country.cca3 && country.name?.common)
        .map(normalizeMledozeCountry)
        .map(normalizeCountry)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
      return {
        data: countries,
        source: "Countries dataset",
        warning: `REST Countries indisponible: ${restCountriesError.message}`
      };
    } catch (datasetError) {
      return {
        data: mockCountries.map(normalizeCountry),
        source: "Mock local",
        warning: `REST Countries: ${restCountriesError.message}. Dataset public: ${datasetError.message}`
      };
    }
  }
}

export async function getWeatherForCountry(country) {
  const coords = country?.capitalInfo?.latlng || country?.latlng;
  if (!coords || coords.length < 2) {
    return { data: mockWeather, source: "Mock local", warning: "Coordonnees indisponibles pour ce pays." };
  }

  try {
    const [latitude, longitude] = coords;
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      forecast_days: "3",
      timezone: "auto"
    }).toString();
    const data = await fetchWithTimeout(url.toString());
    return { data, source: "Open-Meteo" };
  } catch (error) {
    return { data: mockWeather, source: "Mock local", warning: error.message };
  }
}

export async function getPopulationIndicator(iso3) {
  try {
    const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(iso3)}/indicator/SP.POP.TOTL?format=json&per_page=5`;
    const data = await fetchWithTimeout(url);
    const rows = Array.isArray(data) ? data[1] || [] : [];
    return { data: rows.filter((item) => item.value), source: "World Bank" };
  } catch (error) {
    return { data: mockWorldBank.filter((item) => item.countryiso3code === iso3), source: "Mock local", warning: error.message };
  }
}
