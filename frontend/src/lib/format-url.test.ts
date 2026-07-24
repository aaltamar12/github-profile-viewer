import { describe, expect, it } from "vitest";
import { formatUrl, normalizeUrl } from "./format-url";

describe("formatUrl", () => {
  it("strips the protocol and a trailing slash", () => {
    expect(formatUrl("https://alfonso-altamar-dev.vercel.app/")).toBe(
      "alfonso-altamar-dev.vercel.app",
    );
  });

  it("leaves a bare domain untouched", () => {
    expect(formatUrl("example.com")).toBe("example.com");
  });
});

describe("normalizeUrl", () => {
  it("adds https:// to a bare domain", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });

  it("leaves an already-absolute URL untouched", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });
});
