import { useCallback, useEffect, useRef, useState } from "react";
import { searchGithubUsers } from "@/lib/github/client";
import type { GithubSearchResult } from "@/lib/github/types";

interface Options {
  minLength?: number;
  debounceMs?: number;
}

/**
 * Debounces, caches, and cancels in-flight GitHub user search requests.
 * `search` is meant to be called straight from an input's onChange — driving
 * this off a `query` prop via useEffect would force every state reset to
 * happen inside the effect body, which triggers avoidable re-renders.
 */
export function useDebouncedUserSearch({
  minLength = 3,
  debounceMs = 400,
}: Options = {}) {
  const [results, setResults] = useState<GithubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef(new Map<string, GithubSearchResult[]>());
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const search = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (trimmed.length < minLength) {
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
      }, debounceMs);
    },
    [minLength, debounceMs],
  );

  return { results, loading, error, search };
}
