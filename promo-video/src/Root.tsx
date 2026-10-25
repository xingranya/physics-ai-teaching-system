import { Composition } from 'remotion';
import { Demo } from './demo/Demo';
import { DEMO_FPS, DEMO_HEIGHT, DEMO_TOTAL_FRAMES, DEMO_WIDTH } from './demo/timeline';
import { Promo } from './Promo';
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './timeline';

export const RemotionRoot = () => (
  <>
    {/* 实机演示（当前主交付） */}
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={DEMO_TOTAL_FRAMES}
      fps={DEMO_FPS}
      width={DEMO_WIDTH}
      height={DEMO_HEIGHT}
    />
    {/* 早一版的宣传片，保留作备选 */}
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
