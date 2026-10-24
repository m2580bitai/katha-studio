import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { nightLedger } from "../src/books/night-ledger/index.js";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "books");
fs.mkdirSync(outDir, { recursive: true });

const book = nightLedger;
const pages = book.achPages;
const w = 210;
const h = 297;
const margin = 14;
const cache = new Map();

function dataUrl(rel) {
  const file = path.join(root, "public", rel.replace(/^\//, ""));
  if (!fs.existsSync(file)) return null;
  if (!cache.has(file)) {
    const buf = fs.readFileSync(file);
    cache.set(file, `data:image/png;base64,${buf.toString("base64")}`);
  }
  return cache.get(file);
}

const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

for (let i = 0; i < pages.length; i++) {
  const pg = pages[i];
  if (i > 0) pdf.addPage();

  pdf.setFillColor(255, 243, 196);
  pdf.rect(0, 0, w, h, "F");
  pdf.setFillColor(196, 30, 10);
  pdf.rect(0, 0, w, 22, "F");
  pdf.setTextColor(255, 248, 234);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("KATHA STUDIO", margin, 10);
  pdf.setFontSize(9);
  pdf.text(book.title, margin, 16);
  pdf.setTextColor(26, 18, 8);

  const img = dataUrl(pg.image);
  if (img) {
    pdf.setDrawColor(26, 18, 8);
    pdf.setLineWidth(1.2);
    pdf.rect(margin, 26, w - margin * 2, 120);
    pdf.addImage(img, "PNG", margin + 2, 28, w - margin * 2 - 4, 116, undefined, "FAST");
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  let y = 154;
  if (pg.type === "cover") {
    pdf.setFontSize(22);
    pdf.text(pg.title, w / 2, y, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(pg.subtitle || "", w / 2, y + 10, { align: "center" });
    y += 22;
  } else if (pg.type === "chapter") {
    pdf.text(`Chapter ${pg.chapter}: ${pg.title}`, margin, y);
    y += 10;
  } else if (pg.type === "end") {
    pdf.text(pg.title, w / 2, y, { align: "center" });
    y += 10;
  }

  if (pg.caption) {
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(pg.caption, w - margin * 2);
    pdf.text(lines, margin, y + 4);
  }

  pdf.setFontSize(8);
  pdf.setTextColor(120, 100, 80);
  pdf.text(`${book.author} · page ${i + 1}`, w - margin, h - 8, { align: "right" });
}

const out = path.join(outDir, `${book.id}.pdf`);
fs.writeFileSync(out, Buffer.from(pdf.output("arraybuffer")));
console.log(`wrote ${out} (${pages.length} illustrated pages) · ${book.author}`);
