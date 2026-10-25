import { AbsoluteFill, Audio, Sequence, Series, staticFile } from 'remotion';
import { Backdrop } from './components/Backdrop';
import { SCENES, type SceneId } from './timeline';
import { IntroScene } from './scenes/Intro';
import { PainScene } from './scenes/Pain';
import { PositioningScene } from './scenes/Positioning';
import { StudentScene } from './scenes/Student';
import { TeacherScene } from './scenes/Teacher';
import { AIScene } from './scenes/AI';
import { TechScene } from './scenes/Tech';
import { OutroScene } from './scenes/Outro';

const SCENE_COMPONENTS: Record<SceneId, () => React.JSX.Element> = {
  intro: IntroScene,
  pain: PainScene,
  positioning: PositioningScene,
  student: StudentScene,
  teacher: TeacherScene,
  ai: AIScene,
  tech: TechScene,
  outro: OutroScene,
};

/**
 * 主片：每个分镜一个 Series.Sequence，配音按 leadFrames 延迟进入。
 *
 * 时长全部来自 audio.json（TTS 实测），改文案只需重跑配音脚本，
 * 时间轴会自动跟着变——不写死秒数。
 */
export const Promo = () => (
  <Backdrop>
    <Series>
      {SCENES.map((scene) => {
        const Scene = SCENE_COMPONENTS[scene.id];
        return (
          <Series.Sequence key={scene.id} durationInFrames={scene.frames}>
            <AbsoluteFill>
              <Scene />
              <Sequence from={scene.leadFrames}>
                <Audio src={staticFile(scene.file)} />
              </Sequence>
            </AbsoluteFill>
          </Series.Sequence>
        );
      })}
    </Series>
  </Backdrop>
);
