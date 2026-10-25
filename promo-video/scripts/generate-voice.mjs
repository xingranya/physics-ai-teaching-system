/**
 * 用 MiMo TTS v2.5 生成宣传片配音。
 *
 * 接口是 OpenAI 兼容的 /chat/completions：
 *   user      → 风格指令（不进音频）
 *   assistant → 要朗读的正文
 *   audio     → { format: 'wav', voice }
 *
 * 输出：public/audio/<id>.wav + src/audio.json（含每段时长，供时间轴使用）
 *
 * 用法：MIMO_API_KEY=... node scripts/generate-voice.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'audio');

const API = 'https://api.xiaomimimo.com/v1/chat/completions';
const MODEL = 'mimo-v2.5-tts';
const VOICE = process.env.MIMO_VOICE || '白桦';
const STYLE =
  '沉稳、自信、略带温度的男声，像在向评委介绍一个自己打磨很久的作品。语速中等偏慢，' +
  '吐字清晰，关键数字前稍作停顿，不要夸张煽情，也不要播音腔。';

/** 分镜文案：id 与 src/scenes.ts 中的场景一一对应。 */
export const SCENES = [
  {
    id: 'intro',
    text: '在大学物理的课堂上，最难的不是讲清楚一个公式，而是让每一个学生，都被看见。',
  },
  { id: 'pain', text: '备课耗时间，学情靠印象，课堂演示还常常被网络卡住。' },
  { id: 'positioning', text: '我们把这些事，做成了一个校本化的教学工作台。大学物理，AI 智慧课堂。' },
  {
    id: 'student',
    text: '学生端八个视图，从学习总览、学情诊断，到虚拟实验、学习报告，一条线走完。',
  },
  {
    id: 'teacher',
    text: '教师端五个视图，班级画像、课程矩阵、评价复核，每一条判断，都能导出成证据。',
  },
  { id: 'ai', text: '只要一句话，就能生成一堂可以播放的课。大纲、场景、讲稿，自动编排。' },
  {
    id: 'tech',
    text: '底座是 Next.js 和 EdgeOne。函数超时一百二十秒，四路并行生成，整堂课从二十分钟，压到八分钟。',
  },
  { id: 'outro', text: '长江大学文理学院，大学物理 AI 智慧课堂。' },
];

/** 从 WAV 头算时长（毫秒）。 */
function wavDurationMs(buffer) {
  let offset = 12;
  let byteRate = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') byteRate = buffer.readUInt32LE(offset + 16);
    if (id === 'data') {
      const bytes = Math.min(size, buffer.length - offset - 8);
      return byteRate > 0 ? Math.round((bytes / byteRate) * 1000) : 0;
    }
    offset += 8 + size + (size % 2);
  }
  return 0;
}

async function synth(text, apiKey) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: STYLE },
        { role: 'assistant', content: text },
      ],
      audio: { format: 'wav', voice: VOICE },
    }),
  });
  if (!response.ok) {
    throw new Error(`TTS ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const json = await response.json();
  const base64 = json?.choices?.[0]?.message?.audio?.data;
  if (!base64) throw new Error(`TTS 返回里没有 audio.data：${JSON.stringify(json).slice(0, 200)}`);
  return Buffer.from(base64, 'base64');
}

async function main() {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) throw new Error('缺少 MIMO_API_KEY');
  mkdirSync(AUDIO_DIR, { recursive: true });

  const timeline = [];
  for (const scene of SCENES) {
    process.stdout.write(`[${scene.id}] 生成中… `);
    let buffer;
    for (let attempt = 1; ; attempt += 1) {
      try {
        buffer = await synth(scene.text, apiKey);
        break;
      } catch (error) {
        if (attempt >= 3) throw error;
        process.stdout.write(`重试(${attempt})… `);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    const file = join(AUDIO_DIR, `${scene.id}.wav`);
    writeFileSync(file, buffer);
    const ms = wavDurationMs(buffer);
    timeline.push({ id: scene.id, file: `audio/${scene.id}.wav`, ms, text: scene.text });
    console.log(`${(ms / 1000).toFixed(2)}s / ${(buffer.length / 1024).toFixed(0)}KB`);
  }

  const total = timeline.reduce((a, t) => a + t.ms, 0);
  writeFileSync(
    join(ROOT, 'src', 'audio.json'),
    `${JSON.stringify({ voice: VOICE, totalMs: total, scenes: timeline }, null, 2)}\n`,
  );
  console.log(`\n共 ${timeline.length} 段，合计 ${(total / 1000).toFixed(1)} 秒`);
}

main().catch((error) => {
  console.error('失败：', error.message);
  process.exit(1);
});
