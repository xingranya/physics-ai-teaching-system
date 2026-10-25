import type { ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

/**
 * 全局背景：深色渐变 + 细网格 + 两团缓慢漂移的辉光。
 * 每帧只算一次插值，放在背景组件里，避免污染场景组件。
 */
export const Backdrop = ({ children }: { children?: ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const drift = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 0%, ${theme.bgSoft} 0%, ${theme.bg} 55%, #04070E 100%)`,
        fontFamily: theme.font,
        color: theme.text,
        overflow: 'hidden',
      }}
    >
      {/* 网格 */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(90% 70% at 50% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(90% 70% at 50% 40%, black 30%, transparent 100%)',
        }}
      />
      {/* 辉光 */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          left: -220 + drift * 90,
          top: -360 + drift * 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.30) 0%, transparent 62%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 780,
          height: 780,
          right: -200 - drift * 70,
          bottom: -320 - drift * 30,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.20) 0%, transparent 62%)',
          filter: 'blur(30px)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
