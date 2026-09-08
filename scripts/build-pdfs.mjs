import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { comics } from "../src/comics.js";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "pdfs");
fs.mkdirSync(outDir, { recursive: true });

function dataUrl(rel) {
  const file = path.join(root, "public", rel.replace(/^\//, ""));
  const buf = fs.readFileSync(file);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function filename(title) {
  return `${title.replace(/[^\w]+/g, "-")}.pdf`;
}

for (const comic of comics) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = 210;
  const h = 297;

  pdf.setFillColor(26, 18, 8);
  pdf.rect(0, 0, w, h, "F");
  pdf.setTextColor(243, 230, 204);
  pdf.setFont("times", "bold");
  pdf.setFontSize(28);
  pdf.text("KATHA STUDIO", 16, 40);
  pdf.setFontSize(22);
  pdf.text(comic.title, 16, 58);
  pdf.setFont("times", "italic");
  pdf.setFontSize(13);
  pdf.text(pdf.splitTextToSize(comic.logline, 178), 16, 72);
  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  pdf.text(`${comic.issue}  ·  ${comic.genre}  ·  ${comic.place}`, 16, 92);
  pdf.text(`Lead: ${comic.hero}`, 16, 100);
  pdf.text("Original Indian comic  ·  For personal reading", 16, 270);
  pdf.addImage(dataUrl(comic.cover), "PNG", 42, 112, 126, 168, undefined, "FAST");

  for (let i = 0; i < comic.pages.length; i++) {
    const page = comic.pages[i];
    pdf.addPage();
    pdf.setFillColor(243, 230, 204);
    pdf.rect(0, 0, w, h, "F");
    pdf.setDrawColor(26, 18, 8);
    pdf.setLineWidth(0.8);
    pdf.rect(8, 8, 194, 281);
    pdf.setTextColor(26, 18, 8);
    pdf.setFont("times", "bold");
    pdf.setFontSize(14);
    pdf.text(`${comic.title}  ·  ${comic.issue}`, 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Panel ${i + 1} of ${comic.pages.length}`, 14, 25);
    pdf.addImage(dataUrl(page.image), "PNG", 14, 30, 182, 118, undefined, "FAST");
    pdf.setFont("times", "italic");
    pdf.setFontSize(12);
    pdf.text(pdf.splitTextToSize(page.caption, 178), 16, 160);
    pdf.setFillColor(255, 253, 246);
    pdf.roundedRect(16, 188, 178, 52, 4, 4, "FD");
    pdf.setFont("times", "bold");
    pdf.setFontSize(10);
    pdf.text(String(page.speaker).toUpperCase(), 22, 200);
    pdf.setFont("times", "normal");
    pdf.setFontSize(13);
    pdf.text(pdf.splitTextToSize(`“${page.balloon}”`, 166), 22, 210);
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.text(page.sfx, 16, 256);
    pdf.setFontSize(9);
    pdf.setFont("times", "italic");
    pdf.text("Katha Studio  ·  Original work", 16, 278);
  }

  const dest = path.join(outDir, filename(comic.title));
  fs.writeFileSync(dest, Buffer.from(pdf.output("arraybuffer")));
  console.log("wrote", dest);
}
