# 项目分析

项目是独立的 Next.js 16.3 + React 19 + TypeScript + Tailwind CSS 应用，入口由 App Router 路由到统一的客户端工作台组件。领域逻辑、种子数据和本地存储已拆分到 `src/lib`，Creative Tim UI/shadcn 风格组件集中在 `src/components/ui`。

本地仿真边界：不连接数据库、真实教务系统或真实大模型；登录、学习记录、教师复核均保存在当前浏览器。
