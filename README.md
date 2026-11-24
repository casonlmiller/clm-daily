# CLM Daily

A personal daily dashboard that works as an installable web app.

- **News:** a short US and world brief with notes on bias and sources
- **Vocab:** one word a day with a quick knowledge check
- **Topic:** a weekly subject with a short lesson and question each day
- **Quote:** a daily quote with background on the person and the idea
- **Grocery:** a simple shopping list
- **Stretch:** a toe-touch routine with a timer and a long-term goal
- **Settings:** theme, accent color, bottom-bar tabs, game mode, backup and restore

## Run it locally
```
npm start
```
Then open http://localhost:5173. (Any static server works, for example `python -m http.server`.)

## Check your changes
```
npm run check
```

## Put it on your phone
Host the folder anywhere that serves over HTTPS (GitHub Pages is free), open the link on your phone, and choose **Add to Home Screen**.

## Your data
Progress, streaks, groceries and settings are stored in the browser on each device. Use **Settings > Backup and restore** to export them. Phone and computer do not sync yet.

## Refresh the news
**Automatic:** a GitHub Action (`.github/workflows/site.yml`) runs every morning. It reads RSS feeds listed in `scripts/news-sources.json`, asks the Claude API to write the brief, commits `js/data/news.js`, and redeploys the site. It needs the repo secret `ANTHROPIC_API_KEY`. You can also run it from the repo's Actions tab ("Run workflow").

**Locally:**
```
npm run feeds        # check which feeds load (no API key needed)
npm run refresh:dry  # fetch feeds and build the prompt, no API call
npm run refresh      # real run; needs ANTHROPIC_API_KEY in your environment
npm test             # offline tests for the refresh code
```
The API is billed separately from a Claude subscription. Set a monthly spend limit in the Anthropic Console. You can also ask Claude Code to refresh the news by hand, but the next scheduled run overwrites it.
