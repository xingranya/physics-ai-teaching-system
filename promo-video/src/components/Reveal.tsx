import type { ReactNode } from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface RevealProps {
  children: ReactNode;
  /** 延迟（秒） */
  delay?: number;
  /** 上浮距离（像素） */
  distance?: number;
  /** 时长（秒） */
  duration?: number;
  style?: React.CSSProperties;
}

/** 统一的入场：淡入 + 上浮。所有场景共用同一条缓动，节奏才一致。 */
export const Reveal = ({
  children,
  delay = 0,
  distance = 26,
  duration = 0.8,
  style,
}: RevealProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay * fps;

  const progress = interpolate(local, [0, duration * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity: progress,
        translate: `0px ${(1 - progress) * distance}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
