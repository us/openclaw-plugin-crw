import { createCrwScrapeTool } from "./crw-scrape-tool.js";
import { createCrwCrawlTool } from "./crw-crawl-tool.js";
import { createCrwMapTool } from "./crw-map-tool.js";
import { createCrwSearchTool } from "./crw-search-tool.js";

interface PluginApi {
  registerTool: (tool: unknown) => void;
  getConfig: () => Record<string, unknown>;
}

/**
 * OpenClaw plugin entry point for CRW web scraper.
 *
 * Provides four tools: crw_scrape, crw_crawl, crw_map, crw_search.
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
      apiUrl: (rawConfig.apiUrl as string) || "https://fastcrw.com/api",
      apiKey: rawConfig.apiKey as string | undefined,
    };

    api.registerTool(createCrwScrapeTool(config));
    api.registerTool(createCrwCrawlTool(config));
    api.registerTool(createCrwMapTool(config));
    api.registerTool(createCrwSearchTool(config));
  },
};
