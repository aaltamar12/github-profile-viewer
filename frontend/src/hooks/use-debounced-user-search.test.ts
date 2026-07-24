import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedUserSearch } from "./use-debounced-user-search";
import * as githubClient from "@/lib/github/client";

vi.mock("@/lib/github/client", () => ({
  searchGithubUsers: vi.fn(),
}));

const sampleResult = [
  { login: "torvalds", avatarUrl: "https://x/1", htmlUrl: "https://y/1" },
];

describe("useDebouncedUserSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("does not call the API below the minimum length", () => {
    const { result } = renderHook(() => useDebouncedUserSearch());

    act(() => {
      result.current.search("ab");
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(githubClient.searchGithubUsers).not.toHaveBeenCalled();
  });

  it("debounces before calling the API, then resolves the results", async () => {
    vi.mocked(githubClient.searchGithubUsers).mockResolvedValue(sampleResult);

    const { result } = renderHook(() => useDebouncedUserSearch());

    act(() => {
      result.current.search("tor");
    });

    expect(result.current.loading).toBe(true);
    expect(githubClient.searchGithubUsers).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual(sampleResult);
  });

  it("serves a repeated query from its own cache without refetching", async () => {
    vi.mocked(githubClient.searchGithubUsers).mockResolvedValue(sampleResult);

    const { result } = renderHook(() => useDebouncedUserSearch());

    act(() => {
      result.current.search("tor");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    act(() => {
      result.current.search("TOR");
    });

    expect(githubClient.searchGithubUsers).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual(sampleResult);
  });

  it("clears stale results once the query drops below the minimum length", async () => {
    vi.mocked(githubClient.searchGithubUsers).mockResolvedValue(sampleResult);

    const { result } = renderHook(() => useDebouncedUserSearch());

    act(() => {
      result.current.search("tor");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    act(() => {
      result.current.search("t");
    });

    expect(result.current.results).toEqual([]);
  });
});
