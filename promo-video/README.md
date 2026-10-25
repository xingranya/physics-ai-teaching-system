# 参赛宣传片（Remotion）

《大学物理 AI 智慧课堂》参赛系统宣传片：1920×1080 / 30fps / 约 88 秒，
配音用 MiMo TTS v2.5（`mimo-v2.5-tts`，音色「白桦」）。

## 成片

- `out/promo.mp4` — H.264 + AAC，约 15.7 MB
- 分镜抽帧：`out/f-*.png`

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
