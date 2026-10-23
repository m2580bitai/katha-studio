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
const margin = 24;
const bodyW = w - margin * 2;
const headerY = 14;
const footerY = h - 12;
let pageNum = 0;

function serif(pdf, style = "normal") {
  pdf.setFont("times", style);
}

function addPageChrome(pdf, isChapter = false) {
  pageNum += 1;
  serif(pdf, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(90, 82, 72);
  pdf.text(book.title.toUpperCase(), margin, headerY);
  pdf.text(book.author, w - margin, headerY, { align: "right" });
  pdf.setDrawColor(200, 190, 175);
  pdf.setLineWidth(0.2);
  pdf.line(margin, headerY + 2, w - margin, headerY + 2);
  pdf.text(String(pageNum), w / 2, footerY, { align: "center" });
  if (isChapter) {
    pdf.setTextColor(26, 18, 8);
  }
}

function newBodyPage(pdf) {
  pdf.addPage();
  addPageChrome(pdf, true);
  return margin + 14;
}

function bodyParagraphs(pdf, text, startY) {
  const blocks = text.trim().split(/\n\n+/);
  let y = startY;
  const fontSize = 11.5;
  const lineH = 5.6;
  const indent = 6;

  serif(pdf, "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(26, 18, 8);

  blocks.forEach((block, bi) => {
    const lines = pdf.splitTextToSize(block.replace(/\s+/g, " ").trim(), bodyW);
    lines.forEach((line, li) => {
      if (y > footerY - 8) {
        y = newBodyPage(pdf);
      }
      const x = margin + (bi > 0 || li > 0 ? 0 : 0) + (li === 0 && bi > 0 ? indent : 0);
      const drawX = li === 0 && bi > 0 ? margin + indent : margin;
      pdf.text(line, drawX, y);
      y += lineH;
    });
    y += 2.5;
  });
  return y;
}

const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

// Half-title
pageNum = 0;
pdf.addPage();
pageNum = 1;
serif(pdf, "normal");
pdf.setTextColor(26, 18, 8);
pdf.setFontSize(26);
pdf.text(book.title, w / 2, h / 2 - 6, { align: "center" });

// Title page
pdf.addPage();
pageNum = 2;
serif(pdf, "bold");
pdf.setFontSize(34);
pdf.text(book.title, w / 2, 78, { align: "center" });
serif(pdf, "italic");
pdf.setFontSize(13);
pdf.text(book.subtitle, w / 2, 92, { align: "center" });
serif(pdf, "normal");
pdf.setFontSize(18);
pdf.text(book.author, w / 2, 112, { align: "center" });
pdf.setFontSize(10);
pdf.setTextColor(90, 82, 72);
pdf.text(book.imprint, w / 2, 128, { align: "center" });

// Imprint
pdf.addPage();
pageNum = 3;
serif(pdf, "bold");
pdf.setFontSize(11);
pdf.setTextColor(26, 18, 8);
pdf.text(book.imprint, margin, 42);
serif(pdf, "normal");
pdf.setFontSize(10);
const imprintLines = [
  "Katha Studio",
  "Original fiction · katha-studio",
  "",
  `First published ${book.year}.`,
  `Copyright © ${book.year} ${book.author}. All rights reserved.`,
  "",
  "This is a work of fiction. Names, characters, places, and incidents are the product of the author's imagination or are used fictitiously.",
  "",
  `ISBN (Katha Studio): ${book.isbn}`,
  "For personal reading. Not for resale without permission.",
];
let iy = 52;
for (const line of imprintLines) {
  if (line === "") {
    iy += 4;
    continue;
  }
  const wrapped = pdf.splitTextToSize(line, bodyW);
  pdf.text(wrapped, margin, iy);
  iy += wrapped.length * 5 + 2;
}

// Dedication
pdf.addPage();
pageNum = 4;
serif(pdf, "italic");
pdf.setFontSize(12);
pdf.setTextColor(26, 18, 8);
pdf.text(pdf.splitTextToSize(book.dedication, 110), w / 2, h / 2 - 10, { align: "center" });

// Contents
pdf.addPage();
pageNum = 5;
addPageChrome(pdf);
serif(pdf, "bold");
pdf.setFontSize(20);
pdf.setTextColor(26, 18, 8);
pdf.text("Contents", margin, margin + 12);
serif(pdf, "normal");
pdf.setFontSize(11);
let cy = margin + 26;
for (const ch of book.chapters) {
  if (cy > footerY - 10) {
    pdf.addPage();
    pageNum += 1;
    addPageChrome(pdf);
    cy = margin + 14;
  }
  pdf.text(String(ch.num), margin, cy);
  pdf.text(ch.title, margin + 10, cy);
  cy += 7;
}

// Epigraph
pdf.addPage();
pageNum += 1;
addPageChrome(pdf);
serif(pdf, "italic");
pdf.setFontSize(11.5);
let ey = 72;
for (const line of book.epigraph) {
  if (line.startsWith("—")) {
    serif(pdf, "italic");
    pdf.setFontSize(10);
    pdf.text(line, w / 2, ey, { align: "center" });
    ey += 18;
  } else {
    serif(pdf, "italic");
    pdf.setFontSize(11.5);
    const q = pdf.splitTextToSize(line, 118);
    pdf.text(q, w / 2, ey, { align: "center" });
    ey += q.length * 6 + 8;
  }
}

// Chapters
for (const ch of book.chapters) {
  pdf.addPage();
  pageNum += 1;
  addPageChrome(pdf, true);

  serif(pdf, "bold");
  pdf.setFontSize(40);
  pdf.setTextColor(226, 78, 27);
  pdf.text(String(ch.num), margin, margin + 18);
  pdf.setTextColor(26, 18, 8);
  pdf.setFontSize(14);
  serif(pdf, "bold");
  pdf.text(ch.title.toUpperCase(), margin, margin + 32);
  serif(pdf, "normal");
  bodyParagraphs(pdf, ch.text, margin + 44);
}

const out = path.join(outDir, `${book.id}.pdf`);
fs.writeFileSync(out, Buffer.from(pdf.output("arraybuffer")));
console.log(`wrote ${out} (${book.chapters.length} chapters) · ${book.author}`);
