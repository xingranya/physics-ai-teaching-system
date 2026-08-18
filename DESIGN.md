---
name: 大学物理 AI 智慧教学系统
description: 浅色学术工作台：天蓝主色 + 灰白背景的师生一体化教学控制台
colors:
  background: "#f3f6fb"
  surface: "#ffffff"
  surface-muted: "#edf2f7"
  surface-strong: "#e2e9f2"
  border: "#d6dfe9"
  border-strong: "#b8c5d4"
  foreground: "#0f1a2c"
  foreground-soft: "#1e2b43"
  muted: "#eef2f7"
  muted-foreground: "#5a6877"
  primary: "#0369a1"
  primary-strong: "#075985"
  primary-soft: "#e0f2fe"
  primary-softer: "#f0f8fd"
  ring: "#0284c7"
  success: "#1c7c59"
  success-soft: "#e1f3eb"
  success-strong: "#0d5a3f"
  warning: "#a96519"
  warning-soft: "#fff0da"
  warning-strong: "#884c11"
  danger: "#b5444e"
  danger-soft: "#fce8e9"
  danger-strong: "#8e2c34"
  sidebar: "#0c4a6e"
  sidebar-deep: "#08384f"
  sidebar-hover: "#075985"
  sidebar-active: "#0369a1"
  sidebar-foreground: "#f3f7fc"
  sidebar-muted: "#bae6fd"
  sidebar-border: "rgba(255,255,255,0.14)"
  chart-1: "#0369a1"
  chart-2: "#2a8a78"
  chart-3: "#c47a2c"
  chart-4: "#8b65be"
  chart-5: "#b5444e"
  login-overlay: "rgba(8,47,73,0.55)"
typography:
  display-44:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "44px"
    lineHeight: 1.08
    letterSpacing: "-0.035em"
    purpose: "登录页 hero 主标题"
  display:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "clamp(1.875rem, 4vw, 2.5rem)"
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "1.25rem"
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  metric-26:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "26px"
    lineHeight: 1
    letterSpacing: "-0.03em"
    purpose: "MetricCard 数值 / 报告评分"
  metric-20:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "20px"
    lineHeight: 1
    letterSpacing: "-0.03em"
    purpose: "学生卡 AI 建议分 / 报告次级数值"
  title:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "1rem"
    lineHeight: 1.5
  body-15:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    fontSize: "15px"
    lineHeight: 1.6
    purpose: "页面正文 / 报告描述"
  body:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    fontSize: "0.875rem"
    lineHeight: 1.65
  micro-11:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 500
    fontSize: "11px"
    lineHeight: 1.4
    letterSpacing: "0.06em"
    purpose: "表格头 / 角标 / 状态徽章"
  eyebrow:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 600
    fontSize: "0.75rem"
    lineHeight: 1
    letterSpacing: "0.14em"
    textTransform: "uppercase"
  label:
    fontFamily: "PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 500
    fontSize: "0.875rem"
    lineHeight: 1.4
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.75rem"
shadows:
  card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 12px -4px rgba(15,30,60,0.08)"
  card-hover: "0 2px 4px rgba(16,24,40,0.06), 0 12px 24px -10px rgba(15,30,60,0.14)"
  pop: "0 1px 2px rgba(16,24,40,0.06), 0 18px 40px -12px rgba(8,47,73,0.22)"
motion:
  hover: "200ms ease-linear"
  sidebar: "200ms ease-linear"
spacing:
  card-padding: "1.25rem"
  page-padding: "1.5rem"
  page-max-width: "1480px"
components:
  card-base:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
    shadow: "{shadows.card}"
  card-hoverable:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
    shadow: "{shadows.card}"
    hoverShadow: "{shadows.card-hover}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  sidebar-nav:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.75rem"
  sidebar-nav-active:
    backgroundColor: "{colors.sidebar-active}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.75rem"
  badge-info:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.md}"
    padding: "0.125rem 0.5rem"
  input-base:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  callout-info:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  chip-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.5rem"
  student-card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
    shadow: "{shadows.card}"
    selectionRing: "2px {colors.primary}"
  hero-dark:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
    shadow: "{shadows.pop}"
    accentGradient: "radial-gradient(40rem 18rem at 120% -20%, rgba(186,230,253,0.18), transparent 60%)"
  undo-banner:
    border: "1px solid {colors.warning-soft}"
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning-strong}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1rem"
---

# Design System: 大学物理 AI 智慧教学系统

> Refreshed on 2026-08-18 from the incumbent implementation (Tailwind v4 + shadcn/ui tokens in `src/app/globals.css`, primitives in `src/components/ui/`, primary surface in `src/components/physics-app.tsx`). Replaces the earlier direction-only stub.

> Refinement log · 2026-08-18 (round 2):
> - New tokens: `--primary-softer`, `--foreground-soft`, `--sidebar-deep`, semantic `--*-strong` (success / warning / danger) for state-on-tinted callouts; two shadow levels (`card` / `card-hover` / `pop`) registered as CSS variables and consumed through Tailwind arbitrary values.
> - Typography ladder: registered `display-44`, `metric-26`, `metric-20`, `body-15`, `micro-11` to formalise the 44px login hero, 26px score tiles, and 11px micro labels that have been cropping up in metric cards, table headers, and corner pills.
> - New components: `student-card` (replaces the 9-column teacher evaluation table — keeps the "AI 建议 / 复核" tone but reads as one decision per student), `hero-dark` (the deep navy overview/teacher dashboard hero with radial accent gradient), `undo-banner` (the 24h snapshot reminder surfaced above main).
> - Motion: hover transitions consolidated to `200ms ease-linear`; sidebar collapse, sheet slide, and chat scroll respect `prefers-reduced-motion`.
> - Print: dedicated stylesheet under `@media print` strips the sticky context bar, removes backdrop-blur, and forces a white sheet — supports the new "另存 PDF" path on Report.
> - Accessibility: focus-visible widened to `outline: 3px solid color-mix(... ring 55%)` with a 2px offset on every interactive surface (button, link, input, textarea, select, role=button/tab/menuitem); chart panels and the lab SVG now carry `role="img"` + `aria-label`; AI bubble contrast raised from 3.7:1 to ~16:1.

## Overview

**Creative North Star: "The Working Notebook"**

The system reads as a light academic workbench, not a consumer product: a paper-soft canvas (`#f4f7fb`) layered with sky-blue accents (`#0369a1`) and grounded by a single dark sidebar that organises the day's work. It is built for two roles — student and teacher — who both need to find evidence quickly, so density is moderate and every destructive action has its own confirmation. The opposite of a marketing site: no gradients-for-decoration, no oversized type, no product photography. Information comes first; chrome stays out of the way.

The login screen is the deliberate exception. A real teaching-context backdrop with a sky-blue overlay plus the college wordmark proves where the student or teacher is logging into. Once authenticated, the user returns to the calm light surface. The dark navigation rail holds group labels in uppercase eyebrow spacing; the right side is all sky-blue and white, with semantic green / amber / rose reserved for state. Charts reuse the same five accent slots as the four-capability dimension palette (知识理解 / 专业应用 / 创新实践 / 团队协作) so the bar chart and the dimension grid cannot drift apart in colour.

**Key Characteristics:**

- One primary, no marketing palette: sky-blue is the only saturation in the working surface; semantic green / amber / rose are reserved for state.
- Quiet surface, deliberate pop: the login screen and the dark sidebar are the only places dark colour appears; everything else is paper-light.
- One shape grammar: every panel, button, chip, input, and badge shares the same `6px / 8px / 10px / 12px` radius family — no pill vs. square inconsistency.
- Confirm or it doesn't happen: re-diagnosis, project switching, ledger reset, and demo login all route through `AlertDialog` before touching state.
- Stickiness lives in the chrome: the school, class, and student identity ride in a sticky bar above the workspace so they never have to be re-entered.

## Colors

The system is paper-light at rest. Primary is a desaturated sky blue (`#0369a1`) that reads as "academic / institutional" rather than "marketing"; saturation is held below ~50% so it can carry buttons, focus rings, badges, and active nav without ever feeling loud. Greens, ambers, and roses exist only to signal state — never to decorate.

### Primary

- **学术天蓝 · Sky Institutional Blue** (`#0369a1`): the action colour. Carries every primary button, active sidebar item, focused input ring, and the "知识理解" dimension swatch. Pair with white text only (`#ffffff`); never use against `primary-soft` backgrounds.
- **深天蓝 · Deep Sky** (`#075985`): hover / pressed states of primary actions, plus strong-tinted eyebrow text on the light surface. Also the sidebar item's hover fill.
- **浅天蓝 · Sky Tint** (`#e0f2fe`): the soft-fill tier. Carries info callouts, selected quiz options, dialog openers, and the overview hero gradient tail. Pairs with `#075985` text and `#0369a1` accents.

### Secondary

The "secondary" slot in Tailwind maps to `surface-strong` (`#e4ebf3`), used for the muted section background of dismissable hover surfaces. It is structural, not decorative.

### Tertiary

Omitted. The product has one accent; adding a second brand colour would dilute the institutional voice documented in `PRODUCT.md`.

### Neutral

- **纸白 · Paper White** (`#ffffff`): the default card and input surface.
- **墨黑 · Ink** (`#172235`): all body and headline copy on the light surface. Choose this before any muted-foreground option whenever meaning must be unambiguous.
- **霜白 · Frost** (`#f4f7fb`): page background behind every working surface (set on `html, body`).
- **雾灰 · Mist Grey** (`#edf2f7`): sticky context bar and section dividers.
- **边框灰 · Border Slate** (`#d8e1eb`): default 1px border on cards, inputs, chips. The only border the design system ships.
- **强边框 · Strong Border** (`#bdcad8`): used sparingly — dashed empty-state outlines, hover transitions that need to read.
- **亚文字 · Sub Text** (`#607086`): every description, meta label, hint, and secondary data label. Never use as primary body.
- **次表层 · Surface Muted** (`#eff3f7`): tertiary table rows and inline code chips; darker than Mist to keep contrast readable.

### Semantic

- **成功 · Forest** (`#1c7c59`) on **薄荷 · Mint** (`#e1f3eb`): "task complete", "已选择，去闯关", "AI 在线", "已校验".
- **警告 · Amber** (`#a96519`) on **蜜糖 · Honey** (`#fff0da`): "未完成诊断则项目排序精度有限", "教学洞察·改进".
- **危险 · Wine** (`#b5444e`) on **薄粉 · Rose** (`#fce8e9`): login error, reset confirmation, evaluation override, high-risk badge.

### Sidebar (the only dark surface)

- **夜蓝 · Night Sky** (`#0c4a6e`): sidebar and the overview dark hero card. Sits one rung deeper than the active item so the active state still reads.
- **亮夜色 · Highlight Slate** (`#075985`): sidebar hover background; also the second stop of the chart series.
- **激活蓝 · Active Blue** (`#0369a1`): active sidebar item, tying it visually to the primary action colour elsewhere.
- **侧栏文字 · Sidebar Ink** (`#f3f7fc`) and **侧栏亚文字 · Sidebar Muted** (`#bae6fd`): high-contrast ink plus eyebrow / icon group label. Avoid pure white on this background.
- **侧栏分割 · Sidebar Border** (`rgba(255,255,255,0.14)`): hairline at `1px` between sidebar groups and beneath the footer. Always translucent so it adapts if the sidebar darkens.

### Chart

A five-stop ramp that doubles as the four-capability dimension palette so charts and competency tiles always agree:

- **#0369a1** — 知识理解 (the primary itself)
- **#2a8a78** — 专业应用 (forest teal)
- **#c47a2c** — 创新实践 (warm amber)
- **#8b65be** — 团队协作 (muted violet)
- **#b5444e** — 风险 / 综合评价 (wine, reuses the danger slot)

### Named Rules

- **The One-Action-Colour Rule.** Sky blue is the only saturation in the working surface. Greens, ambers, and roses are reserved for state; they never decorate a card, button, or section header. Their rarity is the point.
- **The Paper-White Card Rule.** Every working surface (`card`, `input`, `dialog`, `sheet`) is `#ffffff` on `#f4f7fb`. Tinted surfaces (`#e0f2fe`, `#e1f3eb`, `#fff0da`, `#fce8e9`) appear only as callouts or status fills, never as card backgrounds.
- **The State-Reserved Semantic Rule.** Green / amber / rose are paired with their `-soft` background. They signal "完成 / 提示 / 风险" — never "品牌", never "分类", never "装饰".
- **The Dark-Surface Rule.** Dark colour lives in exactly two places: the sidebar and the overview hero card. Anywhere else, switching to dark is an accident; reject the change.
- **The Sidebar-Ink Rule.** Sidebar text is `#f3f7fc` and `#bae6fd` only. Saturated icons are acceptable inline, but text never gets a chromatic tint.

## Typography

**Display + Body Font:** `PingFang SC`, `Microsoft YaHei`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif (one stack for all text)
**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (reserved for the lab waveform axes and any technical readout)

**Character:** a single Chinese-optimised sans stack throughout — no display vs. body swap, no slab, no novelty weight. Hierarchy is built through size, weight, tracking, and uppercase eyebrow treatment, not through a second typeface. Negative tracking (`-0.02em` to `-0.04em`) tightens display and headline sizes for a paper-native feel; eyebrow rows open tracking (`+0.14em`) and lift to uppercase to mark page orientation.

### Hierarchy

- **Display** (semibold 600, `clamp(30px, 4vw, 40px)`, line-height 1.1, tracking `-0.02em`): page-level headlines. Appears on each route's `PageHeader`. Set against `muted-foreground` description copy immediately below.
- **Headline** (semibold 600, 20px, line-height 1.4, tracking `-0.02em`): card titles, dialog titles, sheet titles. Always inside a `Card.Header` or paired with a description.
- **Title** (semibold 600, 16px, line-height 1.5): navigation labels, button text, list-item emphasis, sub-section headers.
- **Body** (regular 400, 14px, line-height 1.65): everything that runs more than one line — descriptions, lab explanations, evaluation reasons. Maximum line length ≤ 42 Chinese characters (~520px at the canonical column).
- **Eyebrow** (semibold 600, 12px, uppercase, tracking `+0.14em`, line-height 1): the route fingerprint above each page title and the group label inside the sidebar. Always `primary` or `sidebar-muted` so it disappears when irrelevant and reappears as a wayfinder.
- **Label** (medium 500, 14px, line-height 1.4): form labels, status-pill text, sidebar nav item labels.

### Named Rules

- **The Single-Stack Rule.** Do not introduce a second typeface. Display, body, and label all share the PingFang / 微软雅黑 stack so Chinese weight pairing stays consistent.
- **The Negative-Tracking-For-Display Rule.** Display and headline sizes apply `letter-spacing: -0.02em` (and `-0.04em` for the 40px+ login hero). Body and label copy return to normal tracking.
- **The Eyebrow-Always-Uppercase Rule.** Any text smaller than 13px that wants emphasis should travel through the eyebrow slot — uppercase, semibold, tracking `+0.14em`. Set the colour to `primary` on the light surface, `sidebar-muted` inside the sidebar.
- **The Description-Belows-Title Rule.** Every card, dialog, and sheet title is paired with a one-sentence description in `muted-foreground` 14px. Never ship a title without that one-sentence story below it.

## Layout

A single-column, sidebar-anchored workbench. The sidebar (`16rem`) is the only persistent navigation; everything to its right is one scrollable canvas at `max-width: 1480px`, centred, with `px-4` on mobile and `px-7` from `md` upward.

- **Outer shell.** `<html>` paints `f4f7fb`; `<body>` propagates it. `min-width: 320px` enforced so mobile never reflows the sidebar to icon mode by accident. The two-row sticky header (title row + context bar) sits above every workspace; it is opaque (`bg-white/92`) with `backdrop-blur` for mobile Safari.
- **Sidebar.** Desktop: `16rem` fixed left, dark navy fill (`#0c4a6e`), groups separated by 1px translucent dividers, off-canvas collapse driven by a cookie. Mobile: replaced by a `Sheet` triggered from a small button in the header — breakpoint at the standard `md` (768px).
- **Page frame.** Inner padding `px-4 py-6` mobile, `md:px-7 md:py-8`. Max width caps at `1480px` so 27" monitors still see one centred workspace. Below `xl`, the metric grid reflows `4 → 2 → 1` columns automatically.
- **Card grid.** Default `grid-cols-1`, expanding to `sm:grid-cols-2`, `lg:grid-cols-[1.4fr_1fr]` for the overview hero pair, and `xl:grid-cols-2/3/4` for project and metric rows.
- **Section rhythm.** `space-y-5` or `space-y-6` between cards. Inside a card, `CardContent` carries `p-5` or `p-6` depending on density (heavy content gets `p-6`, dense lists stay at `p-5`).
- **Density philosophy.** Two primary surfaces and one secondary action per viewport. At most one metric row, one card row, and one inline callout above the fold. Destructive actions live in `Card.Footer` so they cannot be confused with navigation.
- **Print mode.** `@media print` removes any `.no-print` chrome and switches to pure white background. The sticky context bar disappears, leaving only the printable header.

## Elevation & Depth

**Flat-by-default.** Shadows exist to express state, not to add dimension. At rest every card, button, input, sidebar item, and sheet is on the paper-white surface with a 1px border; depth enters only on hover, focus, drag, or modal.

### Shadow Vocabulary

- **`shadow-xs`** (`0 1px 2px rgba(16,24,40,0.05)`): the input resting state, applied through shadcn's `shadow-xs` token.
- **`shadow-sm`** (`0 1px 3px rgba(16,24,40,0.08)`): card resting shadow only when a card is featured (e.g., the selected project card uses `ring-2 ring-sky-200` instead — never `shadow`).
- **`shadow-lg`** (`0 10px 25px -10px rgba(8,47,73,0.2)`): the knowledge-graph centre node (`大学物理 知识核心`) and the lab scenario canvas to lift them off the page.
- **`shadow-2xl shadow-slate-950/20`** (creative-tim default): the login card only — it is the one element allowed to feel "lifted".

### Named Rules

- **The Flat-At-Rest Rule.** Every working component starts without a shadow. Add a shadow only as a response to hover, focus, drag, active, or modal/dialog elevation.
- **The Ring-Over-Shadow Rule.** Selected and active states prefer coloured rings (`ring-1`, `ring-2`, `ring-4 ring-sky-100`) over shadows. Rings colour-match the primary and don't darken on hover.
- **The Login-Is-The-Exception Rule.** Only the login card carries a heavy shadow. Any other card requesting a heavy shadow is a coding error.
- **The Backdrop-Blur-Fallback Rule.** Sticky surfaces and dialog overlays may use `backdrop-blur`; never on input surfaces where it conflicts with the cursor.

## Shapes

One soft-corner grammar: every container is rounded, nothing is square, nothing is fully pill. The radius scale is `4px → 6px → 8px → 10px → 12px` and is wired through `--radius`.

- `--radius-sm: 0.375rem` (`6px`) — small chips, inline tag pills, dropdown rows.
- `--radius-md: 0.5rem` (`8px`) — buttons, inputs, sidebar menu items, project cards, callouts, dialogs, sheets.
- `--radius-lg: 0.625rem` (`10px`) — primary cards with extra breathing room (the overview dark hero card and the login card), the larger sheet corners.
- `--radius-xl: 0.75rem` (`12px`) — large modal/sheet frame, the floating sidebar variant.

Buttons and chips always use `md` or `sm`; cards usually use `lg` for hero moments (rounded `md` is the everyday default); sheets are fixed at `lg`. Status badges and inline tags stay at `md`. There is no `rounded-full` rule for working components — the assistant avatar, the step-pill circles, and the primary CTA icon buttons are the only fully round elements, and they reserve `rounded-full` for circular silhouette, not branding.

## Components

### Buttons

- **Shape:** generous default — `h-9 px-4 py-2`; `h-8 px-3` for small inline variants; `h-10 px-6` for the login submit. Radius `md`. Icon-only buttons use `size-9` (square).
- **Primary:** `#0369a1` background, white text, no border. On hover / pressed, swap to `#075985`. Disabled state lifts `opacity-50` and blocks pointer events.
- **Outline:** white background, `#d8e1eb` border, ink text. Hover swaps to `primary-soft` background and `#075985` text.
- **Ghost:** transparent, ink text. Hover swaps to `primary-soft`. Reserved for in-table actions, footer nav, and the "已选择，去闯关" inline variant.
- **Destructive:** `#b5444e` background, white text. Reserved for the reset confirm action in the sidebar footer. Never used elsewhere.

### Chips / Status Badges

- **Style:** `Badge variant="outline"` with a tone-specific fill (`bg-sky-50 text-sky-800`, `bg-emerald-50 text-emerald-800`, `bg-amber-50 text-amber-800`, `bg-rose-50 text-rose-800`).
- **Tone vocabulary:** `default` (neutral), `success` (completed task / project selected), `warning` (no diagnosis yet, improvement advice), `danger` (high risk / reset), `info` (current node / open lab scenario).
- **Radius:** `md`. Padding `px-2 py-0.5`. Inline tag chips use the same primitive — never introduce a new chip component.
- **State:** always paired with a meaningful action label, never rendered as decoration.

### Cards / Containers

- **Corner style:** `radius-lg` (10px) by default for featured cards; metric rows and project cards opt into `radius-lg` too; the overview dark hero card explicitly opts into `radius-lg border-0` with no shadow.
- **Background:** `surface` (white). The only tinted card is the active task top bar (`sky-50/70`).
- **Shadow:** none at rest. A project card signals "selected" by adding `ring-2 ring-sky-200`, never a shadow.
- **Border:** 1px `border`. Sub-categories may also use a `bg-slate-50` interior row to differentiate without adding borders.
- **Internal padding:** `CardContent` uses `p-5` for dense lists, `p-6` for prose, `px-4 py-3` for the sticky header strip. `CardHeader` always pairs `CardTitle` with a one-line `CardDescription` in `muted-foreground`.

### Inputs / Fields

- **Style:** white background, 1px `border` (`#d8e1eb`), ink text, placeholder `muted-foreground`. Radius `md`. Default height `h-9`. The login password field bumps to `pr-10` to host the show/hide eye.
- **Focus:** ring at 45% opacity of `--ring` (`#0284c7`) inside an `outline 3px` glow, plus the border shifts to `ring`. Disabled state lifts `opacity-50` and blocks clicks.
- **Error:** login error renders as an inline `bg-rose-50` callout above the submit button with role `alert`; never inside the input field.
- **Search:** search inputs prefix a left-aligned `Search` icon at `pl-9` over `text-slate-400` at 16px.

### Navigation

- **Sidebar (desktop):** `#0c4a6e` background, 16rem width, group labels uppercase 12px eyebrow in `sidebar-muted`. Items use `h-10 px-3 radius-md`, default ink `sidebar-muted`, hover fill `sidebar-hover` + text white, active item fill `sidebar-active` + white text + `font-medium`. Each item carries `aria-current="page"` when active.
- **Header (top bar):** two-row sticky. Top row: route title with eyebrow above, system health pill and avatar at right; height `h-16`. Bottom row: the contextual breadcrumb (school · class · student · module) on `surface-muted` background, height `h-9`, scrolls horizontally on mobile.
- **Mobile:** sidebar collapses to a `Sheet` triggered from the header. Group labels and active item behave identically; only the trigger changes.
- **Dialog / Sheet:** `AlertDialog` for confirm-before-destructive, `Sheet` (right, `sm:max-w-md`) for inline review (teacher override) and lab parameter quick-look.

### Sidebar (the dark rail)

- **Background:** `#0c4a6e` (Night Sky). One file header with the school brand mark on white at 10% opacity (`bg-white/10`), then 1px translucent divider, then group labels.
- **Brand block:** the supplied 长江大学文理学院 PNG sits inside a `size-10` rounded frame; compact mode tightens to `size-8`.
- **Footer block:** identity card (avatar + name + role) above a translucent panel, then "退出登录" ghost + "重置学习记录" destructive-ghost wrapped in `AlertDialog`.

### Callouts

- **Info / hint:** `border sky-200`, `bg-sky-50`, text `sky-900`, 12–14px body, `radius-md`, icon `ShieldCheck` or `Lightbulb` at `mt-0.5 size-4`.
- **Success / warning / danger:** same shape, different border + fill from the semantic palette. Used in quiz diagnosis, teacher evaluation, and lab feedback.

### Lab Canvas (the signature custom surface)

- **Hero canvas:** `h-64` rounded `radius-lg`, gradient `linear-gradient(180deg, #e0f2fe, #f0f9ff)`. Hosts the ultrasound module on the left, the reflecting target on the right, the dashed round-trip line in the middle, and the live echo-time readout in a white pill at top.
- **Waveform chart:** inline SVG path on the same canvas, 360×80, dashed reference + amplitude fill, axes in monospace. Echo-time pulse at `x = echoTime * (W / totalMs)`, vertical-line overlay `border-dashed border-sky-500/60`.
- **Parameter panel:** four native range sliders styled with `accent-[var(--primary)]`, value chip in primary text on the right, label on the left. Submit primary button uses the studio standard; result summary appears in a two-column `bg-slate-50` strip.

## Do's and Don'ts

### Do:

- **Do** keep the working surface paper-white. Tint only via callouts or status fills, never as card backgrounds.
- **Do** stay inside the four-corner radius scale (`sm` / `md` / `lg` / `xl`). Pick one, commit, don't mix within a single card.
- **Do** lock the primary, ring, success, warning, and danger tokens to the values above — references like `text-sky-700` in JSX are tolerated but must mean the canonical token, not literal Tailwind sky.
- **Do** route every destructive action (re-diagnose, switch project, reset ledger) through `AlertDialog` with a clear `AlertDialogTitle` + description of consequences, including the 24-hour undo window.
- **Do** pair every icon-only button with `aria-label` and every modal title with a one-sentence description.
- **Do** keep the sticky context bar accurate. When the student switches project or the teacher opens a review, the bar reflects it on the next render.

### Don't:

- **Don't** introduce gradients in the working surface other than the lab canvas, the login screen, and the knowledge-graph centre node. A chart that needs colour must pick a stop from the chart palette, not invent a gradient.
- **Don't** add a saturated border, fill, or shadow to a card. Use `ring-sky-{n}` for selection; never use `shadow-lg` to imply importance.
- **Don't** repurpose semantic colours for non-semantic roles. Green does not mean "category B"; red does not mean "secondary CTA"; they mean complete / attention / risk, and only that.
- **Don't** ship a destructive action without a confirmation step. Re-diagnose, switch project, reset ledger, and demo logout all run through `AlertDialog`; new destructive flows must add the same.
- **Don't** pack more than four `MetricCard`s on a single row. The overview row is `xl:grid-cols-4`, and a teacher dashboard row already shows the limit before the canvas overflows.
- **Don't** add a second type family, a second primary, or a second radius scale. The single-stack / single-action-colour / one-corner rules are the binding shape of the system.
