export const mockArticles = [
  { id: "mock-1", title: "How small teams are building calmer software systems", source: "The Daily Circuit", date: "2026-09-28T09:00:00Z", summary: "A practical look at resilient architecture, thoughtful defaults and sustainable delivery.", url: "https://news.ycombinator.com/" },
  { id: "mock-2", title: "The new map of responsible artificial intelligence", source: "North Star Review", date: "2026-09-27T15:30:00Z", summary: "Researchers and product teams are turning principles into measurable engineering habits.", url: "https://news.ycombinator.com/" },
  { id: "mock-3", title: "Cities rethink public data for a more useful web", source: "Civic Signal", date: "2026-09-26T12:10:00Z", summary: "Open data projects are becoming easier to explore, reuse and understand.", url: "https://news.ycombinator.com/" }
].map((item, index) => ({ ...item, image: `https://picsum.photos/seed/mock-news-${index}/640/360` }));
