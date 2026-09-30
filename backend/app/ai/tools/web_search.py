import asyncio
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import json
from typing import Dict, Any, List
from app.ai.tools.base import BaseTool
from app.core.logging import get_logger

logger = get_logger("tools.web_search")

class WebSearchTool(BaseTool):
    name = "web_search"
    description = (
        "Search the live web for real-time information, breaking news, sports fixtures, scores, "
        "current leaders, prices, technology updates, and fact-checking with direct URL links."
    )
    parameters = {
        "query": {
            "type": "string",
            "description": "The search query to look up on the web."
        }
    }

    async def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        logger.info(f"Executing web_search for: {query}")
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, self._sync_search, query)
        
        # Build summary and markdown sources
        summary_lines = []
        links_list = []
        seen_urls = set()

        for item in results:
            url = item.get("url", "").strip()
            title = item.get("title", "").strip()
            source = item.get("source", "Web").strip()
            snippet = item.get("snippet", "").strip()
            date = item.get("date", "").strip()

            if url and url not in seen_urls:
                seen_urls.add(url)
                links_list.append({"title": title, "url": url, "source": source})

            date_str = f" ({date[:16]})" if date else ""
            summary_lines.append(f"- [{source}{date_str}]: **{title}**\n  URL: {url}\n  Details: {snippet}")

        markdown_sources = ""
        if links_list:
            md_bullets = [f"- [{l['title']}]({l['url']}) — *{l['source']}*" for l in links_list[:6]]
            markdown_sources = "### 🌐 Sources & Verified Links\n" + "\n".join(md_bullets)

        return {
            "query": query,
            "status": "success" if results else "no_results",
            "results": results[:10],
            "links": links_list[:10],
            "markdown_sources": markdown_sources,
            "summary": "\n\n".join(summary_lines[:8]) if summary_lines else "No current web results found."
        }

    def _sync_search(self, query: str) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}

        # 1. Google News RSS (Live Real-Time Articles, Sports Fixtures, Current Events)
        try:
            url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as res:
                root = ET.fromstring(res.read())
                for item in root.findall(".//item")[:6]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pubDate_elem = item.find("pubDate")
                    source_elem = item.find("source")

                    title = title_elem.text if title_elem is not None and title_elem.text else ""
                    link = link_elem.text if link_elem is not None and link_elem.text else ""
                    pubDate = pubDate_elem.text if pubDate_elem is not None and pubDate_elem.text else ""
                    source_name = source_elem.text if source_elem is not None and source_elem.text else "Google News"

                    if title and link:
                        clean_title = re.sub(r"\s+", " ", title).strip()
                        # Remove trailing source if redundant
                        if " - " in clean_title:
                            parts = clean_title.rsplit(" - ", 1)
                            clean_title = parts[0]
                            if not source_name or source_name == "Google News":
                                source_name = parts[1]

                        items.append({
                            "title": clean_title,
                            "url": link,
                            "source": source_name,
                            "date": pubDate,
                            "snippet": clean_title
                        })
        except Exception as e:
            logger.debug(f"Google News RSS search exception: {e}")

        # 2. Wikipedia Search API (Factual Knowledge, Biographies, Official Overviews)
        try:
            wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&format=json"
            req_wiki = urllib.request.Request(wiki_url, headers=headers)
            with urllib.request.urlopen(req_wiki, timeout=5) as res:
                data = json.loads(res.read().decode("utf-8"))
                search_hits = data.get("query", {}).get("search", [])
                for hit in search_hits[:3]:
                    top_page = hit.get("title", "")
                    if top_page:
                        page_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(top_page.replace(' ', '_'))}"
                        raw_snippet = hit.get("snippet", "")
                        clean_snippet = re.sub(r"<[^>]+>", "", raw_snippet).strip()
                        items.append({
                            "title": top_page,
                            "url": page_url,
                            "source": "Wikipedia",
                            "date": "Verified Reference",
                            "snippet": clean_snippet or f"Comprehensive encyclopedia overview of {top_page}."
                        })
        except Exception as e:
            logger.debug(f"Wikipedia search exception: {e}")

        # 3. DuckDuckGo Instant Answers API (Quick Answers & Definitions)
        try:
            ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json&no_html=1"
            req_ddg = urllib.request.Request(ddg_url, headers=headers)
            with urllib.request.urlopen(req_ddg, timeout=5) as res:
                ddg_data = json.loads(res.read().decode("utf-8"))
                abstract = ddg_data.get("AbstractText", "")
                abstract_url = ddg_data.get("AbstractURL", "")
                heading = ddg_data.get("Heading", query)
                source = ddg_data.get("AbstractSource", "DuckDuckGo")

                if abstract and abstract_url:
                    items.append({
                        "title": heading,
                        "url": abstract_url,
                        "source": source,
                        "date": "Instant Fact",
                        "snippet": abstract
                    })

                for topic in ddg_data.get("RelatedTopics", [])[:2]:
                    if isinstance(topic, dict) and "FirstURL" in topic and "Text" in topic:
                        items.append({
                            "title": topic["Text"][:70] + ("..." if len(topic["Text"]) > 70 else ""),
                            "url": topic["FirstURL"],
                            "source": "DuckDuckGo Reference",
                            "date": "Live Reference",
                            "snippet": topic["Text"]
                        })
        except Exception as e:
            logger.debug(f"DuckDuckGo API search exception: {e}")

        return items
