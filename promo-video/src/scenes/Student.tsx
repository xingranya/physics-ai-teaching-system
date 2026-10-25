import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';
import { Screenshot } from '../components/Screenshot';

const VIEWS = [
  '学习总览',
  '学情诊断',
  '章节与知识图谱',
  '项目匹配',
  '任务闯关',
  'AI 助教',
  '虚拟实验',
  '学习报告',
];

/**
 * 学生端：左侧八个视图逐项点亮，右侧截图推近。
 *
 * 高亮用「按时间均分」而不是逐项 spring：8 项要在 10 秒里点完，
 * 均匀节奏比弹性更稳，也不会抢配音。
 */
export const StudentScene = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const start = 1.1 * fps;
  const step = ((durationInFrames - start - 0.6 * fps) / VIEWS.length) as number;

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 150, top: 170, width: 470 }}>
        <Reveal delay={0.05}>
          <div style={{ fontSize: 22, letterSpacing: 7, color: theme.accentSoft }}>STUDENT</div>
        </Reveal>
        <Reveal delay={0.15} distance={30}>
          <div style={{ marginTop: 18, fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>
            学生端
            <span style={{ color: theme.textFaint, fontSize: 40, marginLeft: 12 }}>8 个视图</span>
          </div>
        </Reveal>

        <div style={{ marginTop: 52 }}>
          {VIEWS.map((view, index) => {
            const activeAt = start + index * step;
            const active = interpolate(frame, [activeAt, activeAt + 0.35 * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={view}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 20,
                  opacity: 0.34 + active * 0.66,
                  translate: `${active * 10}px 0px`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: active > 0.5 ? theme.cyan : theme.textFaint,
                    boxShadow: active > 0.5 ? `0 0 14px ${theme.cyan}` : 'none',
                  }}
                />
                <div
                  style={{
                    fontSize: 30,
                    color: active > 0.5 ? theme.text : theme.textDim,
                    fontWeight: active > 0.5 ? 600 : 400,
                  }}
                >
                  {view}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Screenshot src="shots/overview.png" width={1120} x={680} y={168} delay={0.2} rotate={-0.6} />
    </AbsoluteFill>
  );
};
