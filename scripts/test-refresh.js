// Run with: node scripts/test-refresh.js  (no network needed)
const assert = require("assert"), vm = require("vm");
const { parseFeed } = require("./lib/rss");
const { validateNews } = require("./lib/validate-news");
const R = require("./refresh-news");

let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok   " + name); };

const RSS = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Senate &amp; House <b>vote</b>]]></title><link>https://a.test/1</link>
<description>&lt;p&gt;Lawmakers met &amp;amp; talked&lt;/p&gt;</description><pubDate>Mon, 23 Nov 2026 12:00:00 GMT</pubDate></item>
<item><title>Old story</title><link>https://a.test/2</link><description>x</description><pubDate>Mon, 16 Nov 2026 12:00:00 GMT</pubDate></item>
<item><title>Undated</title><link>https://a.test/3</link></item></channel></rss>`;
const ATOM = `<feed><entry><title>Atom item</title><link href="https://b.test/1"/><summary>Sum</summary><updated>2026-11-23T10:00:00Z</updated></entry></feed>`;

t("rss parses CDATA, entities, tags", () => {
  const it = parseFeed(RSS);
  assert.equal(it.length, 3);
  assert.equal(it[0].title, "Senate & House vote");
  assert.equal(it[0].summary, "Lawmakers met & talked");
  assert.equal(it[0].link, "https://a.test/1");
});
t("atom parses href links", () => {
  const it = parseFeed(ATOM);
  assert.equal(it[0].link, "https://b.test/1"); assert.equal(it[0].summary, "Sum");
});
t("age filter drops old, keeps undated, caps count", () => {
  const now = Date.parse("2026-11-23T18:00:00Z");
  const out = R.filterItems(parseFeed(RSS), { maxAgeHours: 36, maxItemsPerFeed: 12 }, now);
  assert.deepEqual(out.map(i => i.title), ["Senate & House vote", "Undated"]);
  assert.equal(R.filterItems(parseFeed(RSS), { maxAgeHours: 9999, maxItemsPerFeed: 1 }, now).length, 1);
});
t("timezone date and label use Chicago", () => {
  const d = new Date("2026-11-24T05:30:00Z");
  assert.equal(R.localDate(d, "America/Chicago"), "2026-11-23");
  assert.equal(R.dateLabel(d, "America/Chicago"), "Monday, Nov 23");
});
const good = (r, h, s) => ({ r, h, w: "Something happened, per BBC News.", y: "It matters.", p: "", s });
const opts = { allowedSources: ["BBC News", "NPR"], stories: { US: 2, W: 2 }, date: "2026-11-23", label: "Monday, Nov 23" };
t("normalize filters unknown sources, caps, removes em dashes", () => {
  const N = R.normalize({
    also: ["a", "b", "c", "d"],
    items: [good("US", "One — two", ["BBC News", "Fake"]), good("US", "B", ["NPR"]), good("US", "C", ["NPR"]),
      good("W", "D", ["BBC News"]), good("W", "Unsourced", ["Nobody"]), { r: "X", h: "bad", w: "w", y: "y", s: ["NPR"] }]
  }, opts);
  assert.equal(N.items.length, 3); // 2 US (capped) + 1 W (unsourced dropped)
  assert.equal(N.items[0].h, "One, two");
  assert.deepEqual(N.items[0].s, ["BBC News"]);
  assert.equal(N.also.length, 3);
});
t("normalize rejects too few stories", () => {
  assert.throws(() => R.normalize({ items: [good("US", "A", ["NPR"])], also: [] }, opts), /usable stories/);
});
t("rendered file evaluates and validates", () => {
  const N = R.normalize({ also: [], items: [good("US", "A", ["NPR"]), good("US", "B", ["NPR"]), good("W", "C", ["BBC News"])] }, opts);
  const file = R.renderFile(N);
  assert.ok(file.includes("/*NEWS_START*/") && file.includes("/*NEWS_END*/"));
  const back = vm.runInNewContext(file + "\n;NEWS");
  assert.deepEqual(validateNews(back), []);
  assert.equal(back.date, "2026-11-23");
});
t("validator catches problems", () => {
  assert.ok(validateNews({ date: "x", items: [] }).length >= 3);
});
t("prompt lists numbered items with lean", () => {
  const p = R.buildPrompt([{ feed: { name: "NPR", lean: "center-left", section: "US" }, items: [{ title: "T", summary: "S" }] }], { stories: { US: 3, W: 3 } }, "Monday, Nov 23");
  assert.ok(p.includes("## NPR (lean: center-left") && p.includes("[1] T :: S"));
});
t("cli output: structured_output, text fallback, errors", () => {
  const brief = { also: [], items: [] };
  assert.deepEqual(R.parseCliOutput(JSON.stringify({ type: "result", subtype: "success", is_error: false, structured_output: brief })), brief);
  assert.deepEqual(R.parseCliOutput(JSON.stringify({ subtype: "success", result: "Here: " + JSON.stringify(brief) })), brief);
  assert.throws(() => R.parseCliOutput(JSON.stringify({ subtype: "success", is_error: true, result: "Invalid API key" })), /Invalid API key/);
  assert.throws(() => R.parseCliOutput("not json"), /non-JSON/);
});
t("cli system prompt drops the tool-call line", () => {
  assert.ok(!R.SYSTEM_CLI.includes("submit_brief") && R.SYSTEM_CLI.includes("JSON matching the given schema"));
});
t("story text is capped at three sentences, abbreviations kept", () => {
  assert.equal(R.capSentences("One here. The U.S. Senate met. Dr. Lee spoke. Four is cut.", 3), "One here. The U.S. Senate met. Dr. Lee spoke.");
  assert.equal(R.capSentences("Short one.", 3), "Short one.");
  assert.equal(R.capSentences("He said \"no.\" Then left! Why? Gone.", 3), "He said \"no.\" Then left! Why?");
});
console.log(`\n${n} tests passed`);
