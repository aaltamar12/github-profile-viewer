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

export interface GithubSearchResult {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}
