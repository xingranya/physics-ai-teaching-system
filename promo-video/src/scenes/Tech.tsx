import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';

interface Metric {
  value: number;
  suffix?: string;
  decimals?: number;
  unit: string;
  note: string;
}

const METRICS: Metric[] = [
  { value: 13, unit: '个教学视图', note: '学生 8 + 教师 5' },
  { value: 6, unit: '个预置课堂包', note: '零额度也能完整播放' },
  { value: 120, suffix: 's', unit: '函数超时上限', note: '平台默认只有 30 秒' },
  { value: 4, unit: '路并行生成', note: '整堂课 20 分钟 → 8 分钟' },
  { value: 119.8, decimals: 1, unit: 'MiB 函数包', note: '平台上限 128 MiB' },
];

/** 数字卡片：逐个 count-up。数字是这支片子最硬的部分，给足停留。 */
export const TechScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ padding: '0 140px', justifyContent: 'center' }}>
      <Reveal delay={0.05}>
        <div style={{ fontSize: 22, letterSpacing: 8, color: theme.accentSoft }}>ENGINEERING</div>
      </Reveal>
      <Reveal delay={0.16} distance={30}>
        <div style={{ marginTop: 16, fontSize: 60, fontWeight: 700 }}>能跑起来，才算做完</div>
      </Reveal>

      <div style={{ display: 'flex', gap: 20, marginTop: 66 }}>
        {METRICS.map((metric, index) => {
          const start = (0.6 + index * 0.22) * fps;
          const progress = interpolate(frame, [start, start + 1.2 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          const shown = (metric.value * progress).toFixed(metric.decimals ?? 0);

          return (
            <Reveal key={metric.unit} delay={0.6 + index * 0.22} distance={36} style={{ flex: 1 }}>
              <div
                style={{
                  padding: '32px 26px 34px',
                  borderRadius: 18,
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  minHeight: 236,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 62, fontWeight: 700, color: theme.text }}>{shown}</span>
                  {metric.suffix ? (
                    <span style={{ fontSize: 28, color: theme.accentSoft }}>{metric.suffix}</span>
                  ) : null}
                </div>
                <div style={{ marginTop: 10, fontSize: 24, color: theme.text }}>{metric.unit}</div>
                <div style={{ marginTop: 16, fontSize: 19, lineHeight: 1.5, color: theme.textFaint }}>
                  {metric.note}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={1.9}>
        <div
          style={{
            marginTop: 46,
            fontSize: 22,
            color: theme.textFaint,
            letterSpacing: 1.5,
            fontFamily: theme.mono,
          }}
        >
          Next.js 16 · EdgeOne Pages · Makers 模型网关 · minimax-m3
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
