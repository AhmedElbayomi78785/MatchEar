// Vercel serverless proxy for TheSportsDB, so fixtures load even when the
// browser can't call the API directly. Only the three endpoints the app uses.
export default async function handler(req, res) {
  const p = req.query.p || "";
  if (!/^(eventsnextleague|eventspastleague|lookupevent)\.php\?id=\d+$/.test(p)) {
    res.status(400).json({ error: "bad path" });
    return;
  }
  try {
    const r = await fetch("https://www.thesportsdb.com/api/v1/json/123/" + p);
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
}
