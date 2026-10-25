import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CAPTION_BAR_HEIGHT, Subtitle } from './Subtitle';
import { DEMO_SEGMENTS, DEMO_TOTAL_FRAMES, type DemoSegment } from './timeline';

const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const VIDEO_HEIGHT = 1080 - CAPTION_BAR_HEIGHT;

/** 顶部信息条：左侧当前页面，右侧站点域名。 */
const TopBar = ({ title }: { title: string }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 132,
        background: 'linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0))',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 26,
        left: 36,
        padding: '9px 18px',
        borderRadius: 10,
        background: 'rgba(2,6,23,0.72)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#E2E8F0',
        fontSize: 24,
        fontFamily: FONT,
        letterSpacing: 0.6,
      }}
    >
      {title}
    </div>
    <div
      style={{
        position: 'absolute',
        top: 26,
        right: 36,
        padding: '9px 18px',
        borderRadius: 10,
        background: 'rgba(2,6,23,0.72)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#93C5FD',
        fontSize: 22,
        fontFamily: '"SF Mono", Menlo, monospace',
      }}
    >
      dun.xran.uk
    </div>
  </>
);

const Segment = ({ segment }: { segment: DemoSegment }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // AI 生成那段录了 6 分半：前段整体快进，最后 10 秒回到原速，
  // 否则「课堂真的生成出来了」只会闪 0.2 秒，等于没拍到。
  const isTimeLapse = segment.id === 'c02_ai';
  const normalFrames = isTimeLapse ? Math.round(10 * fps) : 0;
  const fastFrames = isTimeLapse ? durationInFrames - normalFrames : durationInFrames;
  const normalSeconds = normalFrames / fps;
  const fastSpan = Math.max(1, segment.clipSeconds - normalSeconds);
  const fastRate = fastSpan / (fastFrames / fps);

  const fadeIn = interpolate(frame, [0, 9], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - 9, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeRate = isTimeLapse ? fastRate : segment.playbackRate;

  return (
    <AbsoluteFill style={{ background: '#0A1120' }}>
      {/* 录屏画面：底部字幕条占 88px，画面区 992px */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: VIDEO_HEIGHT,
          overflow: 'hidden',
        }}
      >
        {isTimeLapse ? (
          <>
            <Sequence durationInFrames={fastFrames}>
              <OffthreadVideo
                src={staticFile(segment.clip)}
                playbackRate={fastRate}
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Sequence>
            <Sequence from={fastFrames}>
              <OffthreadVideo
                src={staticFile(segment.clip)}
                trimBefore={Math.round(fastSpan * 30)}
                playbackRate={1}
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Sequence>
          </>
        ) : (
          <OffthreadVideo
            src={staticFile(segment.clip)}
            playbackRate={segment.playbackRate}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      <TopBar title={segment.title} />

      {badgeRate >= 2 && (!isTimeLapse || frame < fastFrames) ? (
        <div
          style={{
            position: 'absolute',
            top: 92,
            left: 36,
            padding: '8px 16px',
            borderRadius: 9,
            background: 'rgba(37,99,235,0.92)',
            color: '#FFFFFF',
            fontSize: 22,
            fontFamily: FONT,
            letterSpacing: 0.4,
          }}
        >
          ×{Math.round(badgeRate)} 快进 · 真实耗时约{' '}
          {Math.round(segment.clipSeconds / 60)} 分钟
        </div>
      ) : null}

      <Subtitle
        text={segment.narration}
        startFrame={segment.leadFrames}
        durationInFrames={segment.audioFrames}
      />

      <Sequence from={segment.leadFrames}>
        <Audio src={staticFile(segment.audio)} />
      </Sequence>

      {/* 转场：只在画面区压黑，字幕条保持稳定 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: VIDEO_HEIGHT,
          background: '#000',
          opacity: Math.max(fadeIn, fadeOut),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

/** 底部总进度条（全局帧）。 */
const ProgressBar = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / DEMO_TOTAL_FRAMES);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: 'rgba(255,255,255,0.10)',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3B82F6, #22D3EE)',
        }}
      />
    </div>
  );
};

/**
 * 实机演示主片。
 *
 * 每个分镜是一段真实录屏（Playwright 录制，含注入光标），
 * 女声讲解 + 底部字幕条 + 顶部页面标签 + 总进度条。
 * 录屏比配音短时用 playbackRate 慢放补足（下限 0.7），不冻帧。
 */
export const Demo = () => (
  <AbsoluteFill style={{ background: '#0A1120' }}>
    <Series>
      {DEMO_SEGMENTS.map((segment) => (
        <Series.Sequence key={segment.id} durationInFrames={segment.frames}>
          <Segment segment={segment} />
        </Series.Sequence>
      ))}
    </Series>
    <ProgressBar />
  </AbsoluteFill>
);
