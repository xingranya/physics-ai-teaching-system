import { AbsoluteFill, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';

const PAINS = [
  { k: '01', title: '备课耗时间', desc: '一份课件从找素材到排完版，一晚上就过去了' },
  { k: '02', title: '学情靠印象', desc: '谁卡在哪一步，期中考完才发现' },
  { k: '03', title: '演示靠网络', desc: '断网、限流、额度用完，课堂就停在加载中' },
];

/** 痛点：三张卡片错位入场，节奏要快，不解释。 */
export const PainScene = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ padding: '0 180px', justifyContent: 'center' }}>
      <Reveal delay={0.05}>
        <div style={{ fontSize: 24, letterSpacing: 8, color: theme.accentSoft }}>THE PROBLEM</div>
      </Reveal>
      <Reveal delay={0.2} distance={34}>
        <div style={{ marginTop: 22, fontSize: 68, fontWeight: 700, letterSpacing: 1 }}>
          三件一直没解决的事
        </div>
      </Reveal>

      <div style={{ display: 'flex', gap: 28, marginTop: 78 }}>
        {PAINS.map((pain, index) => (
          <Reveal key={pain.k} delay={0.55 + index * 0.22} distance={40} style={{ flex: 1 }}>
            <div
              style={{
                padding: '38px 34px 40px',
                borderRadius: 20,
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                minHeight: 268,
              }}
            >
              <div style={{ fontFamily: theme.mono, fontSize: 18, color: theme.accentSoft }}>
                {pain.k}
              </div>
              <div style={{ marginTop: 26, fontSize: 40, fontWeight: 600 }}>{pain.title}</div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 24,
                  lineHeight: 1.6,
                  color: theme.textDim,
                }}
              >
                {pain.desc}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};
