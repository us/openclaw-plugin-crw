# openclaw-plugin-crw

[![npm version](https://img.shields.io/npm/v/openclaw-plugin-crw)](https://www.npmjs.com/package/openclaw-plugin-crw)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[CRW](https://github.com/us/crw) web scraping plugin for [OpenClaw](https://github.com/openclaw/openclaw). Gives your AI agents the ability to scrape, crawl, and map websites.

## Installation

```bash
openclaw plugins install openclaw-plugin-crw
```

## Setup — Pick One

### Option A: Cloud ([fastcrw.com](https://fastcrw.com)) — Quickest Start

No server to install. [Sign up at fastcrw.com](https://fastcrw.com) and get **500 free credits** to start scraping. Then add your API key to your OpenClaw config:

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

That's it. Your agents can now scrape, crawl, and map any website.

### Option B: Self-hosted (free, no limits)

Run CRW on your own machine. No API key, no account, unlimited scraping.

```bash
# Install CRW (single binary, ~6 MB)
curl -fsSL https://raw.githubusercontent.com/us/crw/main/install.sh | bash
crw  # starts on http://localhost:3000

# Or use Docker
docker run -p 3000:3000 ghcr.io/us/crw:latest
```

```json
{
  "plugins": {
    "crw": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

No `apiKey` needed for self-hosted.

## Tools

| Tool | Description |
|------|-------------|
| `crw_scrape` | Scrape a single URL and get clean markdown |
| `crw_crawl` | BFS crawl a website, collect content from multiple pages |
| `crw_map` | Discover all URLs on a website via sitemap + link traversal |

## How It Works

Once installed and configured, your OpenClaw agents use the CRW tools automatically:

### Scrape a page

**User (via WhatsApp/Telegram/Discord):** "Summarize this article: https://example.com/blog/post"

**Agent uses `crw_scrape`** → gets clean markdown → summarizes → responds.

### Crawl an entire site

**User:** "Research everything on docs.example.com"

**Agent uses `crw_crawl`** → discovers and scrapes all pages → synthesizes findings → responds.

### Discover site structure

**User:** "What pages does example.com have?"

**Agent uses `crw_map`** → returns all discovered URLs via sitemap + link traversal.

## Example: URL Scraper Bot

A simple OpenClaw agent that scrapes any URL users send:

1. User sends a URL via WhatsApp/Telegram
2. Agent detects the URL and calls `crw_scrape`
3. CRW fetches the page (using [fastcrw.com](https://fastcrw.com) cloud or your local instance)
4. Agent receives clean markdown — no HTML noise, no nav/footer
5. Agent summarizes and replies

With fastcrw.com, no infrastructure needed — just plug in your API key and go.

## Compared to Firecrawl Plugin

| Feature | CRW Plugin | Firecrawl Plugin |
|---------|-----------|-----------------|
| Cloud option | [fastcrw.com](https://fastcrw.com) | firecrawl.dev |
| Self-hosted | Yes (single binary, ~6 MB) | Complex (5+ containers) |
| API key required | No (self-hosted) | Yes (always) |
| Idle RAM | ~6 MB | ~500 MB+ |
| Avg latency | 833ms | 4,600ms |
| Cost (self-hosted) | $0 | $0 but heavy infra |

## License

MIT
