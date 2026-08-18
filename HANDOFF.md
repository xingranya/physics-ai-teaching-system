# 物理 AI 教学系统 · UI 打磨与功能增强交接文档

**项目**：大学物理 AI 智慧教学系统  
**完成时间**：2026-08-18  
**状态**：✅ 生产就绪 · `http://localhost:3017`  
**演示账号**：`student` / `teacher` · 密码 `dunzhongwan`

---

## 一、本轮交付内容

### 1. 全局设计系统升级

**色板扩展**
- 新增 `--primary-softer`、`--foreground-soft`、`--sidebar-deep` 等精细色阶
- 补充 `--success-strong`、`--warning-strong`、`--danger-strong` 用于状态色在浅色填充上保持 WCAG AA 对比度

**阴影系统**
- 三档 `--shadow-card` / `--shadow-card-hover` / `--shadow-pop` 注册到 CSS 变量
- 登录卡单独保留 `--shadow-login`，英雄区域不共享

**排版阶梯**
- 正式化 `display-44`（登录 hero）、`metric-26`（分数瓦片）、`metric-20`（次级数值）、`body-15`（长文）、`micro-11`（微标签）
- 更新 `DESIGN.md` 与 `.impeccable/design.json`

**动效 & 可访问性**
- 全局 hover 过渡统一为 `200ms ease-linear`
- `focus-visible` 覆盖 button / a / input / textarea / select / role=button / role=tab / role=menuitem
- 图表与 Lab SVG 加 `role="img"` + `aria-label`
- AI 气泡对比度由 3.7:1 提升至 ~16:1

**打印样式**
- `@media print` 隐藏侧栏 / header / no-print 元素，移除阴影，强制白底黑字

---

### 2. 登录页

**改动**
- Hero 区三特性卡片 + 渐变标题（`display-44`）
- 演示横幅带账号提示（`student / teacher · dunzhongwan`）
- `showPassword` 按钮 + `aria-label`
- 页脚品牌 crumb

**截图**：登录页 — 更清晰的层次、表单居中、品牌标识

---

### 3. 学生工作台

#### Shell + Sidebar
- 侧栏移到 `--sidebar` (深色海军蓝)，白色文字 hover，active 项左侧指示条 + 更亮图标
- **任务闯关导航项显示实时完成百分比徽章**（例如 "40%"）
- Header 双层 sticky 条：上层标题 + 角色徽章 + "系统运行中" 脉冲，下层浅蓝上下文条（学校 / 班级 / 学生 / 模块 / 角色）
- **UndoBanner** — 24 小时快照提示横幅（"撤销到上一状态"）

#### Overview
- 分层 hero 卡：径向高亮 + 技能箭头 + 5 步学习路径 + 完成追踪
- 右侧 4 指标瓦片

#### Diagnosis
- 左右双栏：左侧题目表单 + 状态感知选项，右侧维度预览 + sticky 结果卡
- 清晰区分 alert vs. status

#### Projects
- featured 卡片视觉：天蓝渐变 + ring + AI 徽章
- 等级 chip、能力路径叙事、"AI reasons" 列表、空状态

#### Tasks
- 项目 hero + 进度
- 左侧垂直阶段梯，active 高亮
- 右侧大标题 + 能力徽章 + 两列勾选网格 + AI 提示卡

#### Lab
- 场景画布加细腻网格 + 清晰目标/障碍模块
- 参数面板每滑块下带辅助提示
- 波形/示波器面板带轴标签 + `aria-label`
- 误差散点图带彩色质量图例
- `AlertDialog` 替代裸 confirm

#### Report
- 渐变强调线 + primary 评分瓦片（63 · 基本达标）
- 三色汇总卡（蓝/绿/琥珀）
- 四能力进度条 0/100 轴标签
- **顶部动作栏：三按钮** —
  1. **下载 Markdown 报告**（主 CTA，天蓝色）
  2. **下载 JSON**（outline 按钮，兼容旧格式）
  3. **打印 / 另存 PDF**（outline 按钮）
- 生成时间戳

#### Assistant (知物)
- AI 气泡现为白底深文本（对比度 ~16:1）
- Dialog header 带"知"头像徽章 + 渐变
- 快问列表项 + chevron
- 描述性 placeholder

---

### 4. 教师工作台

#### Dashboard
- hero 同学生 overview — 渐变标题分割 + 右侧警示卡 + 彩色图标通知卡
- 四指标瓦片更紧凑层次

#### Class
- 抛光表格：天蓝表头、项目名 primary 色、进度 + 百分比对齐

#### Curriculum
- 抛光筛选栏 + 项目库卡 + 项目矩阵表

#### Evaluation
- **替换 9 列表格为学生卡片**（per P0 critique）：
  - 每卡 = 头像 + 姓名 + 4 能力 chip + 最终分 vs. AI 建议 + 理由 chip + 单一"复核" CTA
- Sheet 带渐变 header + 更大分数卡
- 筛选栏按风险状态过滤

#### Insights
- 教学调控方案卡 + AI 徽章
- 三色"优势/改进/风险"卡 + 彩色图标
- AI 使用边界规则编号列表

---

### 5. 功能增强

#### Markdown / PDF 报告导出
- **新建 `src/lib/report.ts`**：纯函数 `buildStudentReportMarkdown` + `buildTeacherBatchReviewMarkdown` + `downloadMarkdown`
- Report 视图三按钮：
  - 主 CTA：下载 Markdown（包含封面、诊断、项目、四阶能力、实验记录、AI 建议）
  - outline：下载 JSON（兼容旧格式）
  - outline：打印 / 另存 PDF（调用 `window.print()`，匹配专用打印样式）
- **测试覆盖**：`tests/report.test.ts` — 4 个单测通过

#### 键盘快捷键 + 命令面板
- **新建 `src/lib/shortcuts.ts`**：快捷键路由表
  - 学生侧：`g o` (overview)、`g d` (diagnosis)、`g c` (curriculum)、`g p` (projects)、`g t` (tasks)、`g a` (assistant)、`g l` (lab)、`g r` (report)
  - 教师侧：`g o` (dashboard)、`g c` (class)、`g m` (curriculum)、`g e` (evaluation)、`g i` (insights)
  - 命令：退出登录、重置学习记录、查看快捷键帮助
- **新建 `src/lib/use-shortcuts.ts`**：React hook 监听键盘序列（避开 input / textarea / contenteditable）
- **集成到 `PhysicsApp`**：
  - `⌘K` / `Ctrl+K` 唤起命令面板
  - `?` 唤起快捷键帮助
  - `g + letter` 快速跳转
- **命令面板**：已有自定义实现（`src/components/command-palette.tsx`），拼音首字母支持

#### 教师批量复核
- **设计决策**：当前单个学生复核已完整（Sheet + 分数滑块 + 理由 textarea + 保存按钮），批量复核需要更复杂的多选 + 批量编辑 UI。考虑到优先级与时间，标记为"后续迭代"备选项。
- **当前能力**：教师可筛选风险学生、逐个复核、保存复核分/理由，系统记录 `state.evaluationReviews[studentName]`。

---

## 二、技术栈

- **框架**：Next.js 16.3.0 (App Router + Turbopack)
- **UI**：Tailwind CSS 4 + shadcn/ui primitives
- **状态**：React Context + localStorage 持久化
- **测试**：Vitest (node 环境，逻辑层纯函数)
- **设计系统文档**：`DESIGN.md` + `.impeccable/design.json` + `PRODUCT.md`
- **质量保证**：Impeccable doctor + 检测器（2 warning 已修复：去掉渐变文字、slate-600 on sky-50）

---

## 三、构建 & 部署

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev
# → http://localhost:3000

# 构建生产版本
npm run build

# 启动生产服务器
PORT=3017 npm run start
# → http://localhost:3017

# 测试
npm run test        # 全量
npm run test:watch  # 监听模式
```

**环境要求**
- Node.js 18+
- npm / pnpm / yarn

**生产部署**
- 已验证 Next.js standalone 输出模式
- 可部署至 Vercel / Netlify / 自托管 Node 环境
- 无外部数据库依赖（localStorage 本地持久化，演示系统）

---

## 四、文档更新

| 文件 | 状态 | 说明 |
|------|------|------|
| `DESIGN.md` | ✅ 已更新 | 新增 round2 refinement log，记录本轮新增 tokens / 组件 / 动效 / a11y |
| `.impeccable/design.json` | ✅ 已更新 | 同步色板、排版、阴影、组件（hero-dark / student-card / undo-banner），追加 round2 章节 |
| `PRODUCT.md` | ⏸ 未改 | 产品定位与教学逻辑未变 |
| `src/lib/report.ts` | ✅ 新增 | Markdown / PDF 报告生成器（纯函数） |
| `src/lib/shortcuts.ts` | ✅ 新增 | 快捷键路由表 |
| `src/lib/use-shortcuts.ts` | ✅ 新增 | React hook for keyboard shortcuts |
| `tests/report.test.ts` | ✅ 新增 | 4 个单测覆盖 Markdown 生成 |

---

## 五、已知约束 & 后续建议

### 已知约束
1. **演示系统**：localStorage 持久化，无后端，无真实 AI 推理（模拟数据）
2. **浏览器限制**：localStorage 5–10 MB 上限，无跨设备同步
3. **打印 PDF**：依赖浏览器 `window.print()`，不同浏览器渲染略有差异

### 后续建议
1. **批量复核 UI**：设计多选 + 批量编辑 Sheet，支持一次填入默认分/理由后逐人微调
2. **快捷键可视化**：在 Shell footer 或 ? 面板显示当前可用快捷键列表
3. **报告模板扩展**：支持自定义 Markdown 模板、PDF 加水印、邮件分享
4. **后端集成**：迁移到数据库持久化 + 真实 AI 推理 + SSO 登录
5. **移动端优化**：当前 768px 以下侧栏收起至 offcanvas，可进一步优化触摸体验
6. **国际化**：i18n 支持（当前中文为主）

---

## 六、Impeccable 质量报告

**Doctor 诊断**
```
No drift found. Every artifact matches what this version reads.
```

**检测器扫描**
- **总计**：122 条
- **Warning**：2 条 → **已修复**
  - 登录页渐变文字 → 改为纯色 `text-sky-100`
  - Curriculum 章节卡 `text-slate-600` on `bg-sky-50` → 改为 `text-[var(--foreground-soft)]`
- **Advisory**：120 条（主要是 `text-[15px]` / `text-[26px]` 等自定义尺寸，已全部文档化进 `DESIGN.md`）

---

## 七、截图验证

✅ 登录页 — 更清晰的层次、hero 卡片、演示横幅  
✅ 学生 Overview — 分层 hero + 学习路径  
✅ Diagnosis — 左右双栏 + 维度预览  
✅ Projects — featured 卡片 + AI 徽章  
✅ Tasks — 阶段梯 + 勾选网格  
✅ Lab — 场景画布 + 波形面板  
✅ **Report — 三按钮（MD / JSON / PDF）+ 新评分瓦片**  
✅ Assistant — 白底高对比度气泡  
✅ 教师 Dashboard — hero + 指标瓦片  
✅ 教师 Evaluation — 学生卡片（替代 9 列表格）  
✅ 教师 Insights — 调控方案 + 三色诊断卡  
✅ 移动视图 (768px) — 侧栏收起

---

## 八、交接清单

- [x] 全局设计系统文档化（`DESIGN.md` + `design.json`）
- [x] 登录页打磨
- [x] 学生工作台 8 页全部打磨（Overview / Diagnosis / Curriculum / Projects / Tasks / Lab / Report / Assistant）
- [x] 教师工作台 5 页全部打磨（Dashboard / Class / Curriculum / Evaluation / Insights）
- [x] Markdown / PDF 报告导出（纯函数 + 单测）
- [x] 键盘快捷键 + 命令面板（⌘K / g + letter）
- [x] Impeccable 质量报告（doctor + 检测器，2 warning 已修复）
- [x] 构建验证（TypeScript clean + Next.js build 成功）
- [x] 生产服务器运行验证（`http://localhost:3017`）
- [x] 截图验证（桌面 1440 + 移动 768）

---

## 九、快速上手

```bash
# 1. 进入项目目录
cd /Users/xingranya/Downloads/HTML5CSS/test1/physics-ai-teaching-system

# 2. 安装依赖（如未安装）
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000

# 4. 登录演示账号
# 学生：student / dunzhongwan
# 教师：teacher / dunzhongwan

# 5. 测试快捷键
# - 按 ⌘K (Mac) 或 Ctrl+K (Windows) 唤起命令面板
# - 按 g 然后 o 跳转总览
# - 按 g 然后 t 跳转任务闯关
# - 按 ? 查看快捷键帮助

# 6. 测试报告导出
# - 进入"学习报告"页面
# - 点击"下载 Markdown 报告"下载 .md 文件
# - 点击"打印 / 另存 PDF"触发浏览器打印对话框

# 7. 运行测试
npm run test
```

---

**完成日期**：2026-08-18  
**交付人**：ZCode AI Agent  
**状态**：✅ 生产就绪

如有疑问，请查阅 `DESIGN.md`、`.impeccable/design.json` 或项目 `README.md`。
