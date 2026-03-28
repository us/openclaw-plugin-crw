import { createCrwScrapeTool } from "./crw-scrape-tool.js";
import { createCrwCrawlTool } from "./crw-crawl-tool.js";
import { createCrwMapTool } from "./crw-map-tool.js";

interface PluginApi {
  registerTool: (tool: unknown) => void;
  getConfig: () => Record<string, unknown>;
}

/**
 * OpenClaw plugin entry point for CRW web scraper.
 *
 * Provides three tools: crw_scrape, crw_crawl, crw_map.
 * Configure via openclaw.plugin.json with apiUrl and apiKey.
 */
export default {
  id: "crw",
  name: "CRW Web Scraper",
  description:
    "Fast, open-source web scraping tools powered by CRW. Scrape, crawl, and map websites for AI agents.",
  register(api: PluginApi) {
    const rawConfig = api.getConfig();
    const config = {
      apiUrl: (rawConfig.apiUrl as string) || "http://localhost:3000",
      apiKey: rawConfig.apiKey as string | undefined,
    };

    api.registerTool(createCrwScrapeTool(config));
    api.registerTool(createCrwCrawlTool(config));
    api.registerTool(createCrwMapTool(config));
  },
};
