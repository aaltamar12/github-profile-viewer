export interface GithubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
  createdAt: string;
}

export type GithubProfileResult =
  | { ok: true; data: GithubProfile }
  | { ok: false; status: number; message: string };

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function getGithubProfile(
  username: string,
): Promise<GithubProfileResult> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/user/${encodeURIComponent(username)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        ok: false,
        status: res.status,
        message: body?.message ?? "No se pudo obtener el perfil.",
      };
    }

    const data = (await res.json()) as GithubProfile;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 0,
      message:
        "No se pudo conectar con el backend. Puede estar despertando de un estado inactivo, intentá de nuevo en unos segundos.",
    };
  }
}
