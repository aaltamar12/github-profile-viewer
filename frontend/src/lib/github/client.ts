import type { GithubSearchResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function searchGithubUsers(
  query: string,
  signal?: AbortSignal,
): Promise<GithubSearchResult[]> {
  const res = await fetch(
    `${API_URL}/user/search?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? "Límite de búsquedas alcanzado, esperá un momento."
        : "No se pudo buscar usuarios.",
    );
  }

  return res.json() as Promise<GithubSearchResult[]>;
}
