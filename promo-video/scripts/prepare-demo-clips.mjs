/**
 * 把 Playwright 录的 webm 转成 mp4，并探测时长。
 *
 * 为什么转：OffthreadVideo 在渲染时按帧 seek，webm(VP8) 的随机访问不如
 * H.264 稳；统一转成 yuv420p 的 mp4 后，Studio 预览与渲染都更可靠。
 *
 * 用法：SRC=/tmp/clips node scripts/prepare-demo-clips.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.SRC || '/tmp/clips';
const DEST = join(ROOT, 'public', 'demo', 'clips');

mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((name) => name.endsWith('.webm'));
if (files.length === 0) throw new Error(`${SRC} 里没有 webm`);

const clips = [];
for (const name of files) {
  const id = name.replace(/\.webm$/, '');
  const src = join(SRC, name);
  const dest = join(DEST, `${id}.mp4`);
  execFileSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      src,
      // Playwright 录出来的画面只有上面 996px，底部 84px 是采集面不足留下的灰边
      // （纯色页也这样，属工具行为）。这里裁掉，避免片子里出现一条灰带。
      '-vf',
      'crop=1920:992:0:0',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      '-movflags',
      '+faststart',
      dest,
    ],
    { stdio: 'inherit' },
  );
  const seconds = Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      dest,
    ])
      .toString()
      .trim(),
  );
  clips.push({ id, file: `demo/clips/${id}.mp4`, seconds: Math.round(seconds * 100) / 100 });
  console.log(`${id}: ${seconds.toFixed(2)}s`);
}

mkdirSync(join(ROOT, 'src', 'demo'), { recursive: true });
writeFileSync(join(ROOT, 'src', 'demo', 'clips.json'), `${JSON.stringify({ clips }, null, 2)}\n`);
console.log(`\n共 ${clips.length} 段`);
