import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { comics } from "../src/comics.js";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "videos");
const python = path.join(root, ".venv", "bin", "python");
const ttsScript = path.join(root, "scripts", "tts.py");
const font = "/System/Library/Fonts/Supplemental/Georgia.ttf";
fs.mkdirSync(outDir, { recursive: true });

const FEMALE =
  /meera|amma|tara|priya|sana|tashi|leela|bommi|mother|aaji|bride|girl|dadi|dancer|salesgirl|sister|woman|child|visitor|teacher|headteacher|anchor|clock|monsoon|shadow/i;
const MALE =
  /chotu|raja|guru|vikram|sonu|bhola|clerk|boy|contractor|smuggler|promoter|developer|minister|watchman|ustad|monk|father|uncle|dispatcher|intern|groomsman|official|buyer|youth|lakhbir|pride|time-keeper|ghost|living inspector|old man|sad man|manager|executive|stall|neighbour|reporter|chair|officer|guide/i;

function voiceFor(speaker) {
  if (FEMALE.test(speaker)) return "en-IN-NeerjaNeural";
  if (MALE.test(speaker)) return "en-IN-PrabhatNeural";
  return "en-IN-NeerjaExpressiveNeural";
}

function spokenText(speaker, caption, balloon) {
  const clean = (s) =>
    String(s)
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  const cap = clean(caption);
  const line = clean(balloon);
  if (/^narrator$/i.test(speaker)) return `${cap} ${line}`;
  return `${cap} ${speaker} says: ${line}`;
}

function wrap(text, width = 48) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4).join("\n");
}

function spawnCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "ignore", "pipe"], ...opts });
    let err = "";
    if (opts.input) {
      child.stdin.write(opts.input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve(err);
      else reject(new Error((err || `${cmd} exited ${code}`).slice(-1500)));
    });
  });
}

function ffmpeg(args) {
  return spawnCmd(ffmpegPath, ["-hide_banner", "-y", ...args]);
}

async function probeSeconds(file) {
  const err = await spawnCmd(ffmpegPath, ["-i", file]).catch((e) => e.message);
  const m = String(err).match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return 3;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function ttsToMp3(text, voice, out) {
  try {
    await spawnCmd(python, [ttsScript, voice, out, "-8%"], { input: text });
  } catch {
    const aiff = out.replace(/\.mp3$/, ".aiff");
    const macVoice = voice.includes("Prabhat") ? "Rishi" : "Samantha";
    await spawnCmd("say", ["-v", macVoice, "-o", aiff, text]);
    await ffmpeg(["-i", aiff, "-q:a", "4", out]);
    fs.rmSync(aiff, { force: true });
  }
  if (!fs.existsSync(out) || fs.statSync(out).size < 400) {
    throw new Error("tts produced no audio");
  }
}

async function makeClip({ image, audio, caption, speaker, balloon, title, pageLabel, dest, zoomOut }) {
  const seconds = Math.max(3.2, (await probeSeconds(audio)) + 0.55);
  const frames = Math.max(80, Math.round(seconds * 25));
  const zoom = zoomOut ? `'max(1.0,1.12-0.0004*on)'` : `'min(1.14,1.0+0.0004*on)'`;
  const capFile = dest + ".cap.txt";
  const balloonFile = dest + ".bal.txt";
  const titleFile = dest + ".title.txt";
  fs.writeFileSync(capFile, wrap(caption));
  fs.writeFileSync(balloonFile, wrap(`${speaker}: ${balloon}`, 42));
  fs.writeFileSync(titleFile, title);
  const vf = [
    `scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z=${zoom}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=25`,
    `drawbox=x=0:y=0:w=iw:h=64:color=black@0.55:t=fill`,
    `drawtext=fontfile='${font}':textfile='${titleFile}':x=24:y=18:fontsize=22:fontcolor=0xf3e6cc`,
    `drawtext=fontfile='${font}':text='${pageLabel}':x=w-text_w-24:y=22:fontsize=18:fontcolor=0xf3e6cc`,
    `drawbox=x=0:y=ih-168:w=iw:h=168:color=black@0.62:t=fill`,
    `drawtext=fontfile='${font}':textfile='${balloonFile}':x=28:y=h-158:fontsize=22:fontcolor=0xfff8ea:line_spacing=6`,
    `drawtext=fontfile='${font}':textfile='${capFile}':x=28:y=h-88:fontsize=20:fontcolor=0xf3e6cc:line_spacing=5`,
    `format=yuv420p`,
  ].join(",");
  await ffmpeg([
    "-loop",
    "1",
    "-i",
    image,
    "-i",
    audio,
    "-t",
    seconds.toFixed(2),
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-level",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "30",
    "-maxrate",
    "1800k",
    "-bufsize",
    "3600k",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-shortest",
    dest,
  ]);
  fs.rmSync(capFile, { force: true });
  fs.rmSync(balloonFile, { force: true });
  fs.rmSync(titleFile, { force: true });
}

async function concatClips(clips, dest) {
  const listFile = dest + ".txt";
  fs.writeFileSync(listFile, clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n"));
  await ffmpeg([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "30",
    "-maxrate",
    "1800k",
    "-bufsize",
    "3600k",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    dest,
  ]);
  fs.unlinkSync(listFile);
}

async function buildComic(comic) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `katha-voice-${comic.id}-`));
  const clips = [];
  try {
    const titleAudio = path.join(tmp, "title.mp3");
    await ttsToMp3(
      `Katha Studio presents ${comic.title}. ${comic.logline}`,
      "en-IN-NeerjaExpressiveNeural",
      titleAudio
    );
    const titleClip = path.join(tmp, "c00.mp4");
    process.stdout.write(`  ${comic.id} title\n`);
    await makeClip({
      image: path.join(root, "public", comic.cover.replace(/^\//, "")),
      audio: titleAudio,
      caption: comic.logline,
      speaker: "Katha Studio",
      balloon: comic.title,
      title: "KATHA STUDIO",
      pageLabel: comic.issue,
      dest: titleClip,
      zoomOut: false,
    });
    clips.push(titleClip);

    for (let i = 0; i < comic.pages.length; i++) {
      const page = comic.pages[i];
      const audio = path.join(tmp, `a${String(i).padStart(2, "0")}.mp3`);
      const clip = path.join(tmp, `c${String(i + 1).padStart(2, "0")}.mp4`);
      process.stdout.write(`  ${comic.id} page ${i + 1}/${comic.pages.length}\n`);
      await ttsToMp3(spokenText(page.speaker, page.caption, page.balloon), voiceFor(page.speaker), audio);
      await makeClip({
        image: path.join(root, "public", page.image.replace(/^\//, "")),
        audio,
        caption: page.caption,
        speaker: page.speaker,
        balloon: page.balloon,
        title: comic.title,
        pageLabel: `Page ${i + 1} / ${comic.pages.length}`,
        dest: clip,
        zoomOut: i % 2 === 1,
      });
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
