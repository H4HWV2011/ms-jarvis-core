export default async function handler(req, res) {
  // === Add CORS headers on every request ===
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or replace * with your domain for more security
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end(); // CORS preflight
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!loaded) {
    await loadAllPdfs();
    loaded = true;
  }
  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);
  const { message = '', userId = '' } = body || {};
  const msg = (message || '').toLowerCase();

  if (!msg.includes('mountainshares')) {
    res.status(200).json({ reply: null, agent: 'mountainshares', time: Date.now() });
    return;
  }
  const query = msg.replace('mountainshares', '').trim();

  if (query.length < 3 || paragraphs.length === 0) {
    res.status(200).json({
      reply: paragraphs.length > 0
        ? "Here's a preview from the MountainShares documentation:\n\n" + paragraphs[0].text
        : "Sorry! No PDFs loaded. Add files to MsJarvisPDFs and redeploy.",
      agent: 'mountainshares',
      time: Date.now()
    });
    return;
  }

  // Find best paragraph by semantic overlap
  let bestScore = 0, bestIdx = -1;
  for (let i = 0; i < paragraphs.length; ++i) {
    const score = semanticScore(query, paragraphs[i].text);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  let reply, conf;
  if (bestIdx > -1) {
    let para = paragraphs[bestIdx].text.trim();
    let heading = findSectionHeading(paragraphs, bestIdx);
    reply = heading
      ? `Section: ${heading}\n\n${para}`
      : para;
    reply += `\n\n(Document: ${paragraphs[bestIdx].file})`;
    conf = bestScore > 0.03 ? 0.99 : 0.75;
  } else {
    reply = "I searched all MountainShares documents, darlin', but couldn't find any summary or section matching that question. Try a different word or phrase!";
    conf = 0.6;
  }

  res.status(200).json({
    reply,
    agent: 'mountainshares',
    time: Date.now()
  });
}
