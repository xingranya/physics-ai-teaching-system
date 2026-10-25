import audio from './audio.json';
import clipData from './clips.json';

export const DEMO_FPS = 30;
export const DEMO_WIDTH = 1920;
export const DEMO_HEIGHT = 1080;

/** 每段配音前留的气口 / 后留的余韵（毫秒）。 */
const LEAD_MS = 500;
const TAIL_MS = 700;

/** 片段标题（画面左上角）。 */
const TITLES: Record<string, string> = {
  s00_login: '登录',
  s01_home: '首页',
  s02_overview: '学生端 · 学习总览',
  s03_diagnosis: '学生端 · 学情诊断',
  s04_curriculum: '学生端 · 章节与知识图谱',
  s05_projects: '学生端 · 项目匹配',
  s06_tasks: '学生端 · 任务闯关',
  s07_assistant: '学生端 · AI 助教',
  s08_lab: '学生端 · 虚拟实验',
  s09_report: '学生端 · 学习报告',
  t01_dashboard: '教师端 · 教学驾驶舱',
  t02_class: '教师端 · 班级画像',
  t03_curriculum: '教师端 · 课程项目矩阵',
  t04_evaluation: '教师端 · 评价复核',
  t05_insights: '教师端 · 教学洞察',
  c01_preset: '课堂 · 预置课堂包',
  c02_ai: '课堂 · AI 生成',
};

export interface DemoSegment {
  id: string;
  title: string;
  clip: string;
  audio: string;
  narration: string;
  /** 本段总帧数 */
  frames: number;
  /** 配音延迟多少帧进入 */
  leadFrames: number;
  /** 配音本身占多少帧（字幕只在这段里显示） */
  audioFrames: number;
  /** 录屏与配音不等长时的速度修正（>1 = 快进，<1 = 慢放） */
  playbackRate: number;
  /** 录屏原始时长（秒），用于「快进 N 倍」提示 */
  clipSeconds: number;
}

/**
 * 需要额外留白的片段：AI 生成那段录了 6 分多钟，
 * 配音只有几秒，后面要留时间让「快进后的生成过程 + 课堂出现」被看到。
 */
const EXTRA_TAIL_FRAMES: Record<string, number> = {
  c02_ai: 12 * DEMO_FPS,
};

const clipById = new Map(clipData.clips.map((clip) => [clip.id, clip]));

export const DEMO_SEGMENTS: DemoSegment[] = audio.scenes.map((scene) => {
  const clip = clipById.get(scene.id);
  if (!clip) throw new Error(`缺少录屏片段 ${scene.id}`);

  const extraTail = EXTRA_TAIL_FRAMES[scene.id] ?? 0;
  const targetSeconds = (scene.ms + LEAD_MS + TAIL_MS) / 1000 + extraTail / DEMO_FPS;

  // 录屏比目标短就慢放（不低于 0.7），比目标长就快进（AI 生成那段会是二十倍速）。
  const rawRate = clip.seconds / targetSeconds;
  const playbackRate = rawRate < 1 ? Math.max(0.7, rawRate) : Math.min(60, rawRate);

  return {
    id: scene.id,
    title: TITLES[scene.id] ?? scene.id,
    clip: clip.file,
    audio: `demo/audio/${scene.id}.wav`,
    narration: scene.text,
    frames: Math.round(targetSeconds * DEMO_FPS),
    leadFrames: Math.round((LEAD_MS / 1000) * DEMO_FPS),
    audioFrames: Math.round((scene.ms / 1000) * DEMO_FPS),
    playbackRate,
    clipSeconds: clip.seconds,
  };
});

export const DEMO_TOTAL_FRAMES = DEMO_SEGMENTS.reduce((sum, segment) => sum + segment.frames, 0);
