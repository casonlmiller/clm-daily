// Tiny dependency-free RSS 2.0 / Atom parser. Good enough for news headlines.
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };

function decode(s) {
  return String(s || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
}

function clean(raw) {
  let s = String(raw || "");
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, c) => c);
  s = decode(s);
  s = s.replace(/<[^>]*>/g, " "); // strip tags
  s = decode(s); // double-encoded entities
  return s.replace(/\s+/g, " ").trim();
}

function tag(block, name) {
  const re = new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function link(block) {
  const t = clean(tag(block, "link"));
  if (t) return t;
  const m = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  return m ? decode(m[1]) : "";
}

function parseFeed(xml) {
  const items = [];
  const re = /<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[2];
    const title = clean(tag(b, "title"));
    if (!title) continue;
    const desc = clean(tag(b, "description") || tag(b, "summary") || tag(b, "content"));
    const dateStr = clean(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date"));
    const t = Date.parse(dateStr);
    items.push({ title, summary: desc, link: link(b), time: Number.isNaN(t) ? null : t });
  }
  return items;
}

module.exports = { parseFeed, clean, decode };
