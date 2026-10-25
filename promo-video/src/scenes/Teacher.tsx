import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { Reveal } from '../components/Reveal';
import { Screenshot } from '../components/Screenshot';

const SHOTS = [
  { src: 'shots/teacher-dashboard.png', label: '教学驾驶舱', desc: '今天该关注谁，一眼看到' },
  { src: 'shots/teacher-evaluation.png', label: '评价复核', desc: '复核分与理由，可导出成 Markdown' },
];

/**
 * 教师端：两张截图切换。
 *
 * 切换方式是「底层常亮 + 上层淡入」，不是双向交叉淡化——
 * 后者在中点两层各半透明，整屏会明显发暗（实测 48 秒处几乎看不清）。
 * 文字则在中点硬切，避免两段标题重叠成重影。
 */
export const TeacherScene = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const switchAt = durationInFrames * 0.52;
  const fade = interpolate(frame, [switchAt - 0.35 * fps, switchAt + 0.55 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const active = fade > 0.5 ? 1 : 0;

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 150, top: 168, width: 500 }}>
        <Reveal delay={0.05}>
          <div style={{ fontSize: 22, letterSpacing: 7, color: theme.accentSoft }}>TEACHER</div>
        </Reveal>
        <Reveal delay={0.15} distance={30}>
          <div style={{ marginTop: 18, fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>
            教师端
            <span style={{ color: theme.textFaint, fontSize: 40, marginLeft: 12 }}>5 个视图</span>
          </div>
        </Reveal>

        <div style={{ marginTop: 60, height: 220 }}>
          {SHOTS.map((shot, index) => (
            <div
              key={shot.label}
              style={{
                position: 'absolute',
                opacity: index === active ? 1 : 0,
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 700 }}>{shot.label}</div>
              <div style={{ marginTop: 18, fontSize: 26, lineHeight: 1.6, color: theme.textDim }}>
                {shot.desc}
              </div>
            </div>
          ))}
        </div>

        <Reveal delay={0.9}>
          <div
            style={{
              marginTop: 10,
              display: 'inline-flex',
              gap: 12,
              padding: '14px 22px',
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              background: theme.panel,
              fontSize: 21,
              color: theme.textDim,
            }}
          >
            <span style={{ color: theme.cyan }}>导出</span>
            教学评价复核-文理学院.md
          </div>
        </Reveal>
      </div>

      <Screenshot src={SHOTS[0].src} width={1100} x={700} y={172} delay={0.2} rotate={0.5} />
      <Screenshot
        src={SHOTS[1].src}
        width={1100}
        x={700}
        y={172}
        delay={0}
        rotate={0.5}
        opacity={fade}
      />
      <div
        style={{
          position: 'absolute',
          left: 150,
          bottom: 120,
          fontSize: 20,
          color: theme.textFaint,
        }}
      >
        当前页：{SHOTS[active].label}
      </div>
    </AbsoluteFill>
  );
};
