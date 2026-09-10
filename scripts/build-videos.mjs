import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { comics } from "../src/comics.js";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "videos");
fs.mkdirSync(outDir, { recursive: true });

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ["-y", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.slice(-1200) || `ffmpeg exited ${code}`));
    });
  });
}

function uniqueImages(comic) {
  const seen = new Set();
  const list = [];
  for (const page of comic.pages) {
    if (!seen.has(page.image)) {
      seen.add(page.image);
      list.push(path.join(root, "public", page.image.replace(/^\//, "")));
    }
  }
  return list;
}

async function clipFromImage(input, output, seconds, zoomDir) {
  const frames = Math.round(seconds * 25);
  const zoom = zoomDir > 0 ? `'min(1.12,1.0+0.002*on)'` : `'max(1.0,1.12-0.002*on)'`;
  await run([
    "-loop",
    "1",
    "-i",
    input,
    "-t",
    String(seconds),
    "-vf",
    `scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z=${zoom}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=25,format=yuv420p`,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "26",
    "-pix_fmt",
    "yuv420p",
    output,
  ]);
}

async function concatClips(clips, dest) {
  const listFile = dest + ".txt";
  fs.writeFileSync(
    listFile,
    clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n")
  );
  await run([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "64k",
    "-shortest",
    "-movflags",
    "+faststart",
    dest,
  ]);
  fs.unlinkSync(listFile);
}

async function buildComic(comic) {
  const images = uniqueImages(comic);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `katha-${comic.id}-`));
  const clips = [];
  try {
    for (let i = 0; i < images.length; i++) {
      const clip = path.join(tmp, `c${String(i).padStart(2, "0")}.mp4`);
      const seconds = i === 0 ? 2.6 : 2.1;
      process.stdout.write(`  ${comic.id} clip ${i + 1}/${images.length}\n`);
      await clipFromImage(images[i], clip, seconds, i % 2 === 0 ? 1 : -1);
      clips.push(clip);
    }
    const dest = path.join(outDir, `${comic.id}.mp4`);
    await concatClips(clips, dest);
    const mb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
    console.log("wrote", dest, mb, "MB");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const only = process.argv[2];
const list = only ? comics.filter((c) => c.id === only) : comics;
if (!list.length) {
  console.error("no matching comic");
  process.exit(1);
}

for (const comic of list) {
  await buildComic(comic);
}
