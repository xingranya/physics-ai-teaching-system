# 大学物理 AI 智慧教学系统

长江大学文理学院大学物理课程的智慧教学工作台。项目完全重写，不复用参考单 HTML 的代码、样式或数据；学生、班级、成绩和统计均为课程示例数据。

## 功能

- 学生端：学情诊断、章节与知识图谱、项目匹配、五阶任务、规则型 AI 助教、超声测距实验、学习报告 JSON 导出与打印。
- 教师端：班级趋势与风险、章节项目矩阵、本地项目新增/编辑、AI 建议分复核与理由、教学洞察。
- 客户端持久化：版本化 `localStorage`，退出登录不清除学习记录；重置学习记录需要二次确认。

## 登录账号

| 账号 | 角色 | 初始密码 |
| --- | --- | --- |
| `student` | 学生 | `dunzhongwan` |
| `teacher` | 教师 | `dunzhongwan` |

账号用于当前产品的登录校验，不连接真实教务系统、数据库或大模型。

## npm 使用

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

端到端验收使用 ego lite 浏览器：先启动 `npm run dev`，再运行 `ego-browser nodejs`，按 `snapshotText()`、`click()`、`fillInput()` 和 `captureScreenshot()` 完成真实浏览器检查。该项目不使用 Playwright。

## 目录说明

- `src/components/physics-app.tsx`：学生端、教师端和登录页工作台。
- `src/lib/data.ts`：课程种子数据与账号。
- `src/lib/physics.ts`：诊断、匹配、任务、实验、评价与规则 AI 纯函数。
- `src/lib/store.ts`：版本化浏览器存储和损坏恢复。
- `public/assets/college-brand.png`：用户提供的 Logo。
- `public/assets/teaching-login-bg.jpg`：教务系统登录页背景图资源。

## Creative Tim UI

界面组件基于 Creative Tim UI 组件生态并按本项目设计令牌定制，相关组件保留 MIT 许可。项目不把 Creative Tim 组件当作后端服务或数据源。

## 部署

支持任何可运行 Node.js 20+ 的 npm 环境：构建后执行 `npm run start`，默认监听 `3000` 端口。项目不配置 GitHub Pages，GitHub Actions 负责检查、测试和生产构建。

## 边界

系统不实现数据库、云端同步、真实 LLM、学校统一身份认证或正式成绩写回。
