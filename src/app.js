import { comics, characters, studio, comicById, comicVideo } from "./comics.js";
import { lifeReels, lifeReelById } from "./life-reels.js";
import { proseBooks, bookById } from "./books.js";

const app = document.getElementById("app");
let autoTimer = null;

function asset(path) {
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;
}

function path() {
  const hash = location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

function go(href) {
  location.hash = href;
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function nav(active) {
  return `
    <header class="wrap nav">
      <a class="brand" href="#/">
        <img src="${asset("images/favicon.png")}" alt="" />
        <strong>Katha Studio</strong>
      </a>
      <nav class="nav-links">
        <a href="#/" ${active === "home" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Home</a>
        <a href="#/library" ${active === "library" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Comics</a>
        <a href="#/books" ${active === "books" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Books</a>
        <a href="#/characters" ${active === "characters" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Characters</a>
        <a href="#/reels" ${active === "reels" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Life reels</a>
      </nav>
    </header>
  `;
}

function footer() {
  return `
    <footer class="wrap footer">
      <span>Original Indian characters and stories. Not affiliated with any existing comic house.</span>
      <span>Comics · Thriller books · Life reels · Download PDFs</span>
    </footer>
  `;
}

function comicCard(c) {
  return `
    <article class="card">
      <a href="#/read/${c.id}" style="color:inherit;text-decoration:none;display:flex;flex-direction:column;flex:1">
        <img src="${asset(c.cover)}" alt="${c.title} cover" />
        <div class="card-body">
          <div class="meta">${c.issue} · ${c.genre} · ${c.place}</div>
          <h3>${c.title}</h3>
          <p>${c.logline}</p>
        </div>
      </a>
      <div style="display:flex;gap:8px;padding:0 14px 14px;flex-wrap:wrap">
        <a class="chip" href="#/read/${c.id}">Read animated</a>
        <a class="chip" href="#/watch/${c.id}">Watch video</a>
        <a class="chip" href="${asset(c.pdf)}" download>Download PDF</a>
      </div>
    </article>
  `;
}

function home() {
  return `
    ${nav("home")}
    <section class="wrap hero">
      <div>
        <div class="kicker">Animated comics from India</div>
        <h1>Stories that remember rain, rail, mud, ghazals, and flying autos.</h1>
        <p class="lede">${studio.blurb}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/library">Open the library</a>
          <a class="btn" href="#/read/${comics[0].id}">Start with Monsoon Meera</a>
        </div>
      </div>
      <div class="hero-art">
        <img src="${asset("images/hero-banner.png")}" alt="Katha Studio characters collage" />
        <div class="stamp">10 books · video + PDF</div>
      </div>
    </section>
    <section class="wrap section">
      <h2>This week’s rack</h2>
      <div class="grid">${comics.map(comicCard).join("")}</div>
    </section>
    <section class="wrap section">
      <div class="kicker">Katha Studio Books</div>
      <h2>Long-form fiction — start with the thriller.</h2>
      <p class="lede">${proseBooks[0].logline}</p>
      <a class="btn btn-primary" href="#/books/${proseBooks[0].id}">Read Night Ledger</a>
    </section>
    <section class="wrap section">
      <div class="kicker">New · voiced life stories</div>
      <h2>Seven reels that sound like real people.</h2>
      <p class="lede">Hindi voice, moving characters, no dialogue on screen — watch in the browser or download for Instagram.</p>
      <a class="btn btn-primary" href="#/reels">Open life reels</a>
    </section>
    ${footer()}
  `;
}

function library() {
  return `
    ${nav("library")}
    <section class="wrap section">
      <div class="kicker">All books</div>
      <h2>Pick a book. Play it. Take the PDF.</h2>
      <p class="lede">Each title is a 22-page original story. Watch the voiced HD video, read it as a motion comic, or download the A4 PDF.</p>
      <div class="grid" style="margin-top:22px">${comics.map(comicCard).join("")}</div>
    </section>
    ${footer()}
  `;
}

function charactersPage() {
  return `
    ${nav("characters")}
    <section class="wrap section">
      <div class="kicker">Cast</div>
      <h2>People the country already almost knew.</h2>
      <div class="grid char-grid" style="margin-top:22px">
        ${characters
          .map(
            (ch) => `
          <article class="card char-card">
            <img src="${asset(ch.portrait)}" alt="${ch.name}" />
            <div class="card-body">
              <div class="meta">${ch.role} · ${ch.place}</div>
              <h3>${ch.name}</h3>
              <p>${ch.bio}</p>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
    ${footer()}
  `;
}

function fxFor(mood) {
  if (mood === "rain") return '<div class="fx-rain"></div>';
  if (mood === "dust") return '<div class="fx-dust"></div>';
  return "";
}

function reader(comic, pageIndex, autoplay) {
  const page = comic.pages[pageIndex];
  const n = comic.pages.length;
  return `
    ${nav("library")}
    <section class="wrap">
      <div class="reader-top">
        <div>
          <div class="kicker">${comic.issue} · ${comic.place}</div>
          <h2>${comic.title}</h2>
          <p class="lede" style="margin:0">${comic.logline}</p>
        </div>
        <div class="controls">
          <button class="btn" data-act="prev" ${pageIndex === 0 ? "disabled" : ""}>Back</button>
          <button class="btn" data-act="next" ${pageIndex === n - 1 ? "disabled" : ""}>Next panel</button>
          <button class="btn ${autoplay ? "btn-teal" : ""}" data-act="auto">${autoplay ? "Stop autoplay" : "Autoplay"}</button>
          <a class="btn btn-primary" href="${asset(comic.pdf)}" download>Download PDF</a>
          <a class="btn" href="#/watch/${comic.id}">Watch video</a>
        </div>
      </div>
      <div class="progress">${comic.pages.map((_, i) => `<i class="${i <= pageIndex ? "on" : ""}"></i>`).join("")}</div>
      <p class="page-num">Page ${pageIndex + 1} / ${n} · ${comic.hero}</p>
      <div class="stage enter" style="border-color:${comic.accent}">
        <img src="${asset(page.image)}" alt="${comic.title} page ${pageIndex + 1}" />
        ${fxFor(comic.mood)}
        <div class="sfx">${page.sfx}</div>
        <div class="balloon">
          <span class="who">${page.speaker}</span>
          ${page.balloon}
        </div>
        <div class="caption-bar">${page.caption}</div>
      </div>
      <article class="story-block">
        <h3>The page in full</h3>
        <p>${page.story || page.caption}</p>
      </article>
      <p style="color:var(--ink-soft);margin:16px 0 36px">Tip: arrow keys turn pages. Space toggles autoplay. Each book is 22 pages, downloadable as a full A4 PDF.</p>
    </section>
    ${footer()}
  `;
}

function notFound() {
  return `${nav("home")}<section class="wrap section"><h2>That issue wandered off.</h2><a class="btn" href="#/library">Back to library</a></section>`;
}

function parseWatch() {
  const parts = path().split("/").filter(Boolean);
  if (parts[0] !== "watch") return null;
  return comicById(parts[1]) || null;
}

function reelCard(reel) {
  const src = asset(reel.video);
  const poster = asset(reel.poster);
  return `
    <article class="reel-card">
      <a href="#/reels/${reel.id}" class="reel-thumb-link">
        <div class="reel-phone">
          <video class="reel-preview" muted playsinline preload="metadata" poster="${poster}">
            <source src="${src}" type="video/mp4" />
          </video>
        </div>
      </a>
      <div class="reel-card-body">
        <div class="meta">${reel.theme}</div>
        <h3><a href="#/reels/${reel.id}" style="color:inherit;text-decoration:none">${reel.title}</a></h3>
        <p>${reel.end}</p>
        <div class="reel-actions">
          <a class="chip" href="#/reels/${reel.id}">Watch</a>
          <a class="chip btn-teal" href="${src}" download="${reel.downloadName}">Download MP4</a>
        </div>
      </div>
    </article>
  `;
}

function reelsPage() {
  return `
    ${nav("reels")}
    <section class="wrap section">
      <div class="kicker">Life stories · 9:16</div>
      <h2>Relatable reels with Hindi voice.</h2>
      <p class="lede">Characters speak — captions stay off the video. On mobile, tap play or use Download to save for Instagram. Full scripts are voiced (about 60–80 seconds each, 1080×1920).</p>
      <div class="reel-grid">${lifeReels.map(reelCard).join("")}</div>
    </section>
    ${footer()}
  `;
}

function parseReel() {
  const parts = path().split("/").filter(Boolean);
  if (parts[0] !== "reels") return null;
  if (!parts[1]) return { list: true };
  return lifeReelById(parts[1]) || false;
}

function reelWatchPage(reel) {
  const src = asset(reel.video);
  const poster = asset(reel.poster);
  return `
    ${nav("reels")}
    <section class="wrap section reel-watch">
      <div class="kicker">${reel.theme}</div>
      <h2>${reel.title}</h2>
      <p class="lede">${reel.end}</p>
      <div class="reel-phone reel-phone--solo">
        <video class="reel-player" controls playsinline preload="metadata" poster="${poster}">
          <source src="${src}" type="video/mp4" />
        </video>
      </div>
      <p class="reel-hint">Turn sound on. Dialogue is voice-only — no text on the video.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${src}" download="${reel.downloadName}">Download for Instagram</a>
        <a class="btn" href="#/reels">All reels</a>
      </div>
      <p class="reel-caption-meta">${reel.caption}</p>
    </section>
    ${footer()}
  `;
}

function bindReelPreviews() {
  app.querySelectorAll(".reel-preview").forEach((v) => {
    v.addEventListener("mouseenter", () => {
      v.play().catch(() => {});
    });
    v.addEventListener("mouseleave", () => {
      v.pause();
      v.currentTime = 0;
    });
  });
}

function watchPage(comic) {
  const src = asset(comicVideo(comic));
  return `
    ${nav("library")}
    <section class="wrap section">
      <div class="kicker">${comic.issue} · voiced motion comic</div>
      <h2>${comic.title}</h2>
      <p class="lede">${comic.logline}</p>
      <video class="trailer" controls playsinline preload="metadata" poster="${asset(comic.cover)}">
        <source src="${src}" type="video/mp4" />
      </video>
      <p style="color:var(--ink-soft);margin:12px 0 0">Voiced 16:9 HD video of the full 22-page book. Press play to hear narration and dialogue.</p>
      <div class="hero-actions" style="margin-top:16px">
        <a class="btn btn-primary" href="#/read/${comic.id}">Read the book</a>
        <a class="btn" href="${asset(comic.pdf)}" download>Download PDF</a>
        <a class="btn" href="#/library">Library</a>
      </div>
    </section>
    ${footer()}
  `;
}

function bookCard(book) {
  return `
    <article class="card book-card">
      <a href="#/books/${book.id}" style="color:inherit;text-decoration:none;display:flex;gap:16px;flex:1">
        <img src="${asset(book.cover)}" alt="${book.title} cover" class="book-cover-thumb" />
        <div class="card-body">
          <div class="meta">${book.kind} · ${book.year} · ${book.imprint}</div>
          <h3>${book.title}</h3>
          <p class="book-tagline">${book.tagline}</p>
          <p>${book.logline}</p>
        </div>
      </a>
      <div style="display:flex;gap:8px;padding:0 14px 14px;flex-wrap:wrap">
        <a class="chip" href="#/books/${book.id}">Read online</a>
        <a class="chip btn-teal" href="${asset(book.pdf)}" download="${book.title.replace(/\s+/g, "-")}.pdf">Download PDF</a>
      </div>
    </article>
  `;
}

function booksPage() {
  return `
    ${nav("books")}
    <section class="wrap section">
      <div class="kicker">Katha Studio Books</div>
      <h2>Full-length fiction — proper chapters, print-ready PDF.</h2>
      <p class="lede">Original novels with professional front matter: title page, contents, epigraph, and numbered chapters—formatted like a published trade paperback.</p>
      <div class="book-list">${proseBooks.map(bookCard).join("")}</div>
    </section>
    ${footer()}
  `;
}

function parseBook() {
  const parts = path().split("/").filter(Boolean);
  if (parts[0] !== "books") return null;
  if (!parts[1]) return { list: true };
  const book = bookById(parts[1]);
  if (!book) return false;
  const ch = Math.max(0, parseInt(parts[2] || "0", 10) || 0);
  return { book, chapter: Math.min(ch, book.chapters.length - 1) };
}

function bookReader(book, chapterIndex) {
  const ch = book.chapters[chapterIndex];
  const n = book.chapters.length;
  const paras = ch.text
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, " ")}</p>`)
    .join("");
  return `
    ${nav("books")}
    <section class="wrap book-reader">
      <div class="reader-top">
        <div>
          <div class="kicker">${book.author} · ${book.subtitle}</div>
          <h2>${book.title}</h2>
          <p class="lede book-tagline">${book.tagline}</p>
        </div>
        <div class="controls">
          <button class="btn" data-book-act="prev" ${chapterIndex === 0 ? "disabled" : ""}>Previous</button>
          <button class="btn" data-book-act="next" ${chapterIndex === n - 1 ? "disabled" : ""}>Next chapter</button>
          <a class="btn btn-primary" href="${asset(book.pdf)}" download>Download PDF</a>
          <a class="btn" href="#/books">All books</a>
        </div>
      </div>
      <p class="page-num">Chapter ${ch.num} of ${n} · ${ch.title}</p>
      <article class="book-chapter">
        <h3 class="chapter-title"><span class="chapter-num">${ch.num}</span><span>${ch.title}</span></h3>
        <div class="book-prose">${paras}</div>
      </article>
      <p class="book-meta-footer">${book.imprint} · ${book.year}</p>
    </section>
    ${footer()}
  `;
}

function bindBookReader(book, chapterIndex) {
  app.querySelectorAll("[data-book-act]").forEach((el) => {
    el.addEventListener("click", () => {
      const act = el.getAttribute("data-book-act");
      if (act === "prev") go(`#/books/${book.id}/${Math.max(0, chapterIndex - 1)}`);
      if (act === "next") go(`#/books/${book.id}/${Math.min(book.chapters.length - 1, chapterIndex + 1)}`);
    });
  });
  window.onkeydown = (e) => {
    if (e.key === "ArrowRight") go(`#/books/${book.id}/${Math.min(book.chapters.length - 1, chapterIndex + 1)}`);
    if (e.key === "ArrowLeft") go(`#/books/${book.id}/${Math.max(0, chapterIndex - 1)}`);
  };
}

function parseRead() {
  const parts = path().split("/").filter(Boolean);
  if (parts[0] !== "read") return null;
  const comic = comicById(parts[1]);
  const page = Math.max(0, parseInt(parts[2] || "0", 10) || 0);
  const auto = parts[3] === "play";
  return comic ? { comic, page: Math.min(page, comic.pages.length - 1), auto } : null;
}

function bindReader(comic, pageIndex, autoplay) {
  app.querySelectorAll("[data-act]").forEach((el) => {
    el.addEventListener("click", () => {
      const act = el.getAttribute("data-act");
      if (act === "prev") go(`#/read/${comic.id}/${Math.max(0, pageIndex - 1)}${autoplay ? "/play" : ""}`);
      if (act === "next") go(`#/read/${comic.id}/${Math.min(comic.pages.length - 1, pageIndex + 1)}${autoplay ? "/play" : ""}`);
      if (act === "auto") {
        if (autoplay) go(`#/read/${comic.id}/${pageIndex}`);
        else go(`#/read/${comic.id}/${pageIndex}/play`);
      }
    });
  });

  window.onkeydown = (e) => {
    if (e.key === "ArrowRight") go(`#/read/${comic.id}/${Math.min(comic.pages.length - 1, pageIndex + 1)}${autoplay ? "/play" : ""}`);
    if (e.key === "ArrowLeft") go(`#/read/${comic.id}/${Math.max(0, pageIndex - 1)}${autoplay ? "/play" : ""}`);
    if (e.key === " ") {
      e.preventDefault();
      if (autoplay) go(`#/read/${comic.id}/${pageIndex}`);
      else go(`#/read/${comic.id}/${pageIndex}/play`);
    }
  };

  stopAuto();
  if (autoplay) {
    autoTimer = setInterval(() => {
      if (pageIndex < comic.pages.length - 1) {
        go(`#/read/${comic.id}/${pageIndex + 1}/play`);
      } else {
        go(`#/read/${comic.id}/${pageIndex}`);
      }
    }, 6500);
  }
}

function render() {
  const p = path();
  window.onkeydown = null;
  if (p === "/" || p === "") {
    stopAuto();
    app.innerHTML = home();
    return;
  }
  if (p === "/library") {
    stopAuto();
    app.innerHTML = library();
    return;
  }
  const bookRoute = parseBook();
  if (bookRoute === false) {
    stopAuto();
    app.innerHTML = notFound();
    return;
  }
  if (bookRoute?.list) {
    stopAuto();
    app.innerHTML = booksPage();
    return;
  }
  if (bookRoute?.book) {
    stopAuto();
    app.innerHTML = bookReader(bookRoute.book, bookRoute.chapter);
    bindBookReader(bookRoute.book, bookRoute.chapter);
    return;
  }
  if (p === "/characters") {
    stopAuto();
    app.innerHTML = charactersPage();
    return;
  }
  const reel = parseReel();
  if (reel === false) {
    stopAuto();
    app.innerHTML = notFound();
    return;
  }
  if (reel?.list) {
    stopAuto();
    app.innerHTML = reelsPage();
    bindReelPreviews();
    return;
  }
  if (reel) {
    stopAuto();
    app.innerHTML = reelWatchPage(reel);
    return;
  }
  const watch = parseWatch();
  if (watch) {
    stopAuto();
    app.innerHTML = watchPage(watch);
    return;
  }
  const read = parseRead();
  if (read) {
    app.innerHTML = reader(read.comic, read.page, read.auto);
    bindReader(read.comic, read.page, read.auto);
    return;
  }
  stopAuto();
  app.innerHTML = notFound();
}

window.addEventListener("hashchange", render);
render();
