import { genres, mockCast, mockMovies } from "./mockData";

const API_BASE = process.env.MOVIE_API_BASE_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23172033'/%3E%3Ccircle cx='200' cy='210' r='86' fill='%23b42318'/%3E%3Crect x='92' y='340' width='216' height='26' rx='13' fill='%23fff3cd'/%3E%3Crect x='132' y='390' width='136' height='18' rx='9' fill='%23d7deea'/%3E%3C/svg%3E";
const TVMAZE_BASE = "https://api.tvmaze.com";

export async function fetchWithTimeout(url, options = {}, timeout = Number(process.env.MOVIE_API_TIMEOUT || 10000)) {
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
      if (response.status === 401) throw new Error("Cle TMDB absente ou invalide.");
      if (response.status === 429) throw new Error("Limite de requetes TMDB atteinte. Reessayez plus tard.");
      throw new Error(`HTTP ${response.status}: ${response.statusText || "Erreur API cinema"}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La requete cinema a expire. Verifiez la connexion puis reessayez.");
    }
    throw new Error(error.message || "Impossible de contacter l'API cinema.");
  } finally {
    clearTimeout(timeoutId);
  }
}

function hasTmdbKey() {
  return Boolean(process.env.MOVIE_API_KEY || process.env.TMDB_API_KEY);
}

function requireKey() {
  const key = process.env.MOVIE_API_KEY || process.env.TMDB_API_KEY;
  if (!key) throw new Error("Cle TMDB non configuree.");
  return key;
}

function normalizeTvMaze(show) {
  return normalizeMovie({
    id: show.id,
    title: show.name,
    overview: show.summary?.replace(/<[^>]+>/g, "") || "Résumé indisponible.",
    release_date: show.premiered || "",
    vote_average: show.rating?.average || 0,
    poster_path: show.image?.original || show.image?.medium || "",
    genres: (show.genres || []).map((name, index) => ({ id: index + 1, name })),
    runtime: show.runtime || show.averageRuntime || 0,
    production_companies: show.network ? [{ id: show.network.id, name: show.network.name }] : [],
    cast: (show._embedded?.cast || []).slice(0, 6).map((item) => ({ id: item.person.id, name: item.person.name, character: item.character?.name }))
  });
}

async function getTvMazeShows(query = "") {
  const url = query.trim() ? TVMAZE_BASE + "/search/shows?q=" + encodeURIComponent(query.trim()) : TVMAZE_BASE + "/shows?page=0";
  const data = await fetchWithTimeout(url);
  return (query.trim() ? data.map((item) => item.show) : data).map(normalizeTvMaze);
}

async function getTvMazeDetail(movieOrId) {
  const id = typeof movieOrId === "object" && movieOrId ? movieOrId.id : movieOrId;
  const data = await fetchWithTimeout(TVMAZE_BASE + "/shows/" + encodeURIComponent(id) + "?embed=cast");
  return normalizeTvMaze(data);
}

function tmdbUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  url.search = new URLSearchParams({
    api_key: requireKey(),
    language: "en-US",
    ...params
  }).toString();
  return url.toString();
}

export function posterUrl(path) {
  if (path && /^https?:\/\//i.test(path)) return path;
  return path ? `${IMAGE_BASE}${path}` : FALLBACK_POSTER;
}

export function normalizeMovie(movie) {
  return {
    ...movie,
    title: movie.title || movie.name || "Untitled movie",
    release_date: movie.release_date || movie.first_air_date || "",
    vote_average: Number(movie.vote_average || 0),
    posterUrl: posterUrl(movie.poster_path),
    genre_ids: movie.genre_ids || (movie.genres || []).map((genre) => genre.id)
  };
}

function fallbackList(query = "") {
  const q = query.trim().toLowerCase();
  const list = q ? mockMovies.filter((movie) => [movie.title, movie.overview].join(" ").toLowerCase().includes(q)) : mockMovies;
  return list.map(normalizeMovie);
}

function fallbackMovie(movieOrId) {
  const inputMovie = typeof movieOrId === "object" && movieOrId ? movieOrId : null;
  const movieId = inputMovie?.id || movieOrId;
  const matched = mockMovies.find((movie) => String(movie.id) === String(movieId));
  const fallback = normalizeMovie(inputMovie || matched || mockMovies[0]);
  const genreIds = fallback.genre_ids || [];

  return {
    ...fallback,
    runtime: fallback.runtime || matched?.runtime || 110,
    genres: fallback.genres || genres.filter((genre) => genreIds.includes(genre.id)),
    production_companies: fallback.production_companies || [{ id: 1, name: "Independent Reference Studio" }],
    cast: fallback.cast || mockCast
  };
}

export async function getGenres() {
  try {
    if (!hasTmdbKey()) {
      const data = await getTvMazeShows();
      const names = Array.from(new Set(data.flatMap((movie) => (movie.genres || []).map((genre) => genre.name))));
      const values = names.map((name) => ({ id: name, name }));
      return { data: values.length ? values : genres, source: "TVmaze" };
    }
    const data = await fetchWithTimeout(tmdbUrl("/genre/movie/list"));
    return { data: data.genres || genres, source: "TMDB" };
  } catch (error) {
    return { data: genres, source: "Mock local", warning: error.message };
  }
}

export async function getPopularMovies(page = 1, genreId = "") {
  try {
    if (!hasTmdbKey()) {
      const data = await getTvMazeShows();
      const filtered = genreId ? data.filter((movie) => movie.genres?.some((genre) => genre.name === genreId)) : data;
      return { data: filtered.slice(0, 24), page: 1, totalPages: 1, source: "TVmaze" };
    }
    const path = genreId ? "/discover/movie" : "/movie/popular";
    const data = await fetchWithTimeout(tmdbUrl(path, { page: String(page), ...(genreId ? { with_genres: String(genreId), sort_by: "popularity.desc" } : {}) }));
    return { data: (data.results || []).map(normalizeMovie), page: data.page || page, totalPages: Math.min(data.total_pages || 1, 20), source: "TMDB" };
  } catch (error) {
    const data = fallbackList();
    return { data, page: 1, totalPages: 1, source: "Mock local", warning: error.message };
  }
}

export async function searchMovies(query) {
  if (!query.trim()) return { data: [], source: "Local", totalPages: 0 };
  try {
    if (!hasTmdbKey()) {
      return { data: await getTvMazeShows(query), totalPages: 1, source: "TVmaze" };
    }
    const data = await fetchWithTimeout(tmdbUrl("/search/movie", { query: query.trim(), include_adult: "false", page: "1" }));
    return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 0, source: "TMDB" };
  } catch (error) {
    return { data: fallbackList(query), totalPages: 1, source: "Mock local", warning: error.message };
  }
}

export async function getMovieDetails(movieOrId) {
  const movieId = typeof movieOrId === "object" && movieOrId ? movieOrId.id : movieOrId;
  try {
    if (!hasTmdbKey()) {
      return { data: await getTvMazeDetail(movieOrId), source: "TVmaze" };
    }
    const data = await fetchWithTimeout(tmdbUrl(`/movie/${encodeURIComponent(movieId)}`, { append_to_response: "credits" }));
    return {
      data: {
        ...normalizeMovie(data),
        runtime: data.runtime,
        genres: data.genres || [],
        production_companies: data.production_companies || [],
        cast: (data.credits?.cast || []).slice(0, 6)
      },
      source: "TMDB"
    };
  } catch (error) {
    return {
      data: fallbackMovie(movieOrId),
      source: "Mock local",
      warning: error.message
    };
  }
}

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("movie-platform:favorites") || "[]");
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem("movie-platform:favorites", JSON.stringify(favorites));
}
