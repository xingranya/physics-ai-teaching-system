import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大学物理 AI 智慧教学系统",
  description: "长江大学文理学院大学物理课程智慧教学工作台。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
