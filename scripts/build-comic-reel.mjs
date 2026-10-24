/**
 * Vertical comic-style reel: full-panel art, Amar-Chitra-style frame, pan/zoom animation, Hindi TTS.
 * Usage: node scripts/build-comic-reel.mjs [reel-id]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { motivationReel } from "./motivation-reel-data.mjs";

const root = path.resolve(import.meta.dirname, "..");
const python = path.join(root, ".venv", "bin", "python");
const ttsScript = path.join(root, "scripts", "tts.py");
const fontLatin = "/System/Library/Fonts/Supplemental/Helvetica-Bold.ttf";
const fontHi = "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc";

const W = 1080;
const H = 1920;
const FPS = 30;

const reel = motivationReel;
const outDir = path.join(root, "public", "reels");
const dlDir = path.join(process.env.HOME || "", "Downloads", "Katha-Studio-Reels");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dlDir, { recursive: true });

function spawnCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "ignore", "pipe"], ...opts });
    let err = "";
    if (opts.input) {
      child.stdin.write(opts.input);
      child.stdin.end();
    } else child.stdin.end();
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => (code === 0 ? resolve(err) : reject(new Error(err.slice(-2500)))));
  });
}

function ffmpeg(args) {
  return spawnCmd(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
}

async function probeSeconds(file) {
  const err = await spawnCmd(ffmpegPath, ["-i", file]).catch((e) => e.message);
  const m = String(err).match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return 5;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function tts(text, out) {
  const line = String(text).replace(/\s+/g, " ").trim();
  await spawnCmd(python, [ttsScript, "hi-IN-MadhurNeural", out, "-2%"], { input: line });
}

function escPath(p) {
  return p.replace(/:/g, "\\:").replace(/'/g, "'\\''");
}

function panelMotion(frames, pan) {
  const z = `'min(1.22,1.06+0.00048*on)'`;
  const x =
    pan === "left"
      ? `'iw/2-(iw/zoom/2)-25*sin(2*PI*on/${Math.max(frames, 30)})'`
      : pan === "right"
        ? `'iw/2-(iw/zoom/2)+25*sin(2*PI*on/${Math.max(frames, 30)})'`
        : `'iw/2-(iw/zoom/2)'`;
  const ph = 1160;
  const pw = 992;
  return `scale=${pw * 2}:${ph * 2}:force_original_aspect_ratio=increase,crop=${pw * 2}:${ph * 2},zoompan=z=${z}:x=${x}:y='ih/2-(ih/zoom/2)':d=${frames}:s=${pw}x${ph}:fps=${FPS}`;
}

function achFrameOverlay(titleFile, hookFile, showHook, panelY, panelH) {
  const parts = [
    `drawbox=x=0:y=0:w=iw:h=200:color=0xc41e0a:t=fill`,
    `drawtext=fontfile='${escPath(fontLatin)}':text='KATHA STUDIO':x=48:y=72:fontsize=38:fontcolor=0xfff8ea:borderw=2:bordercolor=0x000000@0.4`,
    `drawtext=fontfile='${escPath(fontLatin)}':textfile='${escPath(titleFile)}':x=48:y=118:fontsize=30:fontcolor=0xfff3c4:borderw=2:bordercolor=0x000000@0.35`,
    `drawbox=x=32:y=${panelY - 8}:w=1016:h=${panelH + 16}:color=0x1a1208:t=14`,
  ];
  if (showHook) {
    parts.push(`drawbox=x=44:y=${panelY + panelH - 110}:w=992:h=96:color=0xc41e0a@0.94:t=fill`);
    parts.push(
      `drawtext=fontfile='${escPath(fontHi)}':textfile='${escPath(hookFile)}':x=64:y=${panelY + panelH - 82}:fontsize=38:fontcolor=0xffffff:borderw=2:bordercolor=0x000000@0.55`
    );
  }
  parts.push(`format=yuv420p`);
  return parts.join(",");
}

async function makeScene({ imagePath, audioPath, title, hook, showHook, dest, pan }) {
  const audioLen = await probeSeconds(audioPath);
  const dur = Math.max(6, audioLen + 0.35);
  const frames = Math.round(dur * FPS);
  const titleFile = dest + ".title.txt";
  const hookFile = dest + ".hook.txt";
  fs.writeFileSync(titleFile, title);
  if (hook) fs.writeFileSync(hookFile, hook);

  const panelY = 292;
  const panelInner = 1160;
  const motion = panelMotion(frames, pan);
  const frame = achFrameOverlay(titleFile, hookFile, showHook, panelY, panelInner);

  const fc = [
    `color=c=0xfff0c8:s=${W}x${H}:d=${frames}[bg]`,
    `[0:v]${motion}[art]`,
    `[bg][art]overlay=44:${panelY}[composed]`,
    `[composed]${frame}[vout]`,
  ].join(";");

  await ffmpeg([
    "-loop",
    "1",
    "-i",
    imagePath,
    "-i",
    audioPath,
    "-t",
    dur.toFixed(2),
    "-filter_complex",
    fc,
    "-map",
    "[vout]",
    "-map",
    "1:a",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-ar",
    "48000",
    "-shortest",
    dest,
  ]);

  fs.rmSync(titleFile, { force: true });
  fs.rmSync(hookFile, { force: true });
}

async function concatClips(clips, dest) {
  const list = dest + ".txt";
  fs.writeFileSync(list, clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n"));
  await ffmpeg([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    dest,
  ]);
  fs.unlinkSync(list);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "comic-reel-"));
const clips = [];
const pans = ["left", "right", "center", "left", "right", "center", "left"];

try {
  for (let i = 0; i < reel.scenes.length; i++) {
    const s = reel.scenes[i];
    const img = path.join(root, "public", s.image.replace(/^\//, ""));
    const audio = path.join(tmp, `a${i}.mp3`);
    const clip = path.join(tmp, `c${i}.mp4`);
    process.stdout.write(`scene ${i + 1}/${reel.scenes.length}\n`);
    await tts(s.narration, audio);
    if (s.dramaticPause) {
      const sil = path.join(tmp, `sil${i}.mp3`);
      await ffmpeg(["-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.5", "-q:a", "9", sil]);
      const m = path.join(tmp, `m${i}.mp3`);
      const lst = path.join(tmp, `l${i}.txt`);
      fs.writeFileSync(lst, `file '${sil}'\nfile '${audio}'`);
      await ffmpeg(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", m]);
      fs.renameSync(m, audio);
    }
    await makeScene({
      imagePath: img,
      audioPath: audio,
      title: reel.title,
      hook: i === 0 ? reel.hook : "",
      showHook: i === 0,
      dest: clip,
      pan: pans[i % pans.length],
    });
    clips.push(clip);
  }

  const raw = path.join(tmp, "full.mp4");
  await concatClips(clips, raw);
  const final = path.join(outDir, `${reel.id}.mp4`);
  await ffmpeg([
    "-i",
    raw,
    "-c:v",
    "libx264",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    final,
  ]);
  fs.copyFileSync(final, path.join(dlDir, "00-Motivation-Tu-Late-Nahi.mp4"));
  fs.copyFileSync(final, path.join(outDir, "life", `${reel.id}.mp4`));
  const mb = (fs.statSync(final).size / (1024 * 1024)).toFixed(2);
  console.log(`wrote ${final} (${(await probeSeconds(final)).toFixed(1)}s, ${mb} MB)`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
