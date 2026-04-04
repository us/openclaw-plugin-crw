import { describe, test, expect } from "bun:test";

const API_KEY = process.env.CRW_API_KEY;
const API_URL = "https://fastcrw.com/api";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

describe.skipIf(!API_KEY)("Integration tests (fastcrw.com)", () => {
  test("scrape returns markdown", async () => {
    const resp = await fetch(`${API_URL}/v1/scrape`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: "https://example.com" }),
    });

    expect(resp.ok).toBe(true);
    const json = (await resp.json()) as Record<string, unknown>;
    expect(json.success).toBe(true);
    const data = json.data as Record<string, unknown>;
    expect(data).toBeDefined();
    expect(typeof data.markdown).toBe("string");
    expect((data.markdown as string).length).toBeGreaterThan(0);
  });

  test("map returns links", async () => {
    const resp = await fetch(`${API_URL}/v1/map`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: "https://example.com" }),
    });

    expect(resp.ok).toBe(true);
    const json = (await resp.json()) as Record<string, unknown>;
    expect(json.success).toBe(true);
    const data = json.data as Record<string, unknown>;
    expect(data).toBeDefined();
    expect(Array.isArray(data.links)).toBe(true);
  });

  test("search returns results", async () => {
    const resp = await fetch(`${API_URL}/v1/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: "web scraping", limit: 3 }),
    });

    expect(resp.ok).toBe(true);
    const json = await resp.json();
    expect(json.success).toBe(true);
    // Search may return data as array or nested — just verify the response shape
    expect(json.data).toBeDefined();
  });

  test("invalid url returns response without crash", async () => {
    const resp = await fetch(`${API_URL}/v1/scrape`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: "not-a-valid-url" }),
    });

    // API should respond (not crash) — may succeed or fail depending on implementation
    const json = await resp.json();
    expect(json).toBeDefined();
    // Either success:true (API tried to scrape) or success:false (validation error)
    expect(typeof json.success).toBe("boolean");
  });
});
