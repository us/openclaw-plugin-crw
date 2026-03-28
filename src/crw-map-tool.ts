import { Type } from "@sinclair/typebox";

interface CrwConfig {
  apiUrl: string;
  apiKey?: string;
}

export function createCrwMapTool(config: CrwConfig) {
  const { apiUrl, apiKey } = config;

  return {
    name: "crw_map",
    description:
      "Discover all URLs on a website. Returns a list of page URLs found via sitemap and link traversal. Use this to understand site structure before scraping specific pages.",
    parameters: Type.Object({
      url: Type.String({
        description: "The base URL to discover pages from",
      }),
    }),
    async execute(_id: string, params: { url: string }) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const resp = await fetch(`${apiUrl}/v1/map`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: params.url,
          maxDepth: 2,
          useSitemap: true,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `CRW map failed: ${resp.status} ${resp.statusText}`,
            },
          ],
        };
      }

      const result = await resp.json();
      const links =
        result.links || result.data?.links || [];

      if (links.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No URLs discovered." }],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${links.length} URLs:\n${links.join("\n")}`,
          },
        ],
      };
    },
  };
}
