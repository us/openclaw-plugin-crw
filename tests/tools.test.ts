import { describe, it, expect, mock, afterEach } from "bun:test";
import { createCrwScrapeTool } from "../src/crw-scrape-tool";
import { createCrwCrawlTool } from "../src/crw-crawl-tool";
import { createCrwMapTool } from "../src/crw-map-tool";
import { createCrwSearchTool } from "../src/crw-search-tool";

const config = { apiUrl: "http://localhost:3000" };
const cloudConfig = { apiUrl: "https://fastcrw.com/api", apiKey: "test-key" };

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("crw_scrape", () => {
  it("scrapes and returns markdown", async () => {
    const tool = createCrwScrapeTool(config);
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              markdown: "# Hello World",
              metadata: { title: "Hello", sourceURL: "https://example.com" },
            },
          }),
      })
    );
    globalThis.fetch = mockFetch as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("# Hello");
    expect(result.content[0].text).toContain("Hello World");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("includes auth header with api key", async () => {
    const tool = createCrwScrapeTool(cloudConfig);
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { markdown: "ok", metadata: {} } }),
      })
    );
    globalThis.fetch = mockFetch as any;

    await tool.execute("test", { url: "https://example.com" });
    const callArgs = mockFetch.mock.calls[0];
    const fetchOptions = callArgs[1] as RequestInit;
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-key");
  });

  it("handles HTTP errors", async () => {
    const tool = createCrwScrapeTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({ ok: false, status: 500, statusText: "Internal Server Error" })
    ) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("500");
  });

  it("falls back to plainText", async () => {
    const tool = createCrwScrapeTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { plainText: "Plain content", metadata: {} },
          }),
      })
    ) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("Plain content");
  });
});

describe("crw_crawl", () => {
  it("starts crawl and polls for completion", async () => {
    const tool = createCrwCrawlTool(config);
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, id: "job-1" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "completed",
            data: [
              { markdown: "# Page 1", metadata: { sourceURL: "https://example.com" } },
              { markdown: "# Page 2", metadata: { sourceURL: "https://example.com/about" } },
            ],
          }),
      });
    }) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("Page 1");
    expect(result.content[0].text).toContain("Page 2");
    expect(result.content[0].text).toContain("2 pages");
  });

  it("handles crawl failure", async () => {
    const tool = createCrwCrawlTool(config);
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, id: "job-fail" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "failed" }),
      });
    }) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("failed");
  });
});

describe("crw_map", () => {
  it("returns discovered URLs", async () => {
    const tool = createCrwMapTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              links: [
                "https://example.com",
                "https://example.com/about",
                "https://example.com/blog",
              ],
            },
          }),
      })
    ) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("3 URLs");
    expect(result.content[0].text).toContain("https://example.com/about");
  });

  it("handles empty results", async () => {
    const tool = createCrwMapTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { links: [] } }),
      })
    ) as any;

    const result = await tool.execute("test", { url: "https://example.com" });
    expect(result.content[0].text).toContain("No URLs");
  });

  it("handles HTTP error", async () => {
    const tool = createCrwMapTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({ ok: false, status: 422, statusText: "Unprocessable Entity" })
    ) as any;

    const result = await tool.execute("test", { url: "bad-url" });
    expect(result.content[0].text).toContain("422");
  });
});

describe("crw_search", () => {
  it("returns formatted search results", async () => {
    const tool = createCrwSearchTool(cloudConfig);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                title: "Web Scraping Guide",
                url: "https://example.com/guide",
                description: "A comprehensive guide",
              },
              {
                title: "Scraping Tips",
                url: "https://example.com/tips",
                description: "Useful tips",
              },
            ],
          }),
      })
    ) as any;

    const result = await tool.execute("test", { query: "web scraping" });
    expect(result.content[0].text).toContain("Web Scraping Guide");
    expect(result.content[0].text).toContain("https://example.com/guide");
    expect(result.content[0].text).toContain("Scraping Tips");
  });

  it("includes auth header with api key", async () => {
    const tool = createCrwSearchTool(cloudConfig);
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    );
    globalThis.fetch = mockFetch as any;

    await tool.execute("test", { query: "test" });
    const callArgs = mockFetch.mock.calls[0];
    const fetchOptions = callArgs[1] as RequestInit;
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-key");
  });

  it("sends scrapeOptions when scrape=true", async () => {
    const tool = createCrwSearchTool(cloudConfig);
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    );
    globalThis.fetch = mockFetch as any;

    await tool.execute("test", { query: "test", scrape: true });
    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body.scrapeOptions).toEqual({ formats: ["markdown"] });
  });

  it("handles HTTP errors", async () => {
    const tool = createCrwSearchTool(config);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: () => Promise.resolve("Cloud-only feature"),
      })
    ) as any;

    const result = await tool.execute("test", { query: "test" });
    expect(result.content[0].text).toContain("403");
  });

  it("handles empty results", async () => {
    const tool = createCrwSearchTool(cloudConfig);
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    ) as any;

    const result = await tool.execute("test", { query: "obscure query xyz" });
    expect(result.content[0].text).toContain("No results found");
  });
});
