import { AbsoluteFill } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';
import { Screenshot } from '../components/Screenshot';

const FLOW = ['一句话需求', '课堂大纲', '逐场景内容', '直接播放'];

/** AI 生成课堂：四步流程逐项点亮，两张截图从两侧滑入。 */
export const AIScene = () => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 108, textAlign: 'center' }}>
      <Reveal delay={0.05}>
        <div style={{ fontSize: 22, letterSpacing: 8, color: theme.accentSoft }}>GENERATION</div>
      </Reveal>
      <Reveal delay={0.16} distance={28}>
        <div style={{ marginTop: 16, fontSize: 62, fontWeight: 700 }}>一句话，生成一堂课</div>
      </Reveal>

      <div
        style={{
          marginTop: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {FLOW.map((step, index) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Reveal delay={0.55 + index * 0.42} distance={18}>
              <div
                style={{
                  padding: '14px 24px',
                  borderRadius: 999,
                  border: `1px solid ${theme.borderStrong}`,
                  background: theme.panelStrong,
                  fontSize: 25,
                }}
              >
                {step}
              </div>
            </Reveal>
            {index < FLOW.length - 1 ? (
              <Reveal delay={0.7 + index * 0.42} distance={0}>
                <div style={{ color: theme.accentSoft, fontSize: 26 }}>→</div>
              </Reveal>
            ) : null}
          </div>
        ))}
      </div>
    </div>

    <Screenshot src="shots/home.png" width={880} x={140} y={430} delay={1.9} rotate={-1.2} />
    <Screenshot src="shots/classroom.png" width={800} x={1010} y={520} delay={2.5} rotate={1.2} />
  </AbsoluteFill>
);
