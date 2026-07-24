import Image from "next/image";
import Link from "next/link";
import { getGithubProfile, type GithubProfile } from "@/lib/github";
import { DEFAULT_USERNAME } from "@/lib/constants";
import { TerminalHeader, Window, Stat } from "@/components/profile-window";

export async function ProfileRoute({ username }: { username: string }) {
  const result = await getGithubProfile(username);

  return (
    <>
      {username.toLowerCase() !== DEFAULT_USERNAME && (
        <Link
          href="/"
          className="mb-3 inline-block text-[13px] text-ink-faint transition-colors hover:text-signal"
        >
          ← volver a {DEFAULT_USERNAME}
        </Link>
      )}

      <Window>
        <TerminalHeader
          username={username}
          status={result.ok ? "ok" : "error"}
          code={result.ok ? 200 : result.status || undefined}
        />
        {result.ok ? (
          <ProfileBody profile={result.data} />
        ) : (
          <ErrorBody message={result.message} status={result.status} />
        )}
      </Window>
    </>
  );
}

function ProfileBody({ profile }: { profile: GithubProfile }) {
  const metaItems: { text: string; href?: string }[] = [];
  if (profile.location) metaItems.push({ text: profile.location });
  if (profile.company) metaItems.push({ text: profile.company });
  if (profile.blog) {
    metaItems.push({
      text: formatUrl(profile.blog),
      href: normalizeUrl(profile.blog),
    });
  }

  const memberSince = new Date(profile.createdAt).getFullYear();

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        <Image
          src={profile.avatarUrl}
          alt={profile.name ?? profile.login}
          width={112}
          height={112}
          className="h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-[10px] border border-hairline object-cover"
          priority
        />
        <div className="min-w-0 pt-1">
          <h1 className="font-display text-[26px] sm:text-[36px] leading-[1.05] tracking-tight text-balance">
            {profile.name ?? profile.login}
          </h1>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-[14px] text-ink-muted transition-colors hover:text-signal"
          >
            @{profile.login}
          </a>
        </div>
      </div>

      {profile.bio && (
        <blockquote className="mt-6 border-l-2 border-hairline pl-4 text-[15px] italic leading-relaxed text-ink-muted">
          {profile.bio}
        </blockquote>
      )}

      {metaItems.length > 0 && (
        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
          {metaItems.map((item, i) => (
            <span key={item.text} className="inline-flex items-center">
              {i > 0 && <span className="mr-2 text-ink-faint">·</span>}
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-signal"
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          ))}
        </p>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6">
        <Stat value={profile.publicRepos} label="Repositorios" />
        <Stat value={profile.followers} label="Seguidores" />
        <Stat value={profile.following} label="Siguiendo" />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5 text-[13px]">
        <span className="text-ink-faint">En GitHub desde {memberSince}</span>
        <a
          href={profile.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="text-signal underline-offset-4 hover:underline"
        >
          Ver perfil ↗
        </a>
      </div>
    </div>
  );
}

function ErrorBody({ message, status }: { message: string; status: number }) {
  return (
    <div className="p-10 sm:p-14 text-center">
      <p className="font-display text-[22px]">
        {status === 404 ? "Perfil no encontrado" : "Algo no salió bien"}
      </p>
      <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-ink-muted">
        {message}
      </p>
    </div>
  );
}

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function normalizeUrl(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}
