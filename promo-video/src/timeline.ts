import audio from './audio.json';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** 每段配音前留的气口（毫秒）。 */
const LEAD_MS = 450;
/** 每段配音后留的余韵（毫秒）。 */
const TAIL_MS = 750;
/** 结尾多停一会儿，让网址和校名被看清。 */
const OUTRO_TAIL_MS = 2800;

export type SceneId =
  | 'intro'
  | 'pain'
  | 'positioning'
  | 'student'
  | 'teacher'
  | 'ai'
  | 'tech'
  | 'outro';

export interface SceneTiming {
  id: SceneId;
  /** public/ 下的音频路径。 */
  file: string;
  /** 配音正文（字幕用）。 */
  text: string;
  /** 配音时长（毫秒）。 */
  ms: number;
  /** 配音在本场景内延迟多少帧开始。 */
  leadFrames: number;
  /** 本场景总帧数。 */
  frames: number;
}

export const SCENES: SceneTiming[] = audio.scenes.map((scene) => {
  const tail = scene.id === 'outro' ? OUTRO_TAIL_MS : TAIL_MS;
  return {
    id: scene.id as SceneId,
    file: scene.file,
    text: scene.text,
    ms: scene.ms,
    leadFrames: Math.round((LEAD_MS / 1000) * FPS),
    frames: Math.round(((scene.ms + LEAD_MS + tail) / 1000) * FPS),
  };
});

export const TOTAL_FRAMES = SCENES.reduce((sum, scene) => sum + scene.frames, 0);

/** 按 id 取场景，找不到时抛错（构建期就暴露，别等到渲染）。 */
export function sceneById(id: SceneId): SceneTiming {
  const found = SCENES.find((scene) => scene.id === id);
  if (!found) throw new Error(`时间轴里没有场景 ${id}`);
  return found;
}
