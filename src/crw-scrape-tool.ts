import { Type } from "@sinclair/typebox";

interface CrwConfig {
  apiUrl: string;
  apiKey?: string;
}

export function createCrwScrapeTool(config: CrwConfig) {
  const { apiUrl, apiKey } = config;

  return {
    name: "crw_scrape",
    description:
      "Scrape a webpage and return clean markdown content. Use this to get the full text content of any URL. Returns clean markdown with navigation, footers, and boilerplate removed.",
    parameters: Type.Object({
      url: Type.String({ description: "The URL to scrape" }),
    }),
    async execute(_id: string, params: { url: string }) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const resp = await fetch(`${apiUrl}/v1/scrape`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: params.url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(120_000),
      });

      if (!resp.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `CRW scrape failed: ${resp.status} ${resp.statusText}`,
            },
          ],
        };
      }

      const result = await resp.json();
      const data = result.data || {};
      const content =
        data.markdown || data.plainText || data.html || "No content extracted";
      const title = data.metadata?.title || "";
      const source = data.metadata?.sourceURL || params.url;

      return {
        content: [
          {
            type: "text" as const,
            text: title
              ? `# ${title}\nSource: ${source}\n\n${content}`
              : `Source: ${source}\n\n${content}`,
          },
        ],
      };
    },
  };
}
