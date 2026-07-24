"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchGithubUsers, type GithubSearchResult } from "@/lib/github";

export function SearchBox() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef(new Map<string, GithubSearchResult[]>());
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GithubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    setSelectedIndex(-1);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = cacheRef.current.get(trimmed);
    if (cached) {
      setResults(cached);
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
  }

  // Only schedules and performs the debounced network call; the "too short"
  // and "cached" cases are resolved synchronously in handleQueryChange above,
  // since setting state directly from an effect body causes an extra render.
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 3 || cacheRef.current.has(trimmed)) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchGithubUsers(trimmed, controller.signal)
        .then((data) => {
          cacheRef.current.set(trimmed, data);
          setResults(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          setError(err.message);
          setLoading(false);
        });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function select(login: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
    router.push(`/${login}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        select(results[selectedIndex].login);
      } else if (query.trim().length > 0) {
        select(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= 3;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-4 py-2.5 text-[13px] transition-colors focus-within:border-ink-faint">
        <span className="text-ink-faint">/user/</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="buscar otro perfil de GitHub…"
          aria-label="Buscar usuario de GitHub"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-faint"
        />
        <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 text-[11px] text-ink-faint sm:inline-block">
          /
        </kbd>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-lg border border-hairline bg-paper shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
          {loading && (
            <div className="px-4 py-3 text-[13px] text-ink-faint">
              buscando
              <span
                className="cursor-blink ml-1 inline-block w-[6px] bg-ink-faint align-middle"
                style={{ height: "1em" }}
                aria-hidden
              />
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-3 text-[13px] text-danger">{error}</div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="px-4 py-3 text-[13px] text-ink-faint">
              sin resultados — enter busca &quot;{trimmed}&quot; directo
            </div>
          )}

          {!loading &&
            !error &&
            results.map((r, i) => (
              <button
                key={r.login}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(r.login)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors ${
                  i === selectedIndex ? "bg-signal-soft" : "hover:bg-paper-raised"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.avatarUrl}
                  alt=""
                  loading="lazy"
                  className="h-6 w-6 shrink-0 rounded-[4px] object-cover"
                />
                <span className="truncate">{r.login}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
