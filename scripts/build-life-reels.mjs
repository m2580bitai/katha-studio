import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { lifeReels } from "./life-reels-data.mjs";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "reels", "life");
const dlDir = path.join(process.env.HOME || "", "Downloads", "Katha-Studio-Life-Reels");
const python = path.join(root, ".venv", "bin", "python");
const ttsScript = path.join(root, "scripts", "tts.py");
const fontHi = "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc";
const fontHiBold = "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc";
const fontLatin = "/System/Library/Fonts/Supplemental/Helvetica.ttf";

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dlDir, { recursive: true });

const W = 1080;
const H = 1920;
const FPS = 30;
const SAFE_TOP = 200;
const SAFE_BOTTOM = 360;

const FEMALE = /meera|amma|behen|priya|leela|bommi|sana|swara/i;

function voiceFor(speaker) {
  if (FEMALE.test(speaker)) return "hi-IN-SwaraNeural";
  return "hi-IN-MadhurNeural";
}

function displaySpeaker(speaker) {
  const map = {
    Narrator: "कहानी",
    Friend: "दोस्त",
    Boss: "बॉस",
    Chaiwala: "चायवाला",
    Behen: "बहन",
    Papa: "पापा",
  };
  return map[speaker] || speaker.toUpperCase();
}

function wrap(text, width = 32) {
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
      else reject(new Error((err || `${cmd} exited ${code}`).slice(-2500)));
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
  await spawnCmd(python, [ttsScript, voice, out, "-3%"], { input: line }).catch(async () => {
    const aiff = out.replace(/\.mp3$/, ".aiff");
    const sayVoice = voice.includes("Swara") ? "Lekha" : "Rishi";
    await spawnCmd("say", ["-v", sayVoice, "-r", 175, "-o", aiff, line]);
    await ffmpeg(["-i", aiff, "-q:a", "3", out]);
    fs.rmSync(aiff, { force: true });
  });
}

async function enhanceVoice(audioPath) {
  const out = audioPath.replace(/\.mp3$/, ".enh.mp3");
  await ffmpeg([
    "-i",
    audioPath,
    "-af",
    "highpass=f=90,lowpass=f=11000,compand=attacks=0.1:decays=0.3:points=-80/-80|-20/-15|-5/-5|0/-3,volume=1.25",
    "-ar",
    "48000",
    "-b:a",
    "192k",
    out,
  ]);
  fs.renameSync(out, audioPath);
}

async function leadingSilence(audioPath, seconds) {
  if (!seconds || seconds <= 0) return;
  const sil = audioPath + ".sil.mp3";
  const merged = audioPath + ".pad.mp3";
  await ffmpeg([
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=48000:cl=mono",
    "-t",
    String(seconds),
    "-c:a",
    "libmp3lame",
    "-q:a",
    "9",
    sil,
  ]);
  const list = audioPath + ".lst.txt";
  fs.writeFileSync(list, `file '${sil.replace(/'/g, "'\\''")}'\nfile '${audioPath.replace(/'/g, "'\\''")}'`);
  await ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", merged]);
  fs.renameSync(merged, audioPath);
  fs.rmSync(sil, { force: true });
  fs.rmSync(list, { force: true });
}

function escPath(p) {
  return p.replace(/:/g, "\\:").replace(/'/g, "'\\''");
}

function bgZoom(frames, zoomIn) {
  const zoom = zoomIn ? `'min(1.2,1.06+0.00038*on)'` : `'max(1.06,1.2-0.00038*on)'`;
  return `scale=${W * 2}:${Math.round(H * 2.2)}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2}:(iw-${W * 2})/2:(ih-${H * 2})*0.4,zoompan=z=${zoom}:x='iw/2-(iw/zoom/2)+25*sin(2*PI*on/${Math.max(frames, 1)})':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},eq=contrast=1.08:saturation=1.1`;
}

function overlayDraws({ progress, brandFile, speaking }) {
  const parts = [
    `drawbox=x=0:y=0:w=iw:h=ih:color=black@0.1:t=fill`,
    `drawbox=x=0:y=0:w=iw:h=120:color=0x120a06@0.42:t=fill`,
    `drawtext=fontfile='${escPath(fontLatin)}':text='KATHA LIFE':x=48:y=52:fontsize=30:fontcolor=0xe24e1b:borderw=2:bordercolor=0x000000@0.45`,
    `drawtext=fontfile='${escPath(fontLatin)}':textfile='${escPath(brandFile)}':x=48:y=88:fontsize=24:fontcolor=0xfff8ea:borderw=2:bordercolor=0x000000@0.4`,
    `drawbox=x=48:y=124:w=920:h=6:color=0xffffff22:t=fill`,
    `drawbox=x=48:y=124:w=${progress}:h=6:color=0xe24e1b@0.9:t=fill`,
  ];
  if (speaking) {
    parts.push(`drawbox=x=iw/2-24:y=520:w=48:h=48:color=0xe24e1b@0.28:t=10`);
  }
  return parts.join(",");
}

function characterScale(speaking) {
  if (speaking) {
    return `scale=w='560+52*sin(2*PI*on/9)':h=-1,format=rgba`;
  }
  return `scale=500:-1,format=rgba`;
}

async function makeBeatClip({
  imagePath,
  characterPath,
  audioPath,
  speaker,
  title,
  beatNum,
  total,
  dest,
  zoomIn,
}) {
  const audioLen = await probeSeconds(audioPath);
  const dur = Math.max(5.5, audioLen + 0.45);
  const frames = Math.round(dur * FPS);
  const progress = Math.round((beatNum / total) * 920);
  const speaking = !/^narrator$/i.test(speaker);

  const brandFile = dest + ".brand.txt";
  fs.writeFileSync(brandFile, title);

  const charPath =
    speaking && characterPath && fs.existsSync(characterPath) ? characterPath : null;
  const draws = overlayDraws({ progress, brandFile, speaking });

  if (charPath) {
    const bob = Math.max(24, Math.round(frames * 0.75));
    const sway = speaking ? 38 : 22;
    const yPos = speaking ? "main_h*0.32-overlay_h*0.04" : "main_h*0.36-overlay_h*0.02";
    const fc = [
      `[0:v]${bgZoom(frames, zoomIn)}[bg]`,
      `[1:v]${characterScale(speaking)}[fg]`,
      `[bg][fg]overlay=x='(W-w)/2+${sway}*sin(2*PI*on/${bob})':y='${yPos}':eval=frame[composed]`,
      `[composed]${draws},format=yuv420p[vout]`,
    ].join(";");
    await ffmpeg([
      "-loop",
      "1",
      "-i",
      imagePath,
      "-loop",
      "1",
      "-i",
      charPath,
      "-i",
      audioPath,
      "-t",
      dur.toFixed(2),
      "-filter_complex",
      fc,
      "-map",
      "[vout]",
      "-map",
      "2:a",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-shortest",
      dest,
    ]).catch(async () => {
      const vf = `${bgZoom(frames, zoomIn)},${draws}`;
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
        "-crf",
        "21",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        dest,
      ]);
    });
  } else {
    const vf = `${bgZoom(frames, zoomIn)},${draws},format=yuv420p`;
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
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      dest,
    ]);
  }

  fs.rmSync(brandFile, { force: true });
}

async function makeEndCard({ imagePath, characterPath, title, dest }) {
  const dur = 4;
  const frames = Math.round(dur * FPS);
  const titleFile = dest + ".title.txt";
  fs.writeFileSync(titleFile, title);
  const charPath = characterPath && fs.existsSync(characterPath) ? characterPath : null;

  const draws = [
    `drawbox=x=0:y=0:w=iw:h=ih:color=0x1a1208@0.5:t=fill`,
    `drawtext=fontfile='${escPath(fontLatin)}':text='KATHA STUDIO':x=(w-text_w)/2:y=780:fontsize=52:fontcolor=0xe24e1b:borderw=3:bordercolor=0x000000@0.5`,
    `drawtext=fontfile='${escPath(fontLatin)}':textfile='${escPath(titleFile)}':x=(w-text_w)/2:y=860:fontsize=36:fontcolor=0xffffff:borderw=2:bordercolor=0x000000@0.45`,
    `format=yuv420p`,
  ].join(",");

  if (charPath) {
    const fc = `[0:v]${bgZoom(frames, true)}[bg];[1:v]scale=500:-1,format=rgba[fg];[bg][fg]overlay=x='(main_w-overlay_w)/2':y='main_h*0.12':eval=frame[composed];[composed]${draws}[vout]`;
    await ffmpeg([
      "-loop",
      "1",
      "-i",
      imagePath,
      "-loop",
      "1",
      "-i",
      charPath,
      "-f",
      "lavfi",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=48000",
      "-t",
      String(dur),
      "-filter_complex",
      fc,
      "-map",
      "[vout]",
      "-map",
      "2:a",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-shortest",
      dest,
    ]);
  } else {
    await ffmpeg([
      "-loop",
      "1",
      "-i",
      imagePath,
      "-f",
      "lavfi",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=48000",
      "-t",
      String(dur),
      "-vf",
      `${bgZoom(frames, true)},${draws}`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      dest,
    ]);
  }
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
    "21",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    dest,
  ]);
  fs.unlinkSync(list);
}

/** Keep full script audio; pad short reels slightly, never chop narration for a 60s cap. */
async function finalizeReel(src, dest) {
  const dur = await probeSeconds(src);
  const minDur = 48;
  if (dur >= minDur) {
    fs.copyFileSync(src, dest);
    return dur;
  }
  const pad = (minDur - dur).toFixed(2);
  await ffmpeg([
    "-i",
    src,
    "-vf",
    `tpad=stop_mode=clone:stop_duration=${pad}`,
    "-af",
    `apad=pad_dur=${pad}`,
    "-t",
    String(minDur),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "21",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    dest,
  ]);
  return minDur;
}

const dlNames = {
  "life-last-seen": "01-The-Last-Seen.mp4",
  "life-papa-missed-call": "02-Papa-Missed-Call.mp4",
  "life-stolen-idea": "03-Stolen-Idea.mp4",
  "life-everyone-ahead": "04-Everyone-Ahead.mp4",
  "life-chaiwala": "05-Chaiwala-Kindness.mp4",
  "life-rejection-letter": "06-Rejection-Letter.mp4",
  "life-friend-stopped-calling": "07-Friend-Stopped-Calling.mp4",
};

async function buildReel(reel) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `life-${reel.id}-`));
  const clips = [];
  const total = reel.beats.length;

  try {
    for (let i = 0; i < reel.beats.length; i++) {
      const b = reel.beats[i];
      const img = path.join(root, "public", b.image.replace(/^\//, ""));
      const char = b.character
        ? path.join(root, "public", b.character.replace(/^\//, ""))
        : null;
      const audio = path.join(tmp, `a${i}.mp3`);
      const clip = path.join(tmp, `c${i}.mp4`);
      const spoken = b.narration;
      if (!spoken) throw new Error(`${reel.id} beat ${i + 1} missing narration`);
      process.stdout.write(`  ${reel.id} beat ${i + 1}/${total}\n`);
      await tts(spoken, voiceFor(b.speaker), audio);
      await enhanceVoice(audio);
      if (b.dramaticPause) await leadingSilence(audio, 0.85);
      await makeBeatClip({
        imagePath: img,
        characterPath: char,
        audioPath: audio,
        speaker: b.speaker,
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
    const coverChar = reel.beats[0].character
      ? path.join(root, "public", reel.beats[0].character.replace(/^\//, ""))
      : null;
    await makeEndCard({
      imagePath: cover,
      characterPath: coverChar,
      title: reel.title,
      dest: endClip,
    });
    clips.push(endClip);

    const raw = path.join(tmp, "full.mp4");
    await concatClips(clips, raw);

    const final = path.join(outDir, `${reel.id}.mp4`);
    const seconds = await finalizeReel(raw, final);

    const captionPath = path.join(outDir, `${reel.id}-caption.txt`);
    fs.writeFileSync(
      captionPath,
      `${reel.caption}\n\n${seconds.toFixed(0)}s · Hindi voice · Mobile safe zone\n`
    );

    const dl = path.join(dlDir, dlNames[reel.id] || `${reel.id}.mp4`);
    fs.copyFileSync(final, dl);
    fs.copyFileSync(captionPath, path.join(dlDir, `${reel.id}-caption.txt`));

    const mb = (fs.statSync(final).size / (1024 * 1024)).toFixed(2);
    console.log(`wrote ${final} (${seconds.toFixed(1)}s, ${mb} MB)`);
  } finally {
    fs.rmSync(tmp, { force: true, recursive: true });
  }
}

const only = process.argv[2];
const list = only ? lifeReels.filter((r) => r.id === only || r.id.includes(only)) : lifeReels;
for (const reel of list) {
  console.log(`Building ${reel.title}...`);
  await buildReel(reel);
}
