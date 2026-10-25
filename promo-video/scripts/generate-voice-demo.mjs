/**
 * 实机演示片配音：MiMo TTS v2.5，女声「冰糖」。
 *
 * 输出 public/demo/audio/<id>.wav + src/demo/audio.json（含每段时长）。
 *
 * 用法：MIMO_API_KEY=... node scripts/generate-voice-demo.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'demo', 'audio');

const API = 'https://api.xiaomimimo.com/v1/chat/completions';
const MODEL = 'mimo-v2.5-tts';
const VOICE = process.env.MIMO_VOICE || '冰糖';
const STYLE =
  '清晰、亲切的女声，像在给同学当面演示一个系统。语速中等偏快，吐字干净，' +
  '句与句之间留一点短停顿，不要播音腔，也不要夸张的营销语气。';

/** 每段对应一个录制片段，文案只讲屏幕上正在发生的事。 */
export const NARRATION = [
  { id: 's00_login', text: '先登录。账号体系是本地账号加会话门禁，注册和登录都在这一页。' },
  { id: 's01_home', text: '打开站点，首页就是课程入口。上面可以输入需求，下面是六个预置课堂包。' },
  { id: 's02_overview', text: '登录后进入学生端。学习总览把本周任务、学习进度和待办放在同一屏。' },
  { id: 's03_diagnosis', text: '学情诊断按知识点给出掌握度，哪一块薄弱，颜色直接告诉你。' },
  { id: 's04_curriculum', text: '章节与知识图谱，把整门课的知识依赖关系画成一张图。' },
  { id: 's05_projects', text: '项目匹配会结合薄弱知识点，推荐可以动手做的课题。' },
  { id: 's06_tasks', text: '任务闯关把练习拆成关卡，提交之后立刻给出对错和解析。' },
  { id: 's07_assistant', text: 'AI 助教可以就当前章节提问，回答会带上引用来源。' },
  { id: 's08_lab', text: '虚拟实验可以拖动参数，现象实时变化。' },
  { id: 's09_report', text: '学习报告汇总这一阶段的过程证据，可以导出带走。' },
  { id: 't01_dashboard', text: '切到教师端。驾驶舱先回答一个问题：今天该关注谁。' },
  { id: 't02_class', text: '班级画像按学生列出投入度和风险，点开就能看到细节。' },
  { id: 't03_curriculum', text: '课程项目矩阵，把课程目标和项目一一对应。' },
  { id: 't04_evaluation', text: '评价复核可以改分、写理由，然后一键导出汇总。' },
  { id: 't05_insights', text: '教学洞察把班级数据聚成几条可以执行的建议。' },
  { id: 'c01_preset', text: '回到首页，点开预置课堂包，直接进入播放器。' },
  { id: 'c02_ai', text: '也可以直接描述需求，让系统生成一堂课。' },
];

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
  if (!response.ok) throw new Error(`TTS ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const json = await response.json();
  const base64 = json?.choices?.[0]?.message?.audio?.data;
  if (!base64) throw new Error(`TTS 无 audio.data: ${JSON.stringify(json).slice(0, 160)}`);
  return Buffer.from(base64, 'base64');
}

async function main() {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) throw new Error('缺少 MIMO_API_KEY');
  mkdirSync(AUDIO_DIR, { recursive: true });

  const scenes = [];
  for (const item of NARRATION) {
    process.stdout.write(`[${item.id}] `);
    let buffer;
    for (let attempt = 1; ; attempt += 1) {
      try {
        buffer = await synth(item.text, apiKey);
        break;
      } catch (error) {
        if (attempt >= 3) throw error;
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    }
    writeFileSync(join(AUDIO_DIR, `${item.id}.wav`), buffer);
    const ms = wavDurationMs(buffer);
    scenes.push({ id: item.id, ms, text: item.text });
    console.log(`${(ms / 1000).toFixed(2)}s`);
  }

  const total = scenes.reduce((a, s) => a + s.ms, 0);
  mkdirSync(join(ROOT, 'src', 'demo'), { recursive: true });
  writeFileSync(
    join(ROOT, 'src', 'demo', 'audio.json'),
    `${JSON.stringify({ voice: VOICE, totalMs: total, scenes }, null, 2)}\n`,
  );
  console.log(`\n共 ${scenes.length} 段，合计 ${(total / 1000).toFixed(1)} 秒`);
}

main().catch((error) => {
  console.error('失败：', error.message);
  process.exit(1);
});
