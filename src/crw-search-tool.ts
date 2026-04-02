import { Type } from "@sinclair/typebox";

interface CrwConfig {
  apiUrl: string;
  apiKey?: string;
}

export function createCrwSearchTool(config: CrwConfig) {
  const { apiUrl, apiKey } = config;

  return {
    name: "crw_search",
    description:
      "Search the web and return relevant results with titles, URLs, and descriptions. " +
      "Cloud-only feature — requires fastcrw.com API key. " +
      "Optionally scrape result pages for full content.",
    parameters: Type.Object({
      query: Type.String({ description: "Search query" }),
      limit: Type.Optional(
        Type.Number({ description: "Max results (1-20)", default: 5 })
      ),
      scrape: Type.Optional(
        Type.Boolean({
          description: "Also scrape result URLs for full content",
          default: false,
        })
      ),
    }),
    async execute(
      _id: string,
      params: { query: string; limit?: number; scrape?: boolean }
    ) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const body: Record<string, unknown> = {
        query: params.query,
        limit: params.limit ?? 5,
      };
      if (params.scrape) {
        body.scrapeOptions = { formats: ["markdown"] };
      }

      const resp = await fetch(`${apiUrl}/v1/search`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "Unknown error");
        return {
          content: [
            {
              type: "text" as const,
              text: `CRW search failed (${resp.status}): ${text.slice(0, 200)}`,
            },
          ],
        };
      }

      const result = await resp.json();
      const data = result.data || [];

      if (Array.isArray(data)) {
        const text = data
          .map((r: any) => {
            let entry = `## ${r.title || "Untitled"}\n${r.url}\n${r.description || ""}`;
            if (r.markdown) {
              entry += `\n\n${r.markdown}`;
            }
            return entry;
          })
          .join("\n\n---\n\n");
        return {
          content: [
            { type: "text" as const, text: text || "No results found." },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(data, null, 2) },
        ],
      };
    },
  };
}
