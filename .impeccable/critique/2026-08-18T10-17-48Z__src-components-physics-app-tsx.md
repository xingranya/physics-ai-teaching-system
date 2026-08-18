---
target: src/components/physics-app.tsx
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
method: dual-agent
timestamp: 2026-08-18T10-17-48Z
slug: src-components-physics-app-tsx
---
# Critique · `src/components/physics-app.tsx`

**Method:** dual-agent (A: `59c425c1-ecaf-4c59-b635-50bbf40fee42` · B: `2053faf6-357d-45dc-a9f2-1a92b5411826`)
**Target:** `src/components/physics-app.tsx`（大学物理 AI 智慧教学工作台的主壳）
**评分区间:** 19/40 — **Poor**（12–19 段）

---

## 设计健康度评分

| # | 启发式 | 分数 | 关键问题 |
|---|--------|----:|----------|
| 1 | 系统状态可见性 | 2 | 没有"正在保存…"提示；`saveTask` 静默写入；`evaluateLab` 后只有顶部 StatusBadge 变化 |
| 2 | 系统与现实匹配 | 3 | 中文领域措辞真实，但"知物 / 过程证据 / 过程评价"对大一新生仍偏专业 |
| 3 | 用户控制与自由 | 2 | `selectProject`（行 321）与重新诊断（行 295）会静默清空 `taskChecks / taskTexts / evaluation`，无 undo |
| 4 | 一致性与标准 | 2 | `SidebarMenuItem.group` 只在 overview / projects / lab 上声明；`text-[var(--primary-strong)]` 与 `text-sky-700` 在同模块里混用 |
| 5 | 错误预防 | 1 | 最具破坏性的动作（选新项目）保护最少；`DiagnosisView` 接受 `answer < 0` 软提示而非硬约束 |
| 6 | 识别优于回忆 | 3 | 助手快捷问题、`aria-label="账号"`、持久化"今天的学习焦点"都在；缺跨页"你在这里"指示带 |
| 7 | 灵活与高效 | 1 | 没有键盘快捷键 / 命令面板 / 教师批量复核旁路；"按学情排序"按钮禁用时无解释 |
| 8 | 极简与美感 | 2 | Overview 首屏堆叠 10 张 Card；`text-xs font-semibold uppercase tracking-[0.14em]` eyebrow 在每页重复，已失去信号 |
| 9 | 错误识别与恢复 | 1 | `DiagnosisView` 把"诊断已保存"与真正的失败通知共用 `bg-sky-50`，无 `role="alert"`；教师复核 Save 按钮无 toast |
| 10 | 帮助与文档 | 1 | 仅登录页脚描述演示账号；诊断首题前无"前测不计分"提示；Overview / Lab 没有空状态文案 |
| **合计** | | **19 / 40** | **Poor**：核心动作仍可点，但过程证据、错误恢复、辅助用户（Sam）三处脆弱 |

---

## 设计专属性判定

**LLM 评估。** 产品领域身份比典型 SaaS 仪表盘要扎实：`overview → diagnosis → curriculum → projects → tasks → lab → report` 的信息架构、`Sidebar` 的三段中文分组（学习工作台 / 项目实践 / 过程评价）、四阶能力阶梯（知识理解 / 专业应用 / 创新实践 / 团队协作）在 Overview / Evaluation / Report 三处复用同一调色板、`陈思远` / `顿老师` 这类真实种子名、以及"AI 只生成建议分，教师可以填写复核分和理由，保留最终判断权。"这类话语，都是这门课程自己的工作语言。但身份仍是皮相：三处显出通用 SaaS 痕迹——超声波实验室是一块蓝色渐变上的 CSS 定位图标，没有回波波形、没有散点图、没有信号/噪声叠层；`CurriculumView` 知识图谱的容器是 `linear-gradient(135deg,#f8fbff,#eef4fb)` 加绝对定位节点，与任何 BI 仪表盘没区别；`TeacherDashboard` 的柱状图复用 MetricCard 的蓝/绿/橙/红四色，没有"物理"或"本班"的视觉提示。

**检测器扫描。** 本次对 `src` 与 `public` 跑了 `detect.mjs --json src public`，得到 **15 条 `gray-on-color` 警告，全部落在 `physics-app.tsx`**。**经人工核验，15 条全部为假阳性。** 原因：Tailwind 分支（`detector/rules/checks.mjs:179–187`）拿 JSX 单行字面子串做正则匹配，而本文件大量多元素压在一行——例如 `:170` 把 `default`/`success`/`warning`/`danger`/`info` 五条 StatusBadge 样式写进同一个对象字面量，正则把 `text-slate-700` 与 `bg-emerald-50` 当成同一元素配对，实际它们属于不同分支；`:221`、`:283`、`:341`、`:349`、`:360` 等行也是 `text-slate-NNN` 属于图标 / Chat 气泡，而 `bg-sky-NN` 属于装饰区块。**真正可被验证的低对比度问题检测器反而漏报**：
- `:170` `StatusBadge` 默认分支 `border-slate-200 bg-slate-50 text-slate-700` ≈ 1.6:1（真正的灰对灰）。
- `:349` AI 聊天气泡 `bg-slate-100 text-slate-700` ≈ 3.7:1（正文低于 WCAG AA 4.5:1）。
- `:259` 步骤列表反态分支 `border-slate-200 bg-slate-50 text-slate-500` ≈ 2.6:1。
- `:218` 登录 Hero 使用 `text-sky-100/85` 与 `text-sky-50/85` 叠在 `linear-gradient(rgba(12,74,110,…)…)` 上，依赖图像本身提供对比，检测器跳过但视觉上仅勉强合格。

**视觉叠加。** 本轮未做浏览器可视化（脚本注入未在请求范围）。下次跑 polish / audit 时建议起 dev server 后注入 `detect.js` 看一眼登录与 Overview。

---

## 整体印象

工作台像一间有真实校徽的中文教研室：登录与 Overview 的 hero 把校名、校徽、四阶能力阶梯用对了，但门内几乎所有高风险动作（选项目、重新诊断、教师复核）都缺少守门员，Overview 首屏把 16 个可点元素摊在同一个折屏上让新生无路可走。可读性不是大问题，**真正的痛点是"破坏证据最易、保护证据最弱"和"评测界面挤成 9 列表格"**——这两个修好，整个工作站的可信度会上一个台阶。

---

## 亮点

1. **四阶能力阶梯（知识理解 / 专业应用 / 创新实践 / 团队协作）是产品定锚。** 它在 Overview / Evaluation / Report / Curriculum 四处共用同一调色（`#0369a1 / #2a8a78 / #c47a2c / #6c58a5`），少见的领域一致性。
2. **五阶任务栏是真有结构的交互模型。** 数字圆 + 绿对勾 / 蓝选中 / 灰未做的三态、单 textarea + 复选清单、`生成本章任务单` 按钮经 `physics:set-project` 自定义事件串到任务侧——这是连贯的脚手架，不是设置页。
3. **登录 + Overview Hero 共同承担品牌承诺。** 真实校徽 PNG、真实课程名、`bg-[#0c4a6e]/55` 叠加保证表单可读、Overview 复用 `bg-[var(--sidebar)]`——学生从登录到工作台感受到同一片校色。

---

## 优先问题

### [P0] 破坏性动作没有守卫
- **症结。** `selectProject`（行 321）静默清空 `taskChecks / taskTexts / evaluation`，`DiagnosisView.submit`（行 295）在重新诊断时同样清空 `projectId / taskChecks / evaluation`，都没有确认对话框。
- **为什么重要。** 课程的命题就是"过程证据"，而平台最易抹掉的恰恰就是过程证据。
- **修复。** 给两个动作包 `AlertDialog`，文案直白"放弃当前 5 阶段进度"；把当前快照额外写入带时间戳的 `localStorage` key，24 小时内可"撤销到上一状态"。
- **建议命令。** `/impeccable harden`

### [P0] `TeacherEvaluationView` 是 9 列表格 + 行内输入
- **症结。** 学生 / 4 能力 / AI 建议分 / 复核分 / 复核理由 / 操作，共 9 列；Save 处理器用 `row?.querySelectorAll("input")` 反查 DOM（脆弱），没有 toast，没有 0–100 区间可视化。
- **为什么重要。** 评价复核是教师端最高风险动作，也是工作台唯一一处把"可见选项"超 4 个的限制乘以二的界面。
- **修复。** 改成学生卡片堆叠 + 右侧 Drawer 详评（一次只看一个学生），加 `role="status"` 保存 toast，给复核分加 0–100 进度条和越界提示。
- **建议命令。** `/impeccable layout`

### [P1] Overview 首屏堆叠 16 个可点元素
- **症结。** Hero 卡 + 路径卡 + 4 MetricCard + 四阶能力卡 + 3 个快速入口卡 = 10 张卡，落到 16 个可点元素。
- **为什么重要。** Overview 应该回答"我从哪儿开始"，目前同时回答了所有问题。
- **修复。** 默认折叠"四阶能力目标"，只保留 5 步路径和 Hero CTA；快速入口折叠到第二屏。
- **建议命令。** `/impeccable distill`

### [P1] `DiagnosisView` 是焦虑尖峰
- **症结。** 8 题堆叠、单题无反馈、无进度点、只有右上角 `n/8 已作答`、单提交按钮；提交后用 `bg-sky-50` 提示"诊断已保存"，但该提示与真正的错误通知共用同一容器，且无 `role="alert"`。
- **为什么重要。** 工作台的"前 60 秒信任判决"在这里落下。
- **修复。** 首题前加"前测不计分，仅用于学习画像"提示；用 8 点进度条替代数字；右栏加实时"当前最薄弱维度"小条；通知区分 error / success 两套色 + role="alert"。
- **建议命令。** `/impeccable onboard`

### [P2] Sidebar 分组装饰化、空状态缺位
- **症结。** `SidebarMenuItem.group` 仅在 `overview / projects / lab` 三项声明，其他 5 项折叠到同一视觉块，分组标签失效；`EmptyState` 只在 Projects 与 Tasks 用到，Overview / Lab / Assistant 没有空状态文案。
- **修复。** 二选一：要么每项都填 `group`，要么删除 `group` 字段并合并为一段；为 Overview（未诊断）、Lab（无记录）、Assistant（无问答）补空状态 + 单一下一步按钮。
- **建议命令。** `/impeccable shape`

---

## 角色红旗

### Jordan（首日学生）
- **登录。** 主文案"请输入账号和密码，进入对应教学工作台。"对学生毫无帮助；唯一指向账号的提示来自页脚（行 221 起，已截断），位置在折叠线下。
- **Overview。** Step 0 CTA 写"开始学情诊断"，但 `DiagnosisView` 是 8 题无进度点——Jordan 一滚动就失去信心。
- **诊断提交后。** 出现 sky 软提示"诊断已保存，可以前往项目匹配中心。"但没有跳转链接，Jordan 必须手动点 sidebar。
- **未诊断时的 Projects。** 琥珀色横幅解释"完成诊断后更精准"，但 6 张卡片仍按匹配分（0% / 无理由）渲染，几乎同质——纯认知噪音。
- **Lab。** 默认值 `343 m/s / 80% / 2%` 无单位说明，`良好 / 一般 / 较差` 判定无显式阈值说明——Jordan 完全不知道自己在调什么。
- **Report。** 下载是 JSON blob（行 367），Jordan 打不开；没有 Markdown / PDF / 分享链接；打印按钮打出来是带 `.no-print { display:none }` 的 raw card，没有专门的 print stylesheet。

### Sam（键盘 / 屏幕阅读器 / 低视力）
- **Sidebar。** `SidebarMenuButton` 没有 `aria-current`，仅有视觉 `isActive`——纯键盘 Sam 听不到"你在学习总览"。
- **诊断单选。** `<input type="radio">` 在 `<label>` 内隐式关联，但 globals.css 的 `:focus-visible` 只覆盖 `button / a / input / textarea / select`，fieldset 容器和 label 包裹层没有 outline 兜底；焦点实际落在 input 上，**对自定义 label 容器来说是不稳定的可访问性**。
- **Lab 滑块。** `accent-[var(--primary)]` 是唯一视觉提示，没有 tooltip、没有 `aria-valuetext`、没有 live region 实时读出 `echoTime`。
- **教师复核 Save。** 是 `<Save className="size-3.5"/>`，按钮本身没有 `aria-label`——靠屏幕阅读器只能听到"按钮"。
- **图表。** `TeacherDashboard` 的 `<BarChart>` 默认不暴露 accessible data table；"即时提醒"标题 + Bell 图标是装饰——Sam 看到一块彩色矩形。
- **对比度。** `bg-slate-100 text-slate-700` AI 气泡（≈3.7:1，低于 WCAG AA 正文 4.5:1）、`bg-slate-50 text-slate-700` StatusBadge 默认态（≈1.6:1）——参见 B 的检测器漏报清单。
- **`* { border-color: var(--border) }`** 重置（globals.css 行 80）会清掉 shadcn 原语自带的 border 强调环。
- **`prefers-reduced-motion`** 在 CSS 层处理了 spinner 与 transition，但 motion（`motion` 包在 dependencies 里）的 JS 侧没有 gate。

---

## 次要观察

- 登录 Hero 的 3 个能力磁贴用 `grid-cols-3` 拼成一条 chip 串，与 headline 同列共存，建议单独成行强调"3 项承诺"。
- Overview MetricCard 的 `当前项目` 用 `project.title.slice(0, 9)` 截断——项目名 *"超声波倒车雷达系统"*（9 字）会被切到 *"超声波倒车雷"* 后无省略号，下一字"达"被吞。
- `DiagnosisView` 8 题不支持"返回上一题"，键盘用户只能用方向键回退，但视觉上无提示。
- SidebarTrigger 是 `size-icon` 且没有 `aria-label` 覆盖，盲用户不知道这是什么按钮。
- `TeacherEvaluationView` 的 AI 建议分用 `(score + 68 + i*3 + 64 + i*4 + 72 + i*2) / 4`（行 417 截断附近）这种魔数公式显式出现在屏幕上，"Help users recognise…"启发式应当追究。
- "教师驾驶舱"页 eyebrow 写"本周教学调控"，与 PageHeader 的"教师驾驶舱 / 从班级趋势…"文案对不齐。
- `selectProject` 会清空进度（无确认），但"重置学习数据"走 AlertDialog 二次确认——同样的破坏性，保护力度不一致。
- `PhysicsApp` 在 role 不匹配时 `router.replace` 后 `return null`（行 486 附近），导致一帧未样式内容闪烁。

---

## 值得追问

1. 如果 长江大学文理学院 的学生把 Overview 截图发给另一所大学的同学，对方能认出是本校吗？目前只有登录页校徽 + sidebar 校徽两块本校痕迹，是否该让"物理学 2601 班 · 陈思远 · 上学期力学模块"作为 sticky context 出现在每个 PageHeader？
2. 五阶任务闯关是产品脊柱，但 sidebar 项写"任务闯关"不带进度。要不要在 sidebar 渲染"任务闯关 · 3/5"实时徽章，和 Overview 路径一致？这样可以一次性吃掉两条认知负荷失败项。
3. 四阶能力阶梯在 Overview / Evaluation / Report / Curriculum 出现，但 `TeacherCurriculumView` 只让教师编辑项目标题/简介，不让编辑 `dims / styles / targets / ability`——这是课程的阶梯还是系统的阶梯？如果是课程的，为什么教师改不了？如果是系统的，为什么它是唯一住进产品模型外的分类法？
4. 报告只导出 JSON。在国内大学课程过程性评价落 PDF / Word / 教务模板的语境里，JSON 是给谁的？换成 Markdown + PDF 路径会不会让 Report 真实使用率翻倍而不动评分逻辑？
5. 教师评价表是工作台里风险最高、出错最贵的界面，也是唯一渲染成宽 HTML 表格的。表形是被运营正确性逼出来的，还是 shadcn 默认？Save 用 `querySelectorAll` 抓 DOM 而非受控 state，是遗留还是省事？
