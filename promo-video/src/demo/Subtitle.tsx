import { interpolate, useCurrentFrame } from 'remotion';

interface SubtitleProps {
  text: string;
  /** 配音从第几帧开始（字幕条常驻，文字按这个偏移出现） */
  startFrame: number;
  /** 本段字幕可用帧数（= 配音时长对应的帧数） */
  durationInFrames: number;
}

/** 底部字幕条的高度（画面 992 + 字幕条 88 = 1080）。 */
export const CAPTION_BAR_HEIGHT = 88;

/**
 * 按标点切句 → 尽量合并成整句（单行 ≤ 28 字）→ 去掉行尾的逗号/顿号。
 *
 * 为什么要合并：只按逗号切，会出现「章节与知识图谱，」这种半句就翻页的字幕，
 * 读起来一顿一顿的。合并后一行基本是一句完整的话。
 */
function splitLines(text: string): string[] {
  const clauses = text
    .split(/(?<=[。！？；])/u)
    .map((part) => part.trim())
    .filter(Boolean);

  const lines: string[] = [];
  let buffer = '';
  for (const clause of clauses) {
    if (buffer && (buffer + clause).length > 28) {
      lines.push(buffer);
      buffer = clause;
    } else {
      buffer += clause;
    }
  }
  if (buffer) lines.push(buffer);

  // 行尾的逗号 / 顿号去掉；句号、问号、感叹号保留。
  const cleaned = lines.map((line) => line.replace(/[，、；]+$/u, '')).filter((line) => line.length > 0);

  // 兜底：单句仍然过长时硬切，别让字幕条里换行。
  const wrapped: string[] = [];
  for (const line of cleaned) {
    if (line.length <= 30) {
      wrapped.push(line);
      continue;
    }
    for (let i = 0; i < line.length; i += 30) wrapped.push(line.slice(i, i + 30));
  }
  return wrapped.length > 0 ? wrapped : [text];
}

/**
 * 字幕条：固定在画面下方的深色带里。
 *
 * 不压在界面上的原因：录屏里下半部分常有输入框、播放器控件，
 * 字幕盖上去既挡内容又难读。单独一条 88px 的带子，读起来像讲解片。
 */
export const Subtitle = ({ text, startFrame, durationInFrames }: SubtitleProps) => {
  const frame = Math.max(0, useCurrentFrame() - startFrame);
  const lines = splitLines(text);
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);

  let cursor = 0;
  let current = lines[lines.length - 1];
  let lineStart = 0;

  for (const line of lines) {
    const share = Math.max(1, Math.round((line.length / totalChars) * durationInFrames));
    if (frame < cursor + share) {
      current = line;
      lineStart = cursor;
      break;
    }
    cursor += share;
  }

  const appear = interpolate(frame, [lineStart, lineStart + 4], [0.35, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: CAPTION_BAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A1120',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        opacity: appear,
      }}
    >
      <div
        style={{
          maxWidth: 1740,
          padding: '0 40px',
          color: '#F1F5F9',
          fontSize: 36,
          lineHeight: 1.2,
          letterSpacing: 0.6,
          textAlign: 'center',
          fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        }}
      >
        {current}
      </div>
    </div>
  );
};
