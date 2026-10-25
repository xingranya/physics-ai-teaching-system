import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';

/** 结尾：校徽 + 产品名 + 网址。留足时间让人截图。 */
export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glow = interpolate(frame, [0, 3 * fps], [0.2, 0.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 65%)',
          opacity: glow,
          filter: 'blur(18px)',
        }}
      />

      <Reveal delay={0.05} distance={20}>
        <Img src={staticFile('brand/emblem.png')} style={{ width: 128, height: 124 }} />
      </Reveal>

      <Reveal delay={0.25} distance={30}>
        <div style={{ marginTop: 34, fontSize: 68, fontWeight: 700, letterSpacing: 2 }}>
          大学物理 AI 智慧课堂
        </div>
      </Reveal>

      <Reveal delay={0.5}>
        <div style={{ marginTop: 18, fontSize: 26, color: theme.textDim, letterSpacing: 4 }}>
          长江大学文理学院
        </div>
      </Reveal>

      <Reveal delay={0.8} distance={18}>
        <div
          style={{
            marginTop: 52,
            padding: '16px 34px',
            borderRadius: 999,
            border: `1px solid ${theme.borderStrong}`,
            background: theme.panelStrong,
            fontSize: 30,
            letterSpacing: 1.5,
            fontFamily: theme.mono,
          }}
        >
          dun.xran.uk
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
