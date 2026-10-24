import { chapters } from "./chapters.js";

const art = [
  "/images/cover-night-mail.png",
  "/images/panel-tara-1.png",
  "/images/panel-vikram-1.png",
  "/images/panel-vikram-2.png",
  "/images/panel-priya-3.png",
  "/images/panel-chotu-2.png",
  "/images/panel-bommi-1.png",
  "/images/panel-meera-3.png",
  "/images/panel-leela-2.png",
  "/images/panel-raja-4.png",
  "/images/panel-sana-2.png",
  "/images/panel-tara-4.png",
  "/images/cover-net-of-lights.png",
];

function splitParagraphs(text) {
  return text.trim().split(/\n\n+/).map((p) => p.replace(/\s+/g, " ").trim());
}

/** Amar Chitra Katha–style pages: one illustration + caption block per screen. */
export function buildAchPages() {
  const pages = [];
  let artIdx = 0;
  let pageNum = 0;

  pages.push({
    num: ++pageNum,
    type: "cover",
    title: "Night Ledger",
    subtitle: "A Thriller by Manish",
    image: "/images/cover-night-mail.png",
    caption: "Every name copied is a life unmade.",
  });

  for (const ch of chapters) {
    pages.push({
      num: ++pageNum,
      type: "chapter",
      chapter: ch.num,
      title: ch.title,
      image: art[artIdx % art.length],
      caption: "",
    });
    artIdx += 1;

    const paras = splitParagraphs(ch.text);
    for (const para of paras) {
      pages.push({
        num: ++pageNum,
        type: "story",
        chapter: ch.num,
        title: ch.title,
        image: art[artIdx % art.length],
        caption: para,
      });
      artIdx += 1;
    }
  }

  pages.push({
    num: ++pageNum,
    type: "end",
    title: "The End",
    image: "/images/hero-banner.png",
    caption: "Katha Studio Books · Original fiction by Manish",
  });

  return pages;
}

export const achPages = buildAchPages();
