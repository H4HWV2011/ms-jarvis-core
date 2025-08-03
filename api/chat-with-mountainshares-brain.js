// api/chat-with-mountainshares-brain.js
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Make sure MsJarvisPDFs folder exists and is inside your project repo
const PDF_DIR = path.join(process.cwd(), 'backendlib/brain/MsJarvisPDFs');
let paragraphs = [];

// On first call, read and split all PDFs into semantic paragraphs
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
          file: file,
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

// Only load once per cold start
let loaded = false;

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

export default async function handler(req, res) {
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
