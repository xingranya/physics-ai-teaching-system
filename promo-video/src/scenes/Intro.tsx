import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';

/** 开场：校名 + 产品名。全片唯一一次「大字」，后面都收着用。 */
export const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineWidth = interpolate(frame, [0.5 * fps, 1.8 * fps], [0, 460], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Reveal delay={0.1}>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 10,
            color: theme.textDim,
            textAlign: 'center',
          }}
        >
          长江大学文理学院
        </div>
      </Reveal>

      <Reveal delay={0.45} distance={40}>
        <div
          style={{
            marginTop: 34,
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: 2,
            lineHeight: 1.1,
            textAlign: 'center',
            background: `linear-gradient(120deg, #FFFFFF 10%, ${theme.accentSoft} 60%, ${theme.cyan} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          大学物理 AI 智慧课堂
        </div>
      </Reveal>

      <div
        style={{
          marginTop: 40,
          width: lineWidth,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.cyan}, transparent)`,
        }}
      />

      <Reveal delay={1.15}>
        <div style={{ marginTop: 34, fontSize: 28, color: theme.textDim, letterSpacing: 3 }}>
          诊断 · 匹配 · 闯关 · 实验 · 课堂
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
