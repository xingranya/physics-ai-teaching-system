# 模块清单

| 模块 | 职责 | 验证 |
| --- | --- | --- |
| `src/components/physics-app.tsx` | 登录、学生端、教师端和路由状态 | ego 浏览器现场验收 |
| `src/lib/data.ts` | 账号、诊断题、章节、项目和教学建议 | Vitest 种子数据测试 |
| `src/lib/physics.ts` | 诊断评分、匹配、任务、实验、评价、AI 回复和导出 | Vitest 纯函数测试 |
| `src/lib/store.ts` | 版本化 localStorage、迁移、损坏恢复 | Vitest 持久化测试 |
| `src/components/ui` | Creative Tim UI 组件实现与定制 | TypeScript、Lint、构建 |
