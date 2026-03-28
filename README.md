# openclaw-plugin-crw

[![npm version](https://img.shields.io/npm/v/openclaw-plugin-crw)](https://www.npmjs.com/package/openclaw-plugin-crw)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[CRW](https://github.com/us/crw) web scraping plugin for [OpenClaw](https://github.com/openclaw/openclaw). Gives your AI agents the ability to scrape, crawl, and map websites.

## Installation

```bash
openclaw plugins install openclaw-plugin-crw
```

## Setup — Pick One

### Option A: Self-hosted (free)

Run CRW on your own machine. No API key, no account, no limits.

```bash
# Install CRW
curl -fsSL https://raw.githubusercontent.com/us/crw/main/install.sh | bash

# Start the server (runs on http://localhost:3000)
crw

# Or use Docker
docker run -p 3000:3000 ghcr.io/us/crw:latest
```

Configure in your OpenClaw config:

```json
{
  "plugins": {
    "crw": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

### Option B: Cloud ([fastcrw.com](https://fastcrw.com))

No server to run. Get an API key from [fastcrw.com](https://fastcrw.com).

```json
{
  "plugins": {
    "crw": {
      "apiUrl": "https://fastcrw.com/api",
      "apiKey": "crw_live_..."
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `crw_scrape` | Scrape a single URL and get clean markdown |
| `crw_crawl` | BFS crawl a website, collect content from multiple pages |
| `crw_map` | Discover all URLs on a website via sitemap + link traversal |

## How It Works

Once installed and configured, your OpenClaw agents can use the CRW tools automatically:

**User (via WhatsApp/Telegram/etc):** "Summarize this article: https://example.com/blog/post"

**Agent uses `crw_scrape`** → gets clean markdown → summarizes it → sends response.

**User:** "Research everything on docs.example.com"

**Agent uses `crw_crawl`** → crawls all pages → synthesizes findings → sends report.

## Compared to Firecrawl Plugin

| Feature | CRW Plugin | Firecrawl Plugin |
|---------|-----------|-----------------|
| Self-hosted | Yes (single binary) | Complex (5+ containers) |
| Cloud option | Yes (fastcrw.com) | Yes (firecrawl.dev) |
| API key required | No (self-hosted) | Yes (always) |
| Idle RAM | ~6 MB | ~500 MB+ |
| Avg latency | 833ms | 4,600ms |

## License

MIT
