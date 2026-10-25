# 参赛宣传片（Remotion）

《大学物理 AI 智慧课堂》参赛系统宣传片：1920×1080 / 30fps / 约 88 秒，
配音用 MiMo TTS v2.5（`mimo-v2.5-tts`，音色「白桦」）。

## 成片

- `out/promo.mp4` — H.264 + AAC，约 15.7 MB
- 分镜抽帧：`out/f-*.png`


## 实机演示（Demo，当前主交付）

`out/demo.mp4`：1920×1080 / 30fps / 约 128 秒，**全片都是站点真实录屏**，
不是动效拼贴。17 段依次覆盖：

| 段 | 内容 |
| --- | --- |
| s00 | 登录页（本地账号 + 会话门禁，注册/登录同页） |
| s01 | 首页（需求输入 + 6 个预置课堂包） |
| s02–s09 | 学生端 8 视图：学习总览 / 学情诊断 / 章节图谱 / 项目匹配 / 任务闯关 / AI 助教 / 虚拟实验 / 学习报告 |
| t01–t05 | 教师端 5 视图：驾驶舱 / 班级画像 / 课程矩阵 / 评价复核（真实触发导出）/ 教学洞察 |
| c01 | 预置课堂包 → 播放器 |
| c02 | 真实 AI 生成：输入需求 → 生成（约 7 分钟，×52 快进）→ 课堂出现后原速播放 |

制作链路：

1. `record-demo.cjs`（在 /tmp，思路见下）用 Playwright 逐段录 webm：
   每段独立 context + `storageState` 复用登录态，页面内注入跟随鼠标的假光标
   （Playwright 录屏不含系统光标），点击时画涟漪。
2. `scripts/prepare-demo-clips.mjs`：webm → H.264 mp4，并裁掉 Playwright
   采集面不足留下的底部灰边（实测画面只有上面 996px）。
3. `scripts/generate-voice-demo.mjs`：MiMo TTS 女声「冰糖」逐段配音。
4. `src/demo/Demo.tsx`：OffthreadVideo 全屏 + 底部字幕条 + 顶部页面标签 + 总进度条。
   录屏比配音短时用 `playbackRate` 慢放补足（下限 0.7），不冻帧。

重新录制要点：`record-demo.cjs` 里的 `SEGMENTS` 决定录哪些页面与停留时长；
录完跑 `prepare-demo-clips.mjs` 与 `generate-voice-demo.mjs`，再渲染即可。

## 结构

```
src/
  timeline.ts        时间轴：时长全部来自 audio.json，不写死秒数
  audio.json         配音实测时长（脚本生成）
  Promo.tsx          主片：Series 串分镜 + Audio 按 leadFrames 延迟进入
  components/        Backdrop / Reveal / Screenshot
  scenes/            Intro / Pain / Positioning / Student / Teacher / AI / Tech / Outro
public/
  shots/             站点真实截图（Playwright 抓的 1600×1000 @2x）
  audio/             八段配音
scripts/
  generate-voice.mjs 调 MiMo TTS 生成配音并写回 audio.json
```

## 常用命令

```bash
npm install
npx remotion studio                 # 预览（Studio）
MIMO_API_KEY=... node scripts/generate-voice.mjs   # 重新配音（改文案后必跑）
npx remotion render Promo out/promo.mp4 --codec=h264 --crf=18
```

> 本机注意：这个环境给 Node 注入了文件系统 shim，Remotion 建临时目录会被拦。
> 渲染时用 `env -u NODE_OPTIONS npx remotion ...` 绕开。

## 改文案的正确顺序

1. 改 `scripts/generate-voice.mjs` 里的 `SCENES`；
2. 重跑配音脚本（会覆盖 `public/audio/*.wav` 并重写 `src/audio.json`）；
3. 直接渲染——时间轴跟着音频走，不用手改帧数。

## 配音

接口是 OpenAI 兼容的 `/chat/completions`：

- `user` 消息 = 风格指令（不进音频）
- `assistant` 消息 = 要朗读的正文
- `audio: { format: 'wav', voice: '白桦' }`

返回 `choices[0].message.audio.data`（base64 WAV，24kHz / 单声道 / 16bit）。
