import { mockArticle } from "./mockData"; export async function getArticle(article){if(article?.title)return {data:article,source:"Selection courante"};return {data:mockArticle,source:"Mock local"};}
