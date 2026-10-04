export const mockCountries = [
  {
    cca3: "CAN",
    name: { common: "Canada", official: "Canada" },
    capital: ["Ottawa"],
    region: "Americas",
    subregion: "North America",
    population: 38005238,
    area: 9984670,
    latlng: [56, -106],
    capitalInfo: { latlng: [45.42, -75.69] },
    flags: { png: "https://flagcdn.com/w320/ca.png", svg: "https://flagcdn.com/ca.svg", alt: "Flag of Canada" },
    languages: { eng: "English", fra: "French" },
    currencies: { CAD: { name: "Canadian dollar", symbol: "$" } }
  },
  {
    cca3: "JPN",
    name: { common: "Japan", official: "Japan" },
    capital: ["Tokyo"],
    region: "Asia",
    subregion: "Eastern Asia",
    population: 125836021,
    area: 377930,
    latlng: [36, 138],
    capitalInfo: { latlng: [35.68, 139.75] },
    flags: { png: "https://flagcdn.com/w320/jp.png", svg: "https://flagcdn.com/jp.svg", alt: "Flag of Japan" },
    languages: { jpn: "Japanese" },
    currencies: { JPY: { name: "Japanese yen", symbol: "¥" } }
  },
  {
    cca3: "BRA",
    name: { common: "Brazil", official: "Federative Republic of Brazil" },
    capital: ["Brasilia"],
    region: "Americas",
    subregion: "South America",
    population: 212559409,
    area: 8515767,
    latlng: [-10, -55],
    capitalInfo: { latlng: [-15.79, -47.88] },
    flags: { png: "https://flagcdn.com/w320/br.png", svg: "https://flagcdn.com/br.svg", alt: "Flag of Brazil" },
    languages: { por: "Portuguese" },
    currencies: { BRL: { name: "Brazilian real", symbol: "R$" } }
  },
  {
    cca3: "FRA",
    name: { common: "France", official: "French Republic" },
    capital: ["Paris"],
    region: "Europe",
    subregion: "Western Europe",
    population: 67391582,
    area: 551695,
    latlng: [46, 2],
    capitalInfo: { latlng: [48.86, 2.35] },
    flags: { png: "https://flagcdn.com/w320/fr.png", svg: "https://flagcdn.com/fr.svg", alt: "Flag of France" },
    languages: { fra: "French" },
    currencies: { EUR: { name: "Euro", symbol: "€" } }
  },
  {
    cca3: "KEN",
    name: { common: "Kenya", official: "Republic of Kenya" },
    capital: ["Nairobi"],
    region: "Africa",
    subregion: "Eastern Africa",
    population: 53771300,
    area: 580367,
    latlng: [1, 38],
    capitalInfo: { latlng: [-1.28, 36.82] },
    flags: { png: "https://flagcdn.com/w320/ke.png", svg: "https://flagcdn.com/ke.svg", alt: "Flag of Kenya" },
    languages: { eng: "English", swa: "Swahili" },
    currencies: { KES: { name: "Kenyan shilling", symbol: "Sh" } }
  },
  {
    cca3: "AUS",
    name: { common: "Australia", official: "Commonwealth of Australia" },
    capital: ["Canberra"],
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 25687041,
    area: 7692024,
    latlng: [-27, 133],
    capitalInfo: { latlng: [-35.28, 149.13] },
    flags: { png: "https://flagcdn.com/w320/au.png", svg: "https://flagcdn.com/au.svg", alt: "Flag of Australia" },
    languages: { eng: "English" },
    currencies: { AUD: { name: "Australian dollar", symbol: "$" } }
  }
];

export const mockWeather = {
  current: {
    temperature_2m: 18,
    relative_humidity_2m: 62,
    wind_speed_10m: 14,
    weather_code: 2
  },
  daily: {
    time: ["Today", "Tomorrow", "Day 3"],
    temperature_2m_max: [20, 22, 19],
    temperature_2m_min: [12, 14, 11],
    precipitation_probability_max: [20, 35, 15]
  }
};

export const mockWorldBank = [
  { countryiso3code: "CAN", date: "2025", value: 40000000 },
  { countryiso3code: "JPN", date: "2025", value: 123000000 },
  { countryiso3code: "BRA", date: "2025", value: 213000000 }
];