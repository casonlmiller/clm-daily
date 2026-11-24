// Run with: node scripts/check.js
// Parses every JS file for syntax errors and validates the news brief's shape.
const fs = require("fs"), path = require("path"), vm = require("vm");
let bad = 0;
const fail = m => { console.error("FAIL " + m); bad++; };
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const root = path.join(__dirname, "..");
const { validateNews } = require("./lib/validate-news");
const files = [...walk(path.join(root, "js")), ...walk(path.join(root, "scripts")), path.join(root, "sw.js")].filter(f => f.endsWith(".js"));
for (const f of files) {
  try { new vm.Script(fs.readFileSync(f, "utf8"), { filename: f }); console.log("ok   " + path.relative(root, f)); }
  catch (e) { fail(path.relative(root, f) + ": " + e.message); }
}
try {
  const N = vm.runInNewContext(fs.readFileSync(path.join(root, "js/data/news.js"), "utf8") + "\n;NEWS");
  validateNews(N).forEach(m => fail("news: " + m));
  console.log(`ok   news brief for ${N.date}: ${N.items.length} stories`);
} catch (e) { fail("news.js: " + e.message); }
process.exit(bad ? 1 : 0);
