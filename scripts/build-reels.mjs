import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { reels } from "./reels-data.mjs";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "reels");
const dlDir = path.join(process.env.HOME || "", "Downloads", "Katha-Studio-Reels");
const python = path.join(root, ".venv", "bin", "python");
const ttsScript = path.join(root, "scripts", "tts.py");
const font = "/System/Library/Fonts/Supplemental/Helvetica.ttf";
const fontBold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dlDir, { recursive: true });

const W = 1080;
const H = 1920;
const FPS = 30;

// Instagram safe zones (px): top UI ~220, bottom UI ~320
const SAFE_TOP = 200;
const SAFE_BOTTOM = 340;

const FEMALE =
  /meera|amma|tara|priya|sana|tashi|leela|bommi|monsoon|shadow|dadi|sister|dancer|clerk/i;
const MALE =
  /chotu|raja|guru|vikram|sonu|smuggler|ghost|inspector|developer|contractor|bhola|smuggler/i;

function voiceFor(speaker) {
  if (FEMALE.test(speaker)) return "en-IN-NeerjaNeural";
  if (MALE.test(speaker)) return "en-IN-PrabhatNeural";
  return "en-IN-NeerjaExpressiveNeural";
}

function displaySpeaker(speaker) {
  const map = {
    "Inspector Tara": "TARA",
    "Ghost clerk": "CLERK",
    "Sonu the Auto": "SONU",
    "Shadow dancer": "DANCER",
  };
  return map[speaker] || speaker.replace(/^Narrator$/i, "STORY").toUpperCase();
}

function wrap(text, width = 28) {
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
  return lines.slice(0, 3).join("\n");
}

function spawnCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "ignore", "pipe"], ...opts });
    let err = "";
    if (opts.input) {
      child.stdin.write(opts.input);
      child.stdin.end();
    } else child.stdin.end();
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve(err);
      else reject(new Error((err || `${cmd} exited ${code}`).slice(-2000)));
    });
  });
}

function ffmpeg(args) {
  return spawnCmd(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
}

async function probeSeconds(file) {
  const err = await spawnCmd(ffmpegPath, ["-i", file]).catch((e) => e.message);
  const m = String(err).match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return 4;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function tts(text, voice, out) {
  const line = String(text).replace(/\s+/g, " ").trim();
  await spawnCmd(python, [ttsScript, voice, out, "+2%"], { input: line }).catch(async () => {
    const aiff = out.replace(/\.mp3$/, ".aiff");
    await spawnCmd("say", ["-v", voice.includes("Prabhat") ? "Rishi" : "Samantha", "-r", 180, "-o", aiff, line]);
    await ffmpeg(["-i", aiff, "-q:a", "4", out]);
    fs.rmSync(aiff, { force: true });
  });
}

function escPath(p) {
  return p.replace(/:/g, "\\:").replace(/'/g, "'\\''");
}

function mobileCropFilter(frames, zoomIn) {
  const zoom = zoomIn ? `'min(1.22,1.04+0.00032*on)'` : `'max(1.04,1.22-0.00032*on)'`;
  return [
    `scale=${W * 2}:${Math.round(H * 2.2)}:force_original_aspect_ratio=increase`,
    `crop=${W * 2}:${H * 2}:(iw-${W * 2})/2:(ih-${H * 2})*0.42`,
    `zoompan=z=${zoom}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS}`,
    `eq=contrast=1.06:saturation=1.08`,
  ].join(",");
}

async function makeBeatClip({
  imagePath,
  audioPath,
  hook,
  speaker,
  line,
  title,
  beatNum,
  total,
  dest,
  zoomIn,
}) {
  const dur = Math.min(11.5, Math.max(7.5, (await probeSeconds(audioPath)) + 0.9));
  const frames = Math.round(dur * FPS);
  const progress = Math.round((beatNum / total) * 920);

  const hookFile = dest + ".hook.txt";
  const lineFile = dest + ".line.txt";
  const whoFile = dest + ".who.txt";
  const brandFile = dest + ".brand.txt";
  if (hook) fs.writeFileSync(hookFile, wrap(hook, 26));
  fs.writeFileSync(lineFile, wrap(line, 26));
  fs.writeFileSync(whoFile, displaySpeaker(speaker));
  fs.writeFileSync(brandFile, title);

  const captionY = H - SAFE_BOTTOM - 380;
  const vf = [
    mobileCropFilter(frames, zoomIn),
    `drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=fill`,
    `drawbox=x=0:y=0:w=iw:h=${SAFE_TOP}:color=0x1a1208@0.72:t=fill`,
    `drawtext=fontfile='${escPath(fontBold)}':text='KATHA':x=48:y=72:fontsize=34:fontcolor=0xe24e1b:borderw=2:bordercolor=0x000000@0.5`,
    `drawtext=fontfile='${escPath(font)}':textfile='${escPath(brandFile)}':x=48:y=118:fontsize=30:fontcolor=0xfff8ea:borderw=2:bordercolor=0x000000@0.45`,
    `drawbox=x=48:y=168:w=920:h=10:color=0xffffff22:t=fill`,
    `drawbox=x=48:y=168:w=${progress}:h=10:color=0xe24e1b@0.95:t=fill`,
    hook
      ? `drawbox=x=48:y=${SAFE_TOP + 24}:w=984:h=220:color=0xe24e1b@0.94:t=fill`
      : `null`,
    hook
      ? `drawtext=fontfile='${escPath(fontBold)}':textfile='${escPath(hookFile)}':x=72:y=${SAFE_TOP + 64}:fontsize=48:fontcolor=0xfff8ea:line_spacing=12:borderw=3:bordercolor=0x000000@0.55`
      : `null`,
    `drawbox=x=48:y=${captionY}:w=984:h=360:color=0x1a1208@0.88:t=fill`,
    `drawtext=fontfile='${escPath(fontBold)}':textfile='${escPath(whoFile)}':x=72:y=${captionY + 36}:fontsize=34:fontcolor=0xe24e1b:borderw=2:bordercolor=0x000000@0.5`,
    `drawtext=fontfile='${escPath(font)}':textfile='${escPath(lineFile)}':x=72:y=${captionY + 96}:fontsize=44:fontcolor=0xffffff:line_spacing=14:borderw=3:bordercolor=0x000000@0.65`,
    `format=yuv420p`,
  ]
    .filter((x) => x !== "null")
    .join(",");

  await ffmpeg([
    "-loop",
    "1",
    "-i",
    imagePath,
    "-i",
    audioPath,
    "-t",
    dur.toFixed(2),
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "22",
    "-maxrate",
    "6M",
    "-bufsize",
    "12M",
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

  for (const f of [hookFile, lineFile, whoFile, brandFile]) fs.rmSync(f, { force: true });
}

async function makeEndCard({ imagePath, endText, title, dest }) {
  const dur = 5;
  const frames = Math.round(dur * FPS);
  const endFile = dest + ".end.txt";
  const titleFile = dest + ".title.txt";
  fs.writeFileSync(endFile, wrap(endText, 24));
  fs.writeFileSync(titleFile, title);

  const cardY = 720;
  const vf = [
    mobileCropFilter(frames, true),
    `drawbox=x=0:y=0:w=iw:h=ih:color=0x1a1208@0.62:t=fill`,
    `drawbox=x=48:y=${cardY}:w=984:h=520:color=0xfff8ea@0.12:t=fill`,
    `drawtext=fontfile='${escPath(fontBold)}':text='KATHA STUDIO':x=72:y=${cardY + 48}:fontsize=52:fontcolor=0xe24e1b:borderw=3:bordercolor=0x000000@0.5`,
    `drawtext=fontfile='${escPath(font)}':textfile='${escPath(titleFile)}':x=72:y=${cardY + 130}:fontsize=42:fontcolor=0xffffff:borderw=2:bordercolor=0x000000@0.5`,
    `drawtext=fontfile='${escPath(font)}':textfile='${escPath(endFile)}':x=72:y=${cardY + 210}:fontsize=36:fontcolor=0xf3e6cc:line_spacing=10:borderw=2:bordercolor=0x000000@0.45`,
    `drawtext=fontfile='${escPath(font)}':text='Link in bio · 1080x1920 Reel':x=72:y=${cardY + 360}:fontsize=30:fontcolor=0xe24e1b:borderw=2:bordercolor=0x000000@0.4`,
    `format=yuv420p`,
  ].join(",");

  await ffmpeg([
    "-loop",
    "1",
    "-i",
    imagePath,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-t",
    String(dur),
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "22",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    dest,
  ]);
  fs.rmSync(endFile, { force: true });
  fs.rmSync(titleFile, { force: true });
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
    "22",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    dest,
  ]);
  fs.unlinkSync(list);
}

async function fitToSixty(src, dest) {
  const dur = await probeSeconds(src);
  if (dur >= 58 && dur <= 60.5) {
    fs.copyFileSync(src, dest);
    return dur;
  }
  if (dur < 58) {
    const pad = (60 - dur).toFixed(2);
    await ffmpeg([
      "-i",
      src,
      "-vf",
      `tpad=stop_mode=clone:stop_duration=${pad}`,
      "-af",
      `apad=pad_dur=${pad}`,
      "-t",
      "60",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "22",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      dest,
    ]);
    return 60;
  }
  await ffmpeg([
    "-i",
    src,
    "-t",
    "60",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "22",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    dest,
  ]);
  return 60;
}

async function buildReel(reel) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `reel-${reel.id}-`));
  const clips = [];
  const total = reel.beats.length;

  try {
    for (let i = 0; i < reel.beats.length; i++) {
      const b = reel.beats[i];
      const img = path.join(root, "public", b.image.replace(/^\//, ""));
      const audio = path.join(tmp, `a${i}.mp3`);
      const clip = path.join(tmp, `c${i}.mp4`);
      const spoken = b.narration || b.line;
      process.stdout.write(`  ${reel.id} beat ${i + 1}/${total}\n`);
      await tts(spoken, voiceFor(b.speaker), audio);
      await makeBeatClip({
        imagePath: img,
        audioPath: audio,
        hook: i === 0 ? reel.hook : "",
        speaker: b.speaker,
        line: b.line,
        title: reel.title,
        beatNum: i + 1,
        total,
        dest: clip,
        zoomIn: i % 2 === 0,
      });
      clips.push(clip);
    }

    const endClip = path.join(tmp, "end.mp4");
    const cover = path.join(root, "public", reel.beats[0].image.replace(/^\//, ""));
    await makeEndCard({ imagePath: cover, endText: reel.end, title: reel.title, dest: endClip });
    clips.push(endClip);

    const raw = path.join(tmp, "full.mp4");
    await concatClips(clips, raw);

    const final = path.join(outDir, `${reel.id}.mp4`);
    const seconds = await fitToSixty(raw, final);

    const captionPath = path.join(outDir, `${reel.id}-instagram-caption.txt`);
    fs.writeFileSync(
      captionPath,
      `${reel.caption}\n\n${seconds.toFixed(0)}s · Vertical 9:16 · Mobile captions inside safe zone\n`
    );

    const names = {
      "reel-monsoon-meera": "01-Reel-Monsoon-Meera.mp4",
      "reel-night-mail": "02-Reel-Night-Mail.mp4",
      "reel-golden-auto": "03-Reel-Golden-Auto.mp4",
      "reel-ten-shadows": "04-Reel-Ten-Shadows.mp4",
      "reel-net-of-lights": "05-Reel-Net-of-Lights.mp4",
    };
    const dl = path.join(dlDir, names[reel.id] || `${reel.id}.mp4`);
    fs.copyFileSync(final, dl);
    fs.copyFileSync(captionPath, path.join(dlDir, `${reel.id}-caption.txt`));

    const mb = (fs.statSync(final).size / (1024 * 1024)).toFixed(2);
    console.log(`wrote ${final} (${seconds.toFixed(1)}s, ${mb} MB)`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const only = process.argv[2];
const list = only ? reels.filter((r) => r.id === only || r.bookId === only) : reels;
for (const reel of list) {
  console.log(`Building ${reel.title}...`);
  await buildReel(reel);
}
