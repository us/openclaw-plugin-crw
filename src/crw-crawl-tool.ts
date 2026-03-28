import { Type } from "@sinclair/typebox";

interface CrwConfig {
  apiUrl: string;
  apiKey?: string;
}

export function createCrwCrawlTool(config: CrwConfig) {
  const { apiUrl, apiKey } = config;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return {
    name: "crw_crawl",
    description:
      "Crawl a website and return content from multiple pages. Discovers and scrapes linked pages via BFS traversal. Use this to gather information across an entire site.",
    parameters: Type.Object({
      url: Type.String({ description: "The base URL to start crawling from" }),
      maxPages: Type.Optional(
        Type.Number({
          description: "Maximum pages to crawl (default: 10)",
          default: 10,
        })
      ),
      maxDepth: Type.Optional(
        Type.Number({
          description: "Maximum link-follow depth (default: 2)",
          default: 2,
        })
      ),
    }),
    async execute(
      _id: string,
      params: { url: string; maxPages?: number; maxDepth?: number }
    ) {
      // Start crawl job
      const startResp = await fetch(`${apiUrl}/v1/crawl`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: params.url,
          maxPages: params.maxPages ?? 10,
          maxDepth: params.maxDepth ?? 2,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!startResp.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `CRW crawl start failed: ${startResp.status} ${startResp.statusText}`,
            },
          ],
        };
      }

      const startResult = await startResp.json();
      const jobId = startResult.id;
      if (!jobId) {
        return {
          content: [
            {
              type: "text" as const,
              text: `CRW crawl did not return a job ID`,
            },
          ],
        };
      }

      // Poll for completion
      const maxWait = 300_000; // 5 minutes
      const pollInterval = 2_000;
      let elapsed = 0;

      while (elapsed < maxWait) {
        await new Promise((r) => setTimeout(r, pollInterval));
        elapsed += pollInterval;

        const statusResp = await fetch(`${apiUrl}/v1/crawl/${jobId}`, {
          headers,
          signal: AbortSignal.timeout(30_000),
        });
        const statusData = await statusResp.json();

        if (statusData.status === "completed") {
          const pages = statusData.data || [];
          if (pages.length === 0) {
            return {
              content: [{ type: "text" as const, text: "Crawl completed but no pages found." }],
            };
          }
          const combined = pages
            .filter((p: { markdown?: string }) => p.markdown)
            .map((p: { markdown: string; metadata?: { sourceURL?: string } }) => {
              const source = p.metadata?.sourceURL || "unknown";
              return `## Source: ${source}\n\n${p.markdown}`;
            })
            .join("\n\n---\n\n");
          return {
            content: [
              {
                type: "text" as const,
                text: `Crawled ${pages.length} pages:\n\n${combined}`,
              },
            ],
          };
        }

        if (statusData.status === "failed") {
          return {
            content: [
              { type: "text" as const, text: `CRW crawl job failed: ${JSON.stringify(statusData)}` },
            ],
          };
        }

        if (!["scraping", "queued", "waiting"].includes(statusData.status)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `CRW crawl unexpected status: ${statusData.status}`,
              },
            ],
          };
        }
      }

      return {
        content: [
          { type: "text" as const, text: `CRW crawl timed out after ${maxWait / 1000}s` },
        ],
      };
    },
  };
}
