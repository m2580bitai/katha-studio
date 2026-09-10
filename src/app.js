import { comics, characters, studio, comicById, comicVideo } from "./comics.js";

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
        <a href="#/library" ${active === "library" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Library</a>
        <a href="#/characters" ${active === "characters" ? 'style="background:var(--saffron);color:#fffaf2"' : ""}>Characters</a>
      </nav>
    </header>
  `;
}

function footer() {
  return `
    <footer class="wrap footer">
      <span>Original Indian characters and stories. Not affiliated with any existing comic house.</span>
      <span>Read on screen · Watch voiced videos · Download as PDF</span>
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
  if (p === "/characters") {
    stopAuto();
    app.innerHTML = charactersPage();
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
