// One call from the browser, everything server-side. Fetches each league's
// seed event, expands it to the full round, and returns the lot. Vercel's
// edge cache holds the answer for 5 minutes, so all visitors share ~20
// upstream calls instead of firing their own.
const API = "https://www.thesportsdb.com/api/v1/json/123/";
const LEAGUE_IDS = [4429, 4502, 4499, 4496, 4720, 4480, 4481, 4328, 4335, 4332];

async function j(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error("http " + r.status);
  return r.json();
}

async function league(id) {
  try {
    const next = await j("eventsnextleague.php?id=" + id);
    let events = (next && next.events) || [];
    const seed = events[0];
    if (seed && seed.intRound && seed.strSeason) {
      const r = parseInt(seed.intRound, 10);
      if (r) {
        try {
          const round = await j("eventsround.php?id=" + id + "&r=" + r + "&s=" + encodeURIComponent(seed.strSeason));
          if (round && round.events && round.events.length) events = round.events;
        } catch (e) { /* keep the seed */ }
      }
    }
    return events;
  } catch (e) {
    return null; // this league failed; the client shows a note for it
  }
}

export default async function handler(req, res) {
  const out = {};
  // chunks of 4 keeps us gentle with the upstream rate limit
  for (let i = 0; i < LEAGUE_IDS.length; i += 4) {
    const chunk = LEAGUE_IDS.slice(i, i + 4);
    const results = await Promise.all(chunk.map(league));
    chunk.forEach((id, k) => { out[id] = results[k]; });
  }
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ leagues: out });
}
