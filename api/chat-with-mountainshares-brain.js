console.log('[DEBUG] ms-jarvis: Function file loaded!');
// api/chat-with-mountainshares-brain.js
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const PDF_DIR = path.join(process.cwd(), 'backendlib/brain/MsJarvisPDFs');
let paragraphs = [];
let loaded = false;

async function loadAllPdfs() {
  paragraphs = [];
  if (!fs.existsSync(PDF_DIR)) return;
  const fileList = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  for (const file of fileList) {
    const pdfPath = path.join(PDF_DIR, file);
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      let docs = data.text.split(/\n{2,}/g).map(s => s.trim()).filter(Boolean);
      docs.forEach((text, idx) => {
        paragraphs.push({
          file,
          index: idx,
          text
        });
      });
    } catch (err) {
      paragraphs.push({
        file,
        index: 0,
        text: `Failed to read ${pdfPath}: ${err && err.message ? err.message : err}`
      });
    }
  }
}

function semanticScore(a, b) {
  a = a.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  b = b.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const aWords = new Set(a.split(/\s+/).filter(Boolean));
  const bWords = new Set(b.split(/\s+/).filter(Boolean));
  let match = 0;
  aWords.forEach(word => { if (bWords.has(word)) match++; });
  return match / (1 + bWords.size);
}

function findSectionHeading(paragraphs, idx) {
  for (let i = idx; i >= Math.max(0, idx-3); i--) {
    const para = paragraphs[i].text.trim();
    if (/^[A-Z][A-Z \-:0-9]{5,}$/.test(para)) {
      return para.replace(/\n+/g, " ").trim();
    }
  }
  return null;
}

module.exports = async (req, res) => {
 console.log('[DEBUG] ms-jarvis: Handler entered for', (typeof req !== 'undefined' 
  && req.method) ? req.method : 'unknown');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    if (!loaded) {
      await loadAllPdfs();
      loaded = true;
    }
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
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
      reply = "I searched all MountainShares documents, darlin', but couldn't find any summary or section matching that question.";
      conf = 0.6;
    }

    res.status(200).json({
      reply,
      agent: 'mountainshares',
      time: Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err && err.message ? err.message : err });
  }
};
