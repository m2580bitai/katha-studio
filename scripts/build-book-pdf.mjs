import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { nightLedger } from "../src/books/night-ledger/index.js";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "books");
fs.mkdirSync(outDir, { recursive: true });

const book = nightLedger;
const w = 210;
const h = 297;
const margin = 22;
const bodyW = w - margin * 2;

function addRunningHeader(pdf, left, right) {
  pdf.setFont("times", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 90, 80);
  pdf.text(left, margin - 6, bodyW, { align: "left" });
  pdf.text(right, margin - 6, bodyW, { align: "right" });
}

function bodyParagraphs(pdf, text, startY) {
  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(26, 18, 8);
  const lines = pdf.splitTextToSize(text.trim(), bodyW);
  let y = startY;
  const lineH = 5.2;
  for (const line of lines) {
    if (y > h - margin - 10) {
      pdf.addPage();
      addRunningHeader(pdf, book.title.toUpperCase(), book.author);
      y = margin + 8;
    }
    pdf.text(line, margin, y);
    y += lineH;
  }
  return y;
}

const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

// Half-title
pdf.setTextColor(26, 18, 8);
pdf.setFont("times", "bold");
pdf.setFontSize(28);
pdf.text(book.title, w / 2, h / 2 - 10, { align: "center" });

pdf.addPage();
// Title page
pdf.setFontSize(32);
pdf.text(book.title, w / 2, 70, { align: "center" });
pdf.setFontSize(14);
pdf.setFont("times", "italic");
pdf.text(book.subtitle, w / 2, 82, { align: "center" });
pdf.setFont("times", "normal");
pdf.setFontSize(16);
pdf.text(book.author, w / 2, 100, { align: "center" });

pdf.addPage();
// Imprint (Harriman-style)
pdf.setFontSize(10);
pdf.text(book.imprint, margin, 40);
pdf.text("Katha Studio · Original fiction", margin, 48);
pdf.text("Chennai · katha-studio", margin, 56);
pdf.setFontSize(9);
const legal = `First published ${book.year}.
Copyright © ${book.year} ${book.author}. All rights reserved.
This is a work of fiction. Names, characters, places, and incidents are products of the author's imagination or are used fictitiously.
ISBN (Katha Studio): ${book.isbn}
For personal reading. Not for resale without permission.`;
pdf.text(pdf.splitTextToSize(legal, bodyW), margin, 72);

pdf.addPage();
// Dedication
pdf.setFont("times", "italic");
pdf.setFontSize(12);
pdf.text(book.dedication, w / 2, h / 2, { align: "center", maxWidth: 120 });

pdf.addPage();
// Contents
pdf.setFont("times", "bold");
pdf.setFontSize(18);
pdf.text("Contents", margin, 36);
pdf.setFont("times", "normal");
pdf.setFontSize(11);
let cy = 50;
for (const ch of book.chapters) {
  pdf.text(`${ch.num}. ${ch.title}`, margin, cy);
  cy += 7;
  if (cy > h - 30) {
    pdf.addPage();
    cy = margin + 10;
  }
}

pdf.addPage();
// Epigraph
pdf.setFont("times", "italic");
pdf.setFontSize(11);
let ey = 80;
for (const line of book.epigraph) {
  if (line.startsWith("—")) {
    pdf.text(line, w / 2, ey, { align: "center" });
    ey += 16;
  } else {
    const q = pdf.splitTextToSize(line, 120);
    pdf.text(q, w / 2, ey, { align: "center" });
    ey += q.length * 6 + 4;
  }
}

// Chapters
for (const ch of book.chapters) {
  pdf.addPage();
  addRunningHeader(pdf, book.title.toUpperCase(), book.author);
  pdf.setFont("times", "bold");
  pdf.setFontSize(36);
  pdf.setTextColor(226, 78, 27);
  pdf.text(String(ch.num), margin, margin + 14);
  pdf.setTextColor(26, 18, 8);
  pdf.setFontSize(16);
  pdf.text(ch.title.toUpperCase(), margin, margin + 28);
  bodyParagraphs(pdf, ch.text, margin + 40);
}

const out = path.join(outDir, `${book.id}.pdf`);
const buf = Buffer.from(pdf.output("arraybuffer"));
fs.writeFileSync(out, buf);
console.log(`wrote ${out} (${book.chapters.length} chapters)`);
