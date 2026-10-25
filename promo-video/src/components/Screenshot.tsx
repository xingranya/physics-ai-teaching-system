import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

interface ScreenshotProps {
  /** public/ 下的文件名，例如 shots/overview.png */
  src: string;
  /** 卡片宽度（像素） */
  width: number;
  /** 卡片在画面中的左上角 */
  x: number;
  y: number;
  /** 入场延迟（帧） */
  delay?: number;
  /** 卡片轻微旋转，制造版面感 */
  rotate?: number;
  /** 是否显示浏览器顶栏 */
  chrome?: boolean;
  /** 额外的整体透明度（用于交叉淡入） */
  opacity?: number;
}

/**
 * 截图卡片：浏览器外框 + 缓慢推近（Ken Burns）。
 *
 * 推近幅度刻意做小（1.02 → 1.06）：宣传片里截图是「证据」，
 * 动得太快会让人看不清界面本身。
 */
export const Screenshot = ({
  src,
  width,
  x,
  y,
  delay = 0,
  rotate = 0,
  chrome = true,
  opacity = 1,
}: ScreenshotProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const local = frame - delay;

  const appear = interpolate(local, [0, 0.9 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const zoom = interpolate(frame, [0, durationInFrames], [1.02, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  const ratio = 1000 / 1600; // 截图原始比例 1600×1000
  const height = width * ratio;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity: appear * opacity,
        translate: interpolate(local, [0, 0.9 * fps], ['0px 28px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        rotate: `${rotate}deg`,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${theme.borderStrong}`,
        background: '#0B1220',
        boxShadow: '0 40px 90px rgba(2,6,23,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {chrome ? (
        <div
          style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            background: '#111A2C',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {['#F87171', '#FBBF24', '#34D399'].map((color) => (
            <span
              key={color}
              style={{ width: 9, height: 9, borderRadius: '50%', background: color, opacity: 0.85 }}
            />
          ))}
          <div
            style={{
              marginLeft: 10,
              flex: 1,
              height: 18,
              borderRadius: 9,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: 10,
              color: theme.textFaint,
              letterSpacing: 0.4,
            }}
          >
            dun.xran.uk
          </div>
        </div>
      ) : null}
      <div style={{ width: '100%', height: chrome ? height - 34 : height, overflow: 'hidden' }}>
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            scale: zoom,
          }}
        />
      </div>
    </div>
  );
};
