const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const PDF_PATHS = [
  // <--- Paste your generated PDF_PATHS array here (see prior code) --->
  "/mnt/c/Users/aubre/Documents/MsJarvisPDFs/0x3aC96f8E7530CC12fF708763C03c28698914386a vs 0x49.pdf",
  // ...
  "/mnt/c/Users/aubre/Documents/MsJarvisPDFs/🪙 MountainShares Token Contract_ Core Economic Inf.pdf"
];

// ========== Load and split PDFs into paragraphs at startup ==========
let paragraphs = []; // { file, index, text } objects -- semantic chunks

async function loadAllPdfs() {
  paragraphs = [];
  for (const pdfPath of PDF_PATHS) {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      // Paragraph split: blank line or double newline or "\n\n"
      let docs = data.text.split(/\n{2,}/g).map(s => s.trim()).filter(Boolean);
      docs.forEach((text, idx) => {
        paragraphs.push({
          file: path.basename(pdfPath),
          index: idx,
          text
        });
      });
    } catch (err) {
      paragraphs.push({
        file: path.basename(pdfPath),
        index: 0,
        text: `Failed to read: ${pdfPath}, Error: ${err && err.message ? err.message : err}`
      });
    }
  }
  console.log(`MSJARVIS DOC AGENT: Loaded and split all MountainShares PDFs (${paragraphs.length} chunks).`);
}
loadAllPdfs();

// Simple semantic similarity function (bag of words overlap score)
function semanticScore(a, b) {
  a = a.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  b = b.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const aWords = new Set(a.split(/\s+/).filter(Boolean));
  const bWords = new Set(b.split(/\s+/).filter(Boolean));
  let match = 0;
  aWords.forEach(word => { if (bWords.has(word)) match++; });
  return match / (1 + bWords.size);
}

// Try to find section heading if present near this paragraph
function findSectionHeading(paragraphs, idx) {
  for (let i = idx; i >= Math.max(0, idx-3); i--) {
    const para = paragraphs[i].text.trim();
    if (/^[A-Z][A-Z \-:0-9]{5,}$/.test(para)) {
      return para.replace(/\n+/g, " ").trim();
    }
  }
  return null;
}

async function analyze(message) {
  const msg = (message || "").toLowerCase();
  if (msg.includes('mountainshares')) {
    const query = msg.replace('mountainshares', '').trim();
    if (query.length < 3) {
      // General intro/excerpt
      return {
        confidence: 0.96,
        reply: "Here's a preview from the MountainShares documentation:\n\n" + paragraphs.slice(0, 1)[0].text
      };
    }

    // Score every paragraph for semantic similarity
    let bestScore = 0;
    let bestIdx = -1;
    for (let i = 0; i < paragraphs.length; ++i) {
      const score = semanticScore(query, paragraphs[i].text);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestScore > 0.1 && bestIdx > -1) { // at least some word overlap
      let para = paragraphs[bestIdx].text.trim();
      // Find nearby section heading
      let heading = findSectionHeading(paragraphs, bestIdx);
      let reply = heading
        ? `Section: ${heading}\n\n${para}`
        : para;
      reply += `\n\n(Document: ${paragraphs[bestIdx].file})`;
      return { confidence: 0.99, reply };
    }

    // Fallback: couldn't find
    return {
      confidence: 0.7,
      reply: "I searched all MountainShares documents, darlin', but couldn't find a summary or section matching that question. Try a different phrase or be more specific."
    };
  }
  return { confidence: 0.1, reply: null };
}

module.exports = { analyze };
