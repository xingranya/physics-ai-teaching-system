import { AbsoluteFill } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';

const TAGS = ['校本身份', '学生 / 教师双角色', '零额度可演示', '每条结论可导出'];

/** 定位：一句话 + 四个标签。这句是全片的论点，停留最久。 */
export const PositioningScene = () => (
  <AbsoluteFill style={{ padding: '0 200px', justifyContent: 'center' }}>
    <Reveal delay={0.05}>
      <div style={{ fontSize: 24, letterSpacing: 8, color: theme.accentSoft }}>THE ANSWER</div>
    </Reveal>

    <Reveal delay={0.25} distance={36}>
      <div
        style={{
          marginTop: 26,
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.28,
          letterSpacing: 1,
        }}
      >
        一个校本化的
        <span style={{ color: theme.cyan }}>教学工作台</span>
      </div>
    </Reveal>

    <Reveal delay={0.55}>
      <div
        style={{
          marginTop: 30,
          fontSize: 30,
          lineHeight: 1.7,
          color: theme.textDim,
          maxWidth: 1180,
        }}
      >
        不是又一个通用 AI 工具，而是把校名、班级、课程、评价标准都长在系统里的课堂。
      </div>
    </Reveal>

    <div style={{ display: 'flex', gap: 18, marginTop: 62 }}>
      {TAGS.map((tag, index) => (
        <Reveal key={tag} delay={0.9 + index * 0.14} distance={22}>
          <div
            style={{
              padding: '16px 26px',
              borderRadius: 999,
              border: `1px solid ${theme.borderStrong}`,
              background: theme.panelStrong,
              fontSize: 25,
              color: theme.text,
            }}
          >
            {tag}
          </div>
        </Reveal>
      ))}
    </div>
  </AbsoluteFill>
);
