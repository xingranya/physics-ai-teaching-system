"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  EyeOff,
  FileBarChart,
  FileText,
  Filter,
  FlaskConical,
  LayoutDashboard,
  Library,
  Lightbulb,
  ListChecks,
  LogOut,
  Network,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Target,
  Trash2,
  Users,
} from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CHAPTER_MAPPINGS, DEMO_STUDENTS, DIAGNOSTIC_DIMENSIONS, KNOWLEDGE_NODES, PROJECTS, QUIZ_QUESTIONS, TASK_TEMPLATES, TEACHING_PLANS, getProjectById } from "@/lib/data"
import { aiReply, calculateChapterMatchScore, calculateTaskProgress, calculateUltrasonicEchoTime, matchProjects, scoreDiagnosis, simulateUltrasonicMeasurement, simulateUltrasonicWaveform, summarizeEvaluation, toJson, withUtf8Bom } from "@/lib/physics"
import { buildStudentReportMarkdown, downloadMarkdown } from "@/lib/report"
import { useShortcuts } from "@/lib/use-shortcuts"
import type { ShortcutBinding } from "@/lib/shortcuts"
import { CommandPalette } from "@/components/command-palette"
import { accountForRole, authenticate, clearState, createInitialState, loadState, saveState } from "@/lib/store"
import type { AppState, ChapterMapping, DiagnosisResult, EvaluationReview, LabRecord, Project, UserRole } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type StudentView = "overview" | "diagnosis" | "curriculum" | "projects" | "tasks" | "assistant" | "lab" | "report"
type TeacherView = "dashboard" | "class" | "curriculum" | "evaluation" | "insights"
type AppView = StudentView | TeacherView

type Notice = { tone: "warning" | "success"; text: string }

const studentNavigation: Array<{ id: StudentView; label: string; icon: React.ElementType; group: string }> = [
  { id: "overview", label: "学习总览", icon: LayoutDashboard, group: "学习工作台" },
  { id: "diagnosis", label: "AI 学情诊断", icon: ClipboardCheck, group: "学习工作台" },
  { id: "curriculum", label: "章节与知识图谱", icon: Network, group: "学习工作台" },
  { id: "projects", label: "项目匹配", icon: Library, group: "项目实践" },
  { id: "tasks", label: "任务闯关", icon: ListChecks, group: "项目实践" },
  { id: "assistant", label: "AI 助教", icon: Bot, group: "项目实践" },
  { id: "lab", label: "虚拟实验", icon: FlaskConical, group: "过程评价" },
  { id: "report", label: "学习报告", icon: FileBarChart, group: "过程评价" },
]

const teacherNavigation: Array<{ id: TeacherView; label: string; icon: React.ElementType; group: string }> = [
  { id: "dashboard", label: "教师驾驶舱", icon: LayoutDashboard, group: "教学工作台" },
  { id: "class", label: "班级画像", icon: Users, group: "教学工作台" },
  { id: "curriculum", label: "章节项目矩阵", icon: Network, group: "课程重构" },
  { id: "evaluation", label: "评价复核", icon: ClipboardCheck, group: "质量治理" },
  { id: "insights", label: "教学洞察", icon: Lightbulb, group: "质量治理" },
]

const pageMeta: Record<AppView, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "学生工作台", title: "把每一次学习行动变成可见证据", description: "从课前诊断到项目实践，系统将知识、任务、实验和反思串成一条清晰的学习路径。" },
  diagnosis: { eyebrow: "课前识别", title: "AI 学情诊断", description: "完成 8 道基础题，生成可解释的知识维度画像，作为项目匹配的起点。" },
  curriculum: { eyebrow: "内容导航", title: "章节与知识图谱", description: "用章节、概念和项目三种视角查找学习入口，适配不同的课程组织方式。" },
  projects: { eyebrow: "项目实践", title: "项目匹配中心", description: "系统根据你的薄弱维度、学习方式和能力目标排序项目案例。" },
  tasks: { eyebrow: "项目实践", title: "五阶任务闯关", description: "每一关都要求留下过程说明和证据，系统只提供支架，不替你完成任务。" },
  assistant: { eyebrow: "人机协同", title: "AI 助教知物", description: "围绕物理概念、实验现象和项目思路，提供追问、提示与验证路径。" },
  lab: { eyebrow: "过程评价", title: "超声波测距实验", description: "调节距离、声速、反射率和噪声，观察回波时间与测量误差的变化。" },
  report: { eyebrow: "过程评价", title: "学习报告", description: "汇总诊断、任务、实验和评价结果，形成可打印、可下载的学习报告。" },
  dashboard: { eyebrow: "教师工作台", title: "教师驾驶舱", description: "从班级趋势、项目进度和风险提醒快速定位下一次教学调控机会。" },
  class: { eyebrow: "教师工作台", title: "班级画像", description: "查看当前教学班的诊断分布、薄弱维度、项目进度和风险状态。" },
  evaluation: { eyebrow: "质量治理", title: "评价复核", description: "AI 只生成建议分，教师可以填写复核分和理由，保留最终判断权。" },
  insights: { eyebrow: "质量治理", title: "教学洞察", description: "基于当前教学数据生成本周教学建议，并查看 AI 使用边界和风险控制。" },
}

const teacherCurriculumMeta = { eyebrow: "课程重构", title: "章节项目矩阵", description: "按教材章节查看核心知识、主项目、成果证据和建议课时。" }

function getStateProject(state: AppState, projectId?: string | null): Project | undefined {
  if (!projectId) return undefined
  return state.localProjects.find((project) => project.id === projectId) ?? getProjectById(projectId)
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value
  return value.slice(0, max - 1) + "…"
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return new Date(timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
}

function UndoBanner({ meta, onRestore, onDismiss }: { meta: { reason: string; timestamp: number }; onRestore: () => void; onDismiss: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-5 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/70 px-4 py-3 text-sm shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
          <RotateCcw className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-amber-900">
            已保存可恢复快照：{meta.reason}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-amber-800/85">
            快照时间 {formatRelativeTime(meta.timestamp)}，系统会在 24 小时内保留这份证据，你可以一键回到上一状态。
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
        <Button variant="outline" size="sm" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50" onClick={onRestore}>
          <RotateCcw className="size-3.5" />
          撤销到上一状态
        </Button>
        <button
          type="button"
          aria-label="关闭提示"
          onClick={onDismiss}
          className="grid size-8 place-items-center rounded-md text-amber-700 transition-colors hover:bg-amber-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}

function usePersistedAppState() {
  const [state, setState] = React.useState<AppState>(() => createInitialState())
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    window.queueMicrotask(() => {
      setState(loadState())
      setHydrated(true)
    })
  }, [])

  const update = React.useCallback((patch: Partial<AppState> | ((current: AppState) => AppState)) => {
    setState((current) => {
      const next = typeof patch === "function" ? patch(current) : { ...current, ...patch }
      saveState(next)
      return next
    })
  }, [])

  return { state, setState, update, hydrated }
}

function getSession(): { role: UserRole; displayName: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("physics-ai-session")
    if (!raw) return null
    const value = JSON.parse(raw) as { role?: UserRole; displayName?: string }
    return value.role && value.displayName ? { role: value.role, displayName: value.displayName } : null
  } catch {
    return null
  }
}

function saveSession(role: UserRole, displayName: string) {
  window.localStorage.setItem("physics-ai-session", JSON.stringify({ role, displayName, createdAt: new Date().toISOString() }))
}

function clearSession() {
  window.localStorage.removeItem("physics-ai-session")
}

// Undo snapshot mechanism: destructive actions write the pre-action state to
// localStorage with a 24-hour window so the user can recover lost progress.
// The Shell component reads `lastUndo` to surface an inline recovery hint.
const UNDO_KEY = "physics-ai-undo-snapshot"
const UNDO_META_KEY = "physics-ai-undo-meta"
const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000

function readUndoMeta(): { reason: string; timestamp: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(UNDO_META_KEY)
    if (!raw) return null
    const meta = JSON.parse(raw) as { reason: string; timestamp: number }
    if (!meta?.timestamp || Date.now() - meta.timestamp > UNDO_WINDOW_MS) {
      window.localStorage.removeItem(UNDO_META_KEY)
      window.localStorage.removeItem(UNDO_KEY)
      return null
    }
    return meta
  } catch {
    return null
  }
}

function captureUndoSnapshot(state: AppState, reason: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(UNDO_KEY, JSON.stringify(state))
    window.localStorage.setItem(UNDO_META_KEY, JSON.stringify({ reason, timestamp: Date.now() }))
  } catch {
    // localStorage may be unavailable (private mode, quota); fail closed.
  }
}

function clearUndoSnapshot() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(UNDO_KEY)
  window.localStorage.removeItem(UNDO_META_KEY)
}

function useUndoSnapshot() {
  const [lastUndo, setLastUndo] = React.useState<{ reason: string; timestamp: number } | null>(() => (typeof window === "undefined" ? null : readUndoMeta()))
  const capture = React.useCallback((state: AppState, reason: string) => {
    captureUndoSnapshot(state, reason)
    setLastUndo(readUndoMeta())
  }, [])
  const dismiss = React.useCallback(() => {
    clearUndoSnapshot()
    setLastUndo(null)
  }, [])
  return { lastUndo, capture, dismiss }
}

function viewFromPath(pathname: string, role: UserRole): AppView {
  const segment = pathname.split("/").filter(Boolean).at(-1)
  if (role === "teacher" && segment && ["dashboard", "class", "curriculum", "evaluation", "insights"].includes(segment)) return segment as TeacherView
  if (role === "student" && segment && ["overview", "diagnosis", "curriculum", "projects", "tasks", "assistant", "lab", "report"].includes(segment)) return segment as StudentView
  return role === "student" ? "overview" : "dashboard"
}

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-white/95 p-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]", compact && "size-8")}>
        <Image src="/assets/college-brand.png" alt="长江大学文理学院" width={260} height={60} className="h-auto w-full object-contain" priority />
      </div>
      {!compact && <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">大学物理 AI</p><p className="truncate text-xs text-[var(--sidebar-muted)]">智慧教学系统</p></div>}
    </div>
  )
}

function StatusBadge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const styles = {
    default: "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--foreground-soft)]",
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    danger: "border-rose-300 bg-rose-50 text-rose-900",
    info: "border-sky-300 bg-sky-50 text-sky-900",
  } as const
  return <Badge variant="outline" className={cn("px-2 py-0.5 text-[11px] font-medium tracking-[0.01em]", styles[tone])}>{children}</Badge>
}

function PageHeader({ view, action }: { view: AppView; action?: React.ReactNode }) {
  const meta = pageMeta[view]
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          <span className="inline-block size-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
          {meta.eyebrow}
        </div>
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-[var(--foreground)] md:text-[30px]">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{meta.description}</p>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}

function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--foreground)]">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }: { label: string; value: string; hint: string; icon: React.ElementType; tone?: "blue" | "green" | "amber" | "red" }) {
  const toneStyles = {
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
  } as const
  return (
    <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{label}</p>
            <p className="mt-2 truncate text-[26px] font-semibold leading-none tracking-[-0.03em] text-[var(--foreground)]" title={value}>{value}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{hint}</p>
          </div>
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]", toneStyles[tone])}>
            <Icon className="size-[18px]" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description, action, icon: Icon = FileText }: { title: string; description: string; action?: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-white/60 px-8 py-10 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-strong)]">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="text-[15px] font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: (role: UserRole, displayName: string) => void }) {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    window.setTimeout(() => {
      const account = authenticate(username, password)
      if (!account) {
        setError("账号或密码不正确，请检查后重试。")
        setLoading(false)
        return
      }
      saveSession(account.role, account.displayName)
      onLogin(account.role, account.displayName)
      setLoading(false)
    }, 320)
  }

  const features = [
    { icon: Network, title: "知识图谱", desc: "按章节连接概念与项目" },
    { icon: FlaskConical, title: "虚拟实验", desc: "调节参数查看测量变化" },
    { icon: FileBarChart, title: "过程评价", desc: "保留任务和实验证据" },
  ] as const

  return (
    <main
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-900 px-4 py-10 md:px-10"
      style={{ backgroundImage: "url('/assets/teaching-login-bg.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-[#0a3a5c]/20" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(100deg, rgba(8,47,73,0.62) 0%, rgba(8,47,73,0.28) 52%, rgba(8,47,73,0.18) 100%)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#082f49]/30 to-transparent" aria-hidden="true" />

      <div className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_440px] lg:items-center">
        <section className="hidden text-white [text-shadow:0_1px_12px_rgba(4,25,42,0.55)] lg:block">
          <div className="mb-12 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-white/95 p-1.5 shadow-[0_2px_10px_-2px_rgba(2,6,23,0.45)] ring-1 ring-white/40 backdrop-blur-sm">
              <Image src="/assets/college-brand.png" alt="长江大学文理学院校徽" width={260} height={60} className="h-auto w-full object-contain" priority />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100">长江大学文理学院</p>
              <p className="mt-0.5 text-xs text-sky-50/85">College of Arts and Sciences · Yangtze University</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100">物理学 · 大学物理课程教学系统</p>
            <h1 className="text-[44px] font-semibold leading-[1.08] tracking-[-0.035em]">
              大学物理
              <span className="ml-2 text-sky-100">AI 智慧教学系统</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-sky-50/95">
              围绕课程学习、项目实践和过程评价，建立从诊断到反馈的完整学习路径。每一次学习行动都留下可解释的证据。
            </p>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.4)] backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/15">
                <div className="mb-4 grid size-9 place-items-center rounded-lg bg-white/15 text-sky-100">
                  <feature.icon className="size-[18px]" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="mt-1 text-xs leading-5 text-sky-50/90">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-sky-100/85">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            本地优先 · 离线可用 · 过程可追溯
          </div>
        </section>

        <Card className="overflow-hidden rounded-2xl border-white/40 bg-white/[0.97] shadow-[var(--shadow-login)] backdrop-blur-2xl">
          <CardHeader className="space-y-5 px-8 pb-3 pt-8">
            <div className="flex items-center justify-between gap-3">
              <div className="lg:hidden">
                <Image src="/assets/college-brand.png" alt="长江大学文理学院校徽" width={260} height={60} className="h-auto w-[160px] object-contain" priority />
              </div>
              <StatusBadge tone="info">演示登录</StatusBadge>
            </div>
            <div>
              <CardTitle className="text-[22px] tracking-[-0.025em]">欢迎回到工作台</CardTitle>
              <CardDescription className="mt-1.5 text-[13px] leading-6">请输入账号和密码，进入对应教学工作台。系统会继续上次的学习进度。</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-4 pt-2">
            <form className="space-y-4" onSubmit={submit}>
              <label className="block space-y-1.5 text-[13px] font-medium text-[var(--foreground-soft)]">
                账号
                <Input aria-label="账号" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入账号" required className="h-11" />
              </label>
              <label className="block space-y-1.5 text-[13px] font-medium text-[var(--foreground-soft)]">
                密码
                <div className="relative">
                  <Input aria-label="密码" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" className="h-11 pr-11" required />
                  <button
                    type="button"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-800">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              )}
              <Button type="submit" className="h-11 w-full bg-[var(--primary)] text-[15px] font-medium shadow-[0_8px_18px_-8px_rgba(3,105,161,0.5)] hover:bg-[var(--primary-strong)]" disabled={loading}>
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    正在进入...
                  </>
                ) : (
                  <>
                    进入教学工作台
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--primary-softer)] px-8 py-4">
            <div className="flex items-start gap-2 text-xs leading-5 text-[var(--primary-strong)]">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <div>
                <strong className="block font-semibold">演示账号：student / teacher</strong>
                <span className="text-[var(--muted-foreground)]">统一密码 <span className="font-mono text-[var(--primary-strong)]">dunzhongwan</span>，登录后保留上次的学习进度。</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

function OverviewView({ state, navigate }: { state: AppState; navigate: (view: StudentView) => void }) {
  const progress = calculateTaskProgress(state.taskChecks).percentage
  const project = getStateProject(state, state.projectId)
  const diagnosisScore = state.diagnosis?.score ?? 0
  const reportScore = state.evaluation?.final
  const completedSteps = state.diagnosis ? 1 : 0
  const steps = [
    { label: "完成 AI 学情诊断", done: Boolean(state.diagnosis), meta: state.diagnosis ? `前测 ${state.diagnosis.score} 分` : "完成 8 道基础题", view: "diagnosis" as StudentView },
    { label: "选择一个真实项目", done: Boolean(project), meta: project?.title ?? "从匹配中心选择项目", view: "projects" as StudentView },
    { label: "完成五阶任务", done: progress > 0, meta: `已完成 ${progress}%`, view: "tasks" as StudentView },
    { label: "留下实验与问答证据", done: state.labRecords.length > 0 || state.chat.length > 0, meta: `${state.labRecords.length} 次实验 / ${state.chat.length} 条问答`, view: "lab" as StudentView },
    { label: "生成学习报告", done: Boolean(state.evaluation), meta: reportScore ? `综合 ${reportScore} 分` : "汇总过程证据", view: "report" as StudentView },
  ]
  const completedCount = steps.filter((step) => step.done).length
  const heroProgress = Math.max(progress, completedCount * 20)
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden rounded-[var(--radius-lg)] border-0 bg-[var(--sidebar)] text-white shadow-[var(--shadow-pop)]">
          <div className="absolute inset-0 bg-[radial-gradient(40rem_18rem_at_120%_-20%,rgba(56,189,248,0.28),transparent_60%)]" aria-hidden="true" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/85">
              <span className="inline-block size-1.5 rounded-full bg-sky-300" aria-hidden="true" />
              今天的学习焦点
            </div>
            <h2 className="mt-4 max-w-xl text-[26px] font-semibold leading-[1.18] tracking-[-0.025em] md:text-[28px]">
              把一个物理问题，
              <span className="text-sky-100">推进到下一条可验证证据。</span>
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-7 text-sky-50/85">
              先诊断，再匹配；先留下过程，再生成评价。每一步都能回到课程章节和项目目标。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button className="h-10 bg-white px-5 text-[var(--primary-strong)] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.35)] hover:bg-sky-50" onClick={() => navigate(state.diagnosis ? "projects" : "diagnosis")}>
                {state.diagnosis ? "查看项目匹配" : "开始学情诊断"}
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" className="h-10 border-white/25 bg-white/0 px-4 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("curriculum")}>
                浏览课程结构
              </Button>
              <div className="ml-auto hidden items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sky-100/70 md:flex">
                <span className="inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                本地优先 · 过程可追溯
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 px-6 pb-3 pt-5">
            <div className="min-w-0">
              <CardTitle className="text-[15px] font-semibold tracking-[-0.01em]">学习路径</CardTitle>
              <CardDescription className="mt-1 text-xs">当前学习记录的完成情况</CardDescription>
            </div>
            <StatusBadge tone={progress >= 60 ? "success" : completedSteps > 0 ? "info" : "default"}>
              {completedCount} / 5
            </StatusBadge>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-2">
            <div>
              <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[var(--muted-foreground)]">
                <span>总进度</span>
                <span className="font-semibold text-[var(--foreground)]">{progress}%</span>
              </div>
              <Progress value={Math.max(heroProgress, diagnosisScore ? 12 : 0)} className="h-1.5 bg-[var(--surface-muted)]" />
            </div>
            <ol className="space-y-1.5">
              {steps.map((step, index) => (
                <li key={step.label}>
                  <button
                    onClick={() => navigate(step.view)}
                    className="group flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--primary-softer)]"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                        step.done
                          ? "bg-[var(--success)] text-white"
                          : "border border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {step.done ? <Check className="size-3" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium leading-5 text-[var(--foreground)]">{step.label}</span>
                      <span className="mt-0.5 block truncate text-xs leading-5 text-[var(--muted-foreground)]">{step.meta}</span>
                    </span>
                    <ChevronRight className="ml-auto mt-1.5 size-4 text-[var(--border-strong)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="学情诊断" value={state.diagnosis ? `${state.diagnosis.score} 分` : "未完成"} hint={state.diagnosis?.level ?? "知识基础与学习特征"} icon={ClipboardCheck} tone="blue" />
        <MetricCard label="当前项目" value={project ? truncateText(project.title, 8) : "未选择"} hint={project?.level ? `${project.level} 难度` : "来自项目案例库"} icon={Target} tone="green" />
        <MetricCard label="任务进度" value={`${progress}%`} hint="五阶项目闯关" icon={ListChecks} tone="amber" />
        <MetricCard label="综合评价" value={reportScore ? `${reportScore} 分` : "待生成"} hint={state.evaluation?.grade ?? "四阶能力增值评价"} icon={FileBarChart} tone="red" />
      </div>
    </div>
  )
}

function DiagnosisView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [result, setResult] = React.useState<DiagnosisResult | undefined>(state.diagnosis)
  const [notice, setNotice] = React.useState<Notice | null>(null)
  const [pendingDiagnosis, setPendingDiagnosis] = React.useState<DiagnosisResult | null>(null)
  const undo = useUndoSnapshot()
  const answeredCount = Object.keys(answers).length
  const runningResult = React.useMemo(() => scoreDiagnosis(answers as Parameters<typeof scoreDiagnosis>[0]), [answers])
  const weakestSoFar = React.useMemo(() => DIAGNOSTIC_DIMENSIONS.reduce<{ dim: string; value: number } | null>((lowest, dim) => {
 const value = (runningResult.dimensions as Record<string, number>)[dim] ?? 0
    if (lowest === null || value < lowest.value) return { dim, value }
    return lowest
  }, null), [runningResult])
  const hasProjectProgress = Boolean(state.projectId) && (Object.keys(state.taskChecks).length > 0 || Object.keys(state.taskTexts).length > 0 || state.evaluation !== undefined)
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = (Object.keys(answers).length === QUIZ_QUESTIONS.length ? answers : QUIZ_QUESTIONS.reduce((acc, item) => ({ ...acc, [item.id]: answers[item.id] ?? -1 }), answers))
    if (Object.values(next).some((answer) => answer < 0)) {
      setNotice({ tone: "warning", text: "请先完成全部题目，再生成诊断结果。" } as Notice)
      return
    }
    const diagnosis = scoreDiagnosis(next)
    setResult(diagnosis)
    if (hasProjectProgress) {
      setPendingDiagnosis(diagnosis)
      return
    }
    applyDiagnosis(diagnosis)
  }
  const applyDiagnosis = (diagnosis: DiagnosisResult) => {
    update((current) => ({ ...current, diagnosis, projectId: null, taskChecks: {}, evaluation: undefined }))
    setNotice({ tone: "success", text: "诊断已保存，可以前往项目匹配中心。" } as Notice)
  }
  const confirmRediagnosis = () => {
    if (!pendingDiagnosis) return
    undo.capture(state, "重新诊断")
    applyDiagnosis(pendingDiagnosis)
    setPendingDiagnosis(null)
  }
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b border-[var(--border)] px-7 pb-5 pt-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                <ClipboardCheck className="size-3.5" aria-hidden="true" />
                基础知识前测
              </div>
              <CardTitle className="mt-2 text-[18px] font-semibold tracking-[-0.015em]">8 题基础画像</CardTitle>
              <CardDescription className="mt-1 text-[13px] leading-6">每题只有一个最佳答案，结果用于调整项目推荐顺序。</CardDescription>
            </div>
            <div
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--primary-softer)] px-3 py-1.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={QUIZ_QUESTIONS.length}
              aria-valuenow={answeredCount}
              aria-label={"诊断完成度 " + answeredCount + "/" + QUIZ_QUESTIONS.length}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: QUIZ_QUESTIONS.length }).map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      idx < answeredCount ? "bg-[var(--primary)]" : "bg-[var(--surface-strong)]"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-[var(--primary-strong)]">{answeredCount}/{QUIZ_QUESTIONS.length}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7 pt-6">
            <div role="region" aria-label="前测说明" className="flex items-start gap-3 rounded-[var(--radius-md)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-4 text-sm leading-6 text-sky-900">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-[var(--primary)]">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </div>
              <div>
                <strong className="block text-[var(--primary-strong)]">前测不计分，仅用于学习画像。</strong>
                <span className="text-sky-800/85">8 道题覆盖力学、波动、电磁学、光学与实验维度。答案仅用于为你推荐更合适的项目，可随时返回修改。</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {QUIZ_QUESTIONS.map((question, index) => {
                const answered = answers[question.id] !== undefined
                return (
                  <fieldset key={question.id} className={cn("space-y-3 rounded-[var(--radius-md)] border p-4 transition-colors", answered ? "border-sky-200 bg-white" : "border-[var(--border)] bg-[var(--primary-softer)]/30")}>
                    <legend className="px-2 text-[14px] font-semibold text-[var(--foreground)]">
                      <span
                        className={cn(
                          "mr-2 inline-flex size-6 items-center justify-center rounded-md text-[12px] font-semibold",
                          answered ? "bg-sky-100 text-[var(--primary-strong)]" : "bg-[var(--surface-strong)] text-[var(--muted-foreground)]"
                        )}
                      >
                        {index + 1}
                      </span>
                      {question.question}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">· {question.dimension}</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={option}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm leading-6 transition-all",
                            answers[question.id] === optionIndex
                              ? "border-[var(--primary)] bg-sky-50 text-[var(--primary-strong)] shadow-[inset_0_0_0_1px_var(--primary)]"
                              : "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={optionIndex}
                            checked={answers[question.id] === optionIndex}
                            onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                            className="size-4 accent-[var(--primary)]"
                            aria-label={`第 ${index + 1} 题选项 ${optionIndex + 1}`}
                          />
                          <span className="font-medium text-[var(--foreground)]/85">{String.fromCharCode(65 + optionIndex)}.</span>
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )
              })}

              {notice && (
                <div
                  role={notice.tone === "warning" ? "alert" : "status"}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius-md)] p-3.5 text-sm leading-6",
                    notice.tone === "warning"
                      ? "border border-amber-300 bg-amber-50 text-amber-900"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-900"
                  )}
                >
                  {notice.tone === "warning" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{notice.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
                <Button type="submit" className="h-10 bg-[var(--primary)] px-5 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.5)] hover:bg-[var(--primary-strong)]" disabled={answeredCount < QUIZ_QUESTIONS.length}>
                  {answeredCount >= QUIZ_QUESTIONS.length ? "查看我的学情画像" : `还需 ${QUIZ_QUESTIONS.length - answeredCount} 题`}
                  <ArrowRight className="size-4" />
                </Button>
                <span className="text-xs leading-5 text-[var(--muted-foreground)]">
                  {answeredCount === 0 ? "尚未作答" : `已完成 ${answeredCount}/${QUIZ_QUESTIONS.length} 题，结果自动保存。`}
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <CardHeader className="px-6 pb-3 pt-5">
              <CardTitle className="text-[14px] font-semibold tracking-[-0.01em]">当前维度画像</CardTitle>
              <CardDescription className="mt-1 text-xs">实时预览 · 不是最终诊断</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 px-6 pb-6 pt-2">
              {DIAGNOSTIC_DIMENSIONS.map((dimension) => {
                const value = (runningResult.dimensions as Record<string, number>)[dimension] ?? 0
                const isWeakest = weakestSoFar?.dim === dimension && answeredCount === QUIZ_QUESTIONS.length
                return (
                  <div key={dimension}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-[var(--foreground)]">
                        {dimension}
                        {isWeakest && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            当前最薄弱
                          </span>
                        )}
                      </span>
                      <strong className="font-semibold tabular-nums text-[var(--primary-strong)]">{value}</strong>
                    </div>
                    <Progress value={value} className="h-1.5" />
                  </div>
                )
              })}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
                <span className="text-[var(--muted-foreground)]">已完成题数</span>
                <strong>{answeredCount} / {QUIZ_QUESTIONS.length}</strong>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary-softer)] to-white shadow-[var(--shadow-card)]">
              <CardHeader className="px-6 pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold tracking-[-0.01em]">诊断结果</CardTitle>
                  <StatusBadge tone="success">已保存</StatusBadge>
                </div>
                <CardDescription className="mt-1 text-xs">{result.level} · 系统将用薄弱维度参与项目排序。</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5 pt-2">
                <div className="flex items-end justify-between gap-3 rounded-[var(--radius-md)] bg-white p-4 shadow-[inset_0_0_0_1px_var(--border)]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">前测得分</p>
                    <p className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--primary)]">{result.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">完成度</p>
                    <p className="mt-1 text-[20px] font-semibold tabular-nums text-[var(--foreground)]">{result.answeredCount}/{result.totalQuestions}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={() => navigate("projects")} className="h-10 bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
                    查看项目匹配 <ArrowRight className="size-4" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate("curriculum")}>
                    浏览课程结构
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AlertDialog open={pendingDiagnosis !== null} onOpenChange={(open) => !open && setPendingDiagnosis(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重新诊断会清空当前项目进度？</AlertDialogTitle>
            <AlertDialogDescription>当前已为当前项目留下任务记录、过程文本和评价。重新诊断后项目选择会被重置，但系统会在 24 小时内保留一份可恢复的快照。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRediagnosis} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">重新诊断</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function CurriculumView({ state, navigate, teacher = false }: { state: AppState; navigate: (view: AppView) => void; teacher?: boolean }) {
  const [query, setQuery] = React.useState("")
  const [module, setModule] = React.useState("全部")
  const [selectedNode, setSelectedNode] = React.useState("core")
  const [sortPersonal, setSortPersonal] = React.useState(false)
  const node = KNOWLEDGE_NODES.find((item) => item.id === selectedNode) ?? KNOWLEDGE_NODES[0]
  const filtered = CHAPTER_MAPPINGS.filter((chapter) => { const haystack = [chapter.title, chapter.module, chapter.concepts.join(" "), getProjectById(chapter.primary)?.title ?? ""].join(" "); return (!query || haystack.toLowerCase().includes(query.toLowerCase())) && (module === "全部" || chapter.module === module) }).sort((a, b) => sortPersonal ? calculateChapterMatchScore(b, state.diagnosis, state.student) - calculateChapterMatchScore(a, state.diagnosis, state.student) : a.no - b.no)
  return <div className="space-y-6"><Tabs defaultValue="chapters"><TabsList className="w-full justify-start overflow-x-auto rounded-md border border-[var(--border)] bg-white p-1"><TabsTrigger value="chapters">章节项目矩阵</TabsTrigger><TabsTrigger value="graph">知识图谱</TabsTrigger></TabsList><TabsContent value="chapters" className="mt-5 space-y-4"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_auto]"><label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索章节、概念或项目" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节、概念或项目" className="pl-9" /></label><Select value={module} onValueChange={setModule}><SelectTrigger className="w-full"><SelectValue placeholder="知识模块" /></SelectTrigger><SelectContent><SelectItem value="全部">全部模块</SelectItem>{["力学", "振动与波", "热学", "电磁学", "光学", "近代物理"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Button variant={sortPersonal ? "default" : "outline"} onClick={() => setSortPersonal((value) => !value)} disabled={!state.diagnosis}><Filter className="size-4" />按学情排序</Button></CardContent></Card><div className="grid gap-3">{filtered.map((chapter) => <ChapterRow key={chapter.no} chapter={chapter} diagnosis={state.diagnosis} student={state.student} onProject={() => navigate(teacher ? "curriculum" : "projects")} onTask={() => { updateRouteProject(chapter.primary); navigate("tasks" as AppView) }} />)}{filtered.length === 0 && <EmptyState title="没有匹配章节" description="尝试换一个关键词或清除模块筛选。" />}</div></TabsContent><TabsContent value="graph" className="mt-5"><div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="relative min-h-[480px] overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#f8fbff_0%,#eaf2fa_60%,#dce8f4_100%)] p-6">
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-sky-300" viewBox="0 0 100 100" preserveAspectRatio="none">
      <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="0.8 0.8" opacity="0.6" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="0.8 0.8" opacity="0.5" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="0.8 0.8" opacity="0.4" />
      <circle cx="50" cy="50" r="14" fill="none" stroke="#0284c7" strokeWidth="0.08" opacity="0.4" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="#0284c7" strokeWidth="0.08" opacity="0.3" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="#0284c7" strokeWidth="0.08" opacity="0.2" />
    </svg><div className="relative grid min-h-[430px] place-items-center"><button onClick={() => setSelectedNode("core")} className="grid size-28 place-items-center rounded-full bg-[var(--primary)] p-3 text-center text-sm font-semibold text-white shadow-lg shadow-sky-900/20">大学物理<br />知识核心</button>{KNOWLEDGE_NODES.filter((item) => item.id !== "core").map((item, index) => { const angle = (index / 14) * Math.PI * 2 - Math.PI / 2; const x = 50 + Math.cos(angle) * 37; const y = 50 + Math.sin(angle) * 37; return <React.Fragment key={item.id}><span className="absolute left-1/2 top-1/2 h-px w-[38%] origin-left bg-slate-300" style={{ transform: `rotate(${angle}rad)` }} /><button onClick={() => setSelectedNode(item.id)} className={cn("absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-white px-1 text-center text-[11px] font-medium shadow-sm transition-all hover:scale-105", selectedNode === item.id ? "border-[var(--primary)] text-[var(--primary)] ring-4 ring-sky-100" : "border-slate-200 text-slate-700")} style={{ left: `${x}%`, top: `${y}%` }}>{item.title}</button></React.Fragment> })}</div></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><StatusBadge tone="info">当前节点</StatusBadge><CardTitle className="mt-3 text-xl">{node.title}</CardTitle><CardDescription className="mt-2 leading-6">{node.description}</CardDescription></CardHeader><CardContent className="space-y-4 p-6 pt-3"><div className="rounded-md bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">关联项目与资源</p><p className="mt-2 text-sm leading-6 text-slate-700">{node.recommendations}</p></div><Button variant="outline" onClick={() => navigate(teacher ? "curriculum" : "projects")}>打开项目匹配<ArrowRight className="size-4" /></Button></CardContent></Card></div></TabsContent></Tabs></div>
}

function updateRouteProject(projectId: string) { window.dispatchEvent(new CustomEvent("physics:set-project", { detail: projectId })) }

function ChapterRow({ chapter, diagnosis, student, onProject, onTask }: { chapter: ChapterMapping; diagnosis?: DiagnosisResult; student?: AppState["student"]; onProject: () => void; onTask: () => void }) {
  const project = getProjectById(chapter.primary)
  const match = calculateChapterMatchScore(chapter, diagnosis, student)
  return <Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-sky-50 text-sm font-semibold text-[var(--primary)]">{String(chapter.no).padStart(2, "0")}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{chapter.title}</h3><StatusBadge tone={chapter.status === "成熟案例" ? "success" : chapter.status === "重点建设" ? "warning" : "default"}>{chapter.status}</StatusBadge></div><p className="mt-1 text-xs text-[var(--muted-foreground)]">{chapter.volume} · {chapter.module} · 建议课时 {chapter.hours}</p></div></div><div className="text-left lg:text-right"><p className="text-xs text-[var(--muted-foreground)]">匹配度</p><p className="text-xl font-semibold text-[var(--primary)]">{match}%</p></div></div><div className="mt-4 flex flex-wrap gap-2">{chapter.concepts.map((concept) => <span key={concept} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-[var(--foreground-soft)]">{concept}</span>)}</div><div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><div><p className="text-xs text-[var(--muted-foreground)]">主项目</p><p className="mt-1 font-medium text-[var(--primary)]">{project?.title ?? "待建设"}</p></div><div><p className="text-xs text-[var(--muted-foreground)]">能力路径</p><p className="mt-1 leading-5">{chapter.ability}</p></div><div><p className="text-xs text-[var(--muted-foreground)]">成果证据</p><p className="mt-1 leading-5">{chapter.output}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onProject}>查看项目<ArrowRight className="size-3.5" /></Button><Button size="sm" onClick={onTask} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">生成本章任务单<ListChecks className="size-3.5" /></Button></div></CardContent></Card>
}

function ProjectsView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const [query, setQuery] = React.useState("")
  const [level, setLevel] = React.useState("全部")
  const [pendingProject, setPendingProject] = React.useState<{ id: string; title: string } | null>(null)
  const undo = useUndoSnapshot()
  const matches = matchProjects(state.diagnosis, state.student, [...PROJECTS, ...state.localProjects]).filter((item) => (!query || item.project.title.toLowerCase().includes(query.toLowerCase()) || item.project.intro.toLowerCase().includes(query.toLowerCase())) && (level === "全部" || item.project.level === level))
  const hasExistingWork = Boolean(state.projectId) && (Object.keys(state.taskChecks).length > 0 || Object.keys(state.taskTexts).length > 0 || state.evaluation !== undefined)
  const requestSelectProject = (projectId: string) => {
    const target = matches.find((item) => item.project.id === projectId)?.project
    if (hasExistingWork && state.projectId !== projectId) {
      setPendingProject({ id: projectId, title: target?.title ?? "当前项目" })
      return
    }
    update((current) => ({ ...current, projectId, activeTask: 0, taskChecks: {}, taskTexts: {}, evaluation: undefined }))
  }
  const confirmSelectProject = () => {
    if (!pendingProject) return
    const projectId = pendingProject.id
    undo.capture(state, "切换项目")
    update((current) => ({ ...current, projectId, activeTask: 0, taskChecks: {}, taskTexts: {}, evaluation: undefined }))
    setPendingProject(null)
  }
  return (
    <>
      <div className="space-y-5">
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardContent className="grid gap-3 px-4 py-3.5 md:grid-cols-[1.6fr_1fr_auto] md:items-center">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目名称或简介" className="h-9 pl-9" aria-label="搜索项目" />
            </label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-9 w-full" aria-label="按难度筛选"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部难度</SelectItem>
                <SelectItem value="基础">基础</SelectItem>
                <SelectItem value="中等">中等</SelectItem>
                <SelectItem value="较高">较高</SelectItem>
              </SelectContent>
            </Select>
            <StatusBadge tone={state.diagnosis ? "success" : "warning"}>
              {state.diagnosis ? "已结合学情" : "完成诊断后更精准"}
            </StatusBadge>
          </CardContent>
        </Card>

        {!state.diagnosis && (
          <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/40 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <Lightbulb className="size-4" aria-hidden="true" />
            </div>
            <p className="flex-1 leading-6">
              当前展示课程适配度。完成 AI 学情诊断后，系统会优先显示覆盖薄弱维度、符合学习方式和能力目标的项目。
            </p>
            <Button size="sm" variant="outline" className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-50" onClick={() => navigate("diagnosis")}>
              去诊断 <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {matches.length === 0 ? (
          <EmptyState title="没有匹配的项目" description="尝试换一个关键词，或切换难度筛选。" action={<Button variant="outline" onClick={() => { setQuery(""); setLevel("全部") }}>清除筛选</Button>} icon={Library} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map(({ project, score, reasons }, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                score={score}
                reasons={reasons}
                featured={index === 0 && Boolean(state.diagnosis)}
                selected={state.projectId === project.id}
                onSelect={() => requestSelectProject(project.id)}
                onTasks={() => navigate("tasks")}
              />
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={pendingProject !== null} onOpenChange={(open) => !open && setPendingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>放弃当前五阶段进度？</AlertDialogTitle>
            <AlertDialogDescription>你已为当前项目留下任务文本、复选清单和评价证据。切换到「{pendingProject?.title}」后这些过程证据会被清除，但系统会在 24 小时内保留一份可恢复的快照。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSelectProject} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">放弃并切换</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ProjectCard({ project, score, reasons, featured, selected, onSelect, onTasks }: { project: Project; score: number; reasons: readonly string[]; featured: boolean; selected: boolean; onSelect: () => void; onTasks: () => void }) {
  const levelTone = project.level === "基础" ? "success" : project.level === "较高" ? "warning" : "default"
  return (
    <Card
      className={cn(
        "group flex h-full flex-col rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        featured && "border-[var(--primary)]/40 bg-gradient-to-br from-[var(--primary-softer)] to-white ring-1 ring-[var(--primary)]/15",
        selected && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
      )}
    >
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge tone={featured ? "info" : levelTone}>
            {featured ? "AI 优先推荐" : project.level}
          </StatusBadge>
          {score > 0 ? (
            <div className="flex items-baseline gap-1 text-[var(--primary)]">
              <span className="text-[18px] font-semibold leading-none tabular-nums tracking-[-0.02em]">{score}</span>
              <span className="text-[11px] font-semibold">% 匹配</span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--muted-foreground)]">课程适配</span>
          )}
        </div>
        <CardTitle className="mt-4 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[var(--foreground)]">{project.title}</CardTitle>
        <CardDescription className="mt-1.5 text-[13px] leading-6 text-[var(--muted-foreground)]">{project.intro}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3.5 px-5 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {project.dims.map((dimension) => (
            <span key={dimension} className="rounded-md bg-[var(--primary-softer)] px-2 py-1 text-[11px] font-medium text-[var(--primary-strong)]">
              {dimension}
            </span>
          ))}
        </div>
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]/80">能力路径</span>：{project.ability}
        </p>
        {reasons.length > 0 && (
          <ul className="space-y-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--primary-softer)]/40 p-3 text-xs text-[var(--foreground-soft)]">
            {reasons.slice(0, 3).map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="gap-2 border-t border-[var(--border)] bg-[var(--primary-softer)]/30 px-5 py-3.5">
        {selected ? (
          <Button size="sm" variant="outline" className="w-full border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" onClick={onTasks}>
            <CheckCircle2 className="size-4" />已选择，去闯关
          </Button>
        ) : (
          <Button size="sm" className="w-full bg-[var(--primary)] hover:bg-[var(--primary-strong)]" onClick={onSelect}>
            选择项目 <ArrowRight className="size-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function TasksView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const project = getStateProject(state, state.projectId)
  const [active, setActive] = React.useState(state.activeTask ?? 0)
  const [text, setText] = React.useState(state.taskTexts?.[String(active)] ?? "")
  const [savedFlash, setSavedFlash] = React.useState<number | null>(null)
  React.useEffect(() => {
    window.queueMicrotask(() => setText(state.taskTexts?.[String(active)] ?? ""))
  }, [active, state.taskTexts])
  if (!project)
    return (
      <EmptyState
        title="还没有选择项目"
        description="先从项目匹配中心选择一个案例，系统会为你打开五阶任务路径。"
        action={
          <Button onClick={() => navigate("projects")} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
            前往项目匹配 <ArrowRight className="size-4" />
          </Button>
        }
        icon={ListChecks}
      />
    )
  const progress = calculateTaskProgress(state.taskChecks)
  const current = TASK_TEMPLATES[active]
  const saveTask = () => {
    update((currentState) => ({ ...currentState, activeTask: active, taskTexts: { ...currentState.taskTexts, [String(active)]: text } }))
    setSavedFlash(active)
    window.setTimeout(() => setSavedFlash((current) => (current === active ? null : current)), 2200)
  }
  const toggleCheck = (key: string, value: boolean) =>
    update((currentState) => ({ ...currentState, taskChecks: { ...currentState.taskChecks, [key]: value } }))
  const completedStages = TASK_TEMPLATES.filter((task, idx) => task.checks.every((_, checkIndex) => state.taskChecks[`${idx}-${checkIndex}`])).length

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary-softer)] via-white to-[var(--primary-softer)] shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              <Target className="size-3.5" aria-hidden="true" />
              当前项目
            </div>
            <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.015em] text-[var(--foreground)]">{project.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{project.ability}</p>
          </div>
          <div className="min-w-[220px]">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--primary-strong)]">
              <span className="font-semibold">总进度</span>
              <span className="font-mono tabular-nums">{progress.percentage}% · {completedStages}/5 关</span>
            </div>
            <Progress value={progress.percentage} className="h-2 bg-white/70" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-5 pb-3 pt-4">
            <CardTitle className="text-[14px] font-semibold tracking-[-0.01em]">五阶任务</CardTitle>
            <CardDescription className="mt-1 text-xs">点击切换任务阶段</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 px-3 pb-3 pt-3">
            <ol className="relative space-y-1">
              {TASK_TEMPLATES.map((task, index) => {
                const taskDone = task.checks.every((_, checkIndex) => state.taskChecks[`${index}-${checkIndex}`])
                return (
                  <li key={task.id}>
                    <button
                      onClick={() => setActive(index)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-all",
                        active === index
                          ? "border-[var(--primary)]/30 bg-[var(--primary-softer)] text-[var(--primary-strong)] shadow-[inset_2px_0_0_0_var(--primary)]"
                          : "hover:border-[var(--border)] hover:bg-slate-50"
                      )}
                      aria-current={active === index ? "step" : undefined}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                          taskDone
                            ? "bg-[var(--success)] text-white"
                            : active === index
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]"
                        )}
                      >
                        {taskDone ? <Check className="size-3" /> : index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold leading-5">{task.name}</span>
                        <span className="mt-0.5 block text-[11px] leading-5 text-[var(--muted-foreground)]">{task.ability}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-7 pb-5 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="info">{current.ability}</StatusBadge>
              <StatusBadge>第 {active + 1} / 5 关</StatusBadge>
              {savedFlash === active && (
                <StatusBadge tone="success">
                  <CheckCircle2 className="mr-1 size-3" />已保存
                </StatusBadge>
              )}
            </div>
            <CardTitle className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{current.name}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-[14px] leading-6 text-[var(--muted-foreground)]">{current.goal}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7 pt-6">
            <section>
              <SectionTitle title="闯关条件" description={`完成 ${current.checks.length} 项即可解锁下一关。`} />
              <div className="grid gap-2 sm:grid-cols-2">
                {current.checks.map((check, index) => {
                  const key = `${active}-${index}`
                  const checked = Boolean(state.taskChecks[key])
                  return (
                    <label
                      key={check}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3 text-sm leading-6 transition-all",
                        checked ? "border-emerald-300 bg-emerald-50/50 text-emerald-900" : "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggleCheck(key, event.target.checked)}
                        className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                        aria-label={check}
                      />
                      <span className="flex-1">{check}</span>
                      {checked && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />}
                    </label>
                  )
                })}
              </div>
            </section>

            <section>
              <SectionTitle title="过程说明" description="记录思路、证据、困难和下一步计划，保存后会自动进入学习报告。" />
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={6}
                placeholder="例如：我先用 …… 测量 ……，发现 ……，下一步准备 ……"
                className="resize-2"
              />
            </section>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--border)] pt-5">
              <Button onClick={saveTask} className="h-10 bg-[var(--primary)] px-5 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.45)] hover:bg-[var(--primary-strong)]">
                <Save className="size-4" />保存本关记录
              </Button>
              {active < TASK_TEMPLATES.length - 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    saveTask()
                    setActive((index) => index + 1)
                  }}
                >
                  进入下一关 <ArrowRight className="size-4" />
                </Button>
              )}
              {active === TASK_TEMPLATES.length - 1 && (
                <Button variant="outline" onClick={() => navigate("report")}>
                  生成学习报告 <ArrowRight className="size-4" />
                </Button>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-4 text-sm leading-6 text-[var(--primary-strong)]">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-[var(--primary)]">
                <Bot className="size-4" aria-hidden="true" />
              </div>
              <div>
                <strong className="block text-[var(--primary)]">AI 实践智能体提示</strong>
                <span>{current.prompt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AssistantView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [input, setInput] = React.useState("")
  const log = state.chat.length > 0
    ? state.chat
    : [{ role: "ai" as const, text: "你好，我是物理 AI 助教「知物」。我会帮助你梳理概念、分析实验和审查方案，但不会直接替你完成作业。" }]
  const send = (value = input) => {
    const question = value.trim()
    if (!question) return
    update((current) => ({ ...current, chat: [...current.chat, { role: "user", text: question }, { role: "ai", text: aiReply(question) }] }))
    setInput("")
  }
  const quickQuestions = ["为什么超声波可以测距？", "如何判断项目方案是否合理？", "如何分析实验误差？", "牛顿第二定律怎么迁移应用？"]
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardHeader className="border-b border-[var(--border)] px-5 pb-3 pt-5">
          <CardTitle className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em]">
            <Lightbulb className="size-4 text-[var(--primary)]" aria-hidden="true" />
            快捷问题
          </CardTitle>
          <CardDescription className="mt-1 text-xs">从一个具体问题开始</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pt-3">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => send(question)}
              className="group flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-transparent px-3 py-2.5 text-left text-[13px] leading-5 transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--primary-softer)] hover:text-[var(--primary-strong)]"
            >
              <span>{question}</span>
              <ChevronRight className="size-3.5 text-[var(--border-strong)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" aria-hidden="true" />
            </button>
          ))}
          <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-3 text-[12px] leading-5 text-[var(--primary-strong)]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <span><strong className="block font-semibold">知识辅导</strong>围绕课程知识提供分步追问、提示和验证建议。</span>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[600px] flex-col overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary-softer)] to-white px-6 py-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-[12px] font-semibold text-white">知</span>
              知物对话
            </CardTitle>
            <CardDescription className="mt-1 text-xs">追问 · 提示 · 验证</CardDescription>
          </div>
          <StatusBadge tone="success">
            <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            在线
          </StatusBadge>
        </CardHeader>
        <CardContent className="ds-scrollable flex-1 space-y-4 bg-[var(--primary-softer)]/30 p-6">
          {log.map((message, index) => {
            const isAi = message.role === "ai"
            return (
              <div key={`${message.role}-${index}`} className={cn("flex items-start gap-3", !isAi && "flex-row-reverse")}>
                <Avatar
                  className={cn(
                    "size-8 shrink-0 ring-2 ring-white shadow-sm",
                    isAi ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white" : "bg-slate-200 text-slate-700"
                  )}
                >
                  <AvatarFallback className="text-[12px] font-semibold">{isAi ? "知" : "我"}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[78%] whitespace-pre-line rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-6 shadow-[var(--shadow-card)]",
                    isAi
                      ? "rounded-tl-md border border-[var(--border)] bg-white text-[var(--foreground-soft)]"
                      : "rounded-tr-md bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white shadow-[0_8px_18px_-10px_rgba(3,105,161,0.5)]"
                  )}
                >
                  {message.text}
                </div>
              </div>
            )
          })}
        </CardContent>
        <CardFooter className="border-t border-[var(--border)] bg-white px-4 py-3.5">
          <div className="flex w-full items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              placeholder="输入物理问题、实验困难或项目思路（Enter 发送，Shift + Enter 换行）"
              rows={2}
              aria-label="向 AI 助教提问"
            />
            <Button aria-label="发送问题" onClick={() => send()} className="h-10 w-10 shrink-0 bg-[var(--primary)] p-0 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.5)] hover:bg-[var(--primary-strong)]">
              <Send className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function LabView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [distance, setDistance] = React.useState(1)
  const [speed, setSpeed] = React.useState(343)
  const [reflectivity, setReflectivity] = React.useState(80)
  const [noise, setNoise] = React.useState(2)
  const [lastRun, setLastRun] = React.useState<LabRecord | undefined>(state.labRecords.at(-1))
  const echoTime = calculateUltrasonicEchoTime(distance, speed)
  const run = () => {
    const measurement = simulateUltrasonicMeasurement({ distanceM: distance, speedMps: speed, reflectivity, noisePercent: noise })
    const record: LabRecord = {
      ...measurement,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      reflect: reflectivity,
      noise,
    }
    setLastRun(record)
    update((current) => ({ ...current, labRecords: [...current.labRecords, record] }))
  }
  const echoWaveform = React.useMemo(() => {
    const wf = simulateUltrasonicWaveform({ distanceM: distance, speedMps: speed, reflectivity, noisePercent: noise, random: () => 0.5 })
    const W = 360
    const H = 80
    const totalMs = wf.totalMs
    let path = ""
    const stride = Math.max(1, Math.floor(wf.time.length / 240))
    for (let i = 0; i < wf.time.length; i += stride) {
      const ti = wf.time[i]
      const y = H / 2 - wf.amplitude[i] * (H / 2 - 4)
      path += (i === 0 ? "M" : "L") + (ti * (W / totalMs)).toFixed(2) + "," + y.toFixed(2) + " "
    }
    return { path, W, H, pulseAt: echoTime, totalMs }
  }, [distance, speed, reflectivity, noise, echoTime])
  const params = [
    { label: "目标距离", value: distance, min: 0.2, max: 3, step: 0.1, unit: "m", hint: "超声模块到目标物体的直线距离", set: setDistance },
    { label: "环境声速", value: speed, min: 320, max: 360, step: 1, unit: "m/s", hint: "常温下空气中声速约 343 m/s", set: setSpeed },
    { label: "反射率", value: reflectivity, min: 20, max: 100, step: 1, unit: "%", hint: "目标表面对超声的反射能力", set: setReflectivity },
    { label: "测量噪声", value: noise, min: 0, max: 15, step: 1, unit: "%", hint: "环境与电路引入的随机扰动", set: setNoise },
  ] as const

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 pb-4 pt-5">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
                <Activity className="size-4 text-[var(--primary)]" aria-hidden="true" />
                超声波测距场景
              </CardTitle>
              <CardDescription className="mt-1 text-xs">观察往返传播时间如何映射到目标距离。</CardDescription>
            </div>
            <StatusBadge tone={lastRun?.quality === "较差" ? "danger" : lastRun ? "success" : "info"}>
              {lastRun ? lastRun.quality : "待运行"}
            </StatusBadge>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-5">
            <div className="relative h-72 overflow-hidden rounded-[var(--radius-lg)] border border-sky-100 bg-gradient-to-b from-sky-50 via-sky-50 to-cyan-50/60">
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-sky-200/70" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="lab-grid" width="6" height="6" patternUnits="userSpaceOnUse">
                      <path d="M 6 0 L 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="0.18" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#lab-grid)" />
                </svg>
                <div className="absolute bottom-12 left-10 grid size-16 place-items-center rounded-xl border-2 border-sky-400 bg-sky-100 text-center text-xs font-semibold text-sky-900 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.6)]">
                  超声<br />模块
                </div>
                <div className="absolute bottom-10 right-12 h-40 w-9 rounded-md border-2 border-slate-500 bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_8px_18px_-8px_rgba(15,30,60,0.6)]" />
                <div className="absolute bottom-[96px] left-[116px] right-[78px] h-1 bg-sky-400/60" />
                <div className="absolute bottom-[92px] left-[116px] h-2.5 w-2.5 rounded-full bg-sky-600 shadow-[0_0_0_8px_rgba(2,132,199,0.15)]" />
                <div className="absolute bottom-[104px] left-[116px] right-[78px] border-t border-dashed border-sky-500/70" />
                <div className="absolute left-1/2 top-7 -translate-x-1/2 rounded-md border border-sky-200 bg-white/85 px-4 py-2 text-center text-xs text-slate-600 shadow-md backdrop-blur-sm">
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">理论往返时间</span>
                  <strong className="block text-[20px] font-semibold leading-none tracking-[-0.03em] text-[var(--primary)]">{echoTime.toFixed(2)} ms</strong>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur-sm">
                  目标距离 <strong className="ml-1 font-mono text-[var(--primary-strong)]">{distance.toFixed(2)} m</strong>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-6 pb-3 pt-5">
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <FlaskConical className="size-4 text-[var(--primary)]" aria-hidden="true" />
              实验参数
            </CardTitle>
            <CardDescription className="mt-1 text-xs">拖动参数后运行一次测量。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-5">
            {params.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
                  <strong className="font-mono text-[15px] tabular-nums text-[var(--primary)]">
                    {typeof item.value === "number" && item.step < 1 ? item.value.toFixed(2) : item.value}
                    <span className="ml-0.5 text-xs font-semibold text-[var(--primary-strong)]">{item.unit}</span>
                  </strong>
                </div>
                <input
                  aria-label={item.label}
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.value}
                  onChange={(event) => item.set(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-strong)] accent-[var(--primary)]"
                  aria-valuetext={`${item.value} ${item.unit}`}
                />
                <p className="text-[11px] leading-5 text-[var(--muted-foreground)]">{item.hint}</p>
              </div>
            ))}

            <Button className="h-10 w-full bg-[var(--primary)] shadow-[0_8px_18px_-8px_rgba(3,105,161,0.5)] hover:bg-[var(--primary-strong)]" onClick={run}>
              <Play className="size-4" />运行一次测量
            </Button>

            {lastRun && (
              <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--primary-softer)]/40 p-3 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">测量结果</p>
                  <strong className="mt-1 block font-mono text-[15px] tabular-nums text-[var(--foreground)]">{lastRun.measuredDistanceM.toFixed(3)} m</strong>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">相对误差</p>
                  <strong className="mt-1 block font-mono text-[15px] tabular-nums text-[var(--foreground)]">{lastRun.errorPercent.toFixed(2)}%</strong>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">信号质量</p>
                  <strong className="mt-1 block text-[15px] text-[var(--foreground)]">{lastRun.quality}</strong>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 pb-4 pt-5">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <Activity className="size-4 text-[var(--primary)]" aria-hidden="true" />
              超声脉冲-回波时域信号
            </CardTitle>
            <CardDescription className="mt-1 text-xs">左侧为发射脉冲，右侧为接收回波，两者间隔即为往返传播时间。</CardDescription>
          </div>
          <StatusBadge tone={reflectivity >= 60 && noise <= 8 ? "success" : "warning"}>
            {reflectivity >= 60 && noise <= 8 ? "信号可识别" : "信号受干扰"}
          </StatusBadge>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-5">
          <div className="relative h-28 overflow-hidden rounded-[var(--radius-md)] border border-slate-800 bg-slate-950">
            <svg
              role="img"
              aria-label={`发射脉冲与回波间隔 ${echoTime.toFixed(2)} 毫秒`}
              viewBox={"0 0 " + echoWaveform.W + " " + echoWaveform.H}
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="echo-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <line x1="0" y1={echoWaveform.H / 2} x2={echoWaveform.W} y2={echoWaveform.H / 2} stroke="#475569" strokeWidth="0.5" strokeDasharray="2 4" />
              <line
                x1={(echoWaveform.pulseAt / 8) * echoWaveform.W}
                y1="0"
                x2={(echoWaveform.pulseAt / 8) * echoWaveform.W}
                y2={echoWaveform.H}
                stroke="#f59e0b"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <path d={echoWaveform.path} stroke="url(#echo-grad)" strokeWidth="1.4" fill="none" />
            </svg>
            <div className="absolute left-3 top-2 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300">
              <span className="block">t = 0 ms · TX</span>
              <span className="mt-0.5 block text-[9px] text-cyan-300/70">发射脉冲</span>
            </div>
            <div className="absolute right-3 top-2 text-right text-[10px] font-mono uppercase tracking-[0.14em] text-amber-300">
              <span className="block">t = {echoTime.toFixed(2)} ms · RX</span>
              <span className="mt-0.5 block text-[9px] text-amber-300/70">回波到达</span>
            </div>
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>0 ms</span>
              <span>{(echoWaveform.totalMs / 2).toFixed(2)} ms</span>
              <span>{echoWaveform.totalMs.toFixed(2)} ms</span>
            </div>
          </div>

          {state.labRecords.length > 0 && (
            <div className="mt-5">
              <SectionTitle title="误差散点" description={`最近 ${Math.min(10, state.labRecords.length)} 次测量的距离-误差分布，颜色对应信号质量。`} />
              <div className="relative h-36 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-gradient-to-b from-white to-[var(--primary-softer)]/30 p-3">
                <svg
                  role="img"
                  aria-label="最近实验误差分布"
                  viewBox="0 0 300 110"
                  className="absolute inset-0 h-full w-full"
                >
                  {[20, 60, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#dbe4ee" strokeWidth="0.5" />
                  ))}
                  {state.labRecords.slice(-10).map((rec, i, arr) => {
                    const x = 10 + (i / Math.max(1, arr.length - 1)) * 280
                    const errorClamped = Math.min(15, Math.max(0, rec.errorPercent))
                    const y = 20 + (errorClamped / 15) * 60
                    const color = rec.quality === "良好" ? "#10b981" : rec.quality === "一般" ? "#f59e0b" : "#ef4444"
                    return <circle key={rec.timestamp} cx={x} cy={y} r="3.5" fill={color} opacity="0.9" />
                  })}
                </svg>
                <div className="absolute right-3 top-1 text-[10px] font-mono text-[var(--muted-foreground)]">0%</div>
                <div className="absolute right-3 bottom-1 text-[10px] font-mono text-[var(--muted-foreground)]">15%</div>
                <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" />良好</span>
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" />一般</span>
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" />较差</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 py-4">
          <div>
            <CardTitle className="text-[15px] font-semibold tracking-[-0.01em]">实验记录</CardTitle>
            <CardDescription className="mt-1 text-xs">共 {state.labRecords.length} 条 · 记录自动保存。</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={state.labRecords.length === 0}>
                <Trash2 className="size-4" />清空记录
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空实验记录？</AlertDialogTitle>
                <AlertDialogDescription>将删除全部已保存的测量记录，此操作不可撤销。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={() => update((current) => ({ ...current, labRecords: [] }))}
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="p-0">
          {state.labRecords.length === 0 ? (
            <div className="px-6 py-8">
              <EmptyState
                title="尚未运行测量"
                description="调整参数后点击「运行一次测量」，系统会将一条记录加入表格。"
                icon={Activity}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--primary-softer)]/40">
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">时间</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">距离</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">测量值</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">误差</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">信号质量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.labRecords
                  .slice()
                  .reverse()
                  .map((record, index) => (
                    <TableRow key={`${record.timestamp}-${index}`} className="hover:bg-[var(--primary-softer)]/30">
                      <TableCell className="font-mono text-xs">{record.time ?? record.timestamp}</TableCell>
                      <TableCell className="font-mono">{record.distanceM.toFixed(2)} m</TableCell>
                      <TableCell className="font-mono font-semibold">{record.measuredDistanceM.toFixed(3)} m</TableCell>
                      <TableCell className="font-mono">{record.errorPercent.toFixed(2)}%</TableCell>
                      <TableCell>
                        <StatusBadge tone={record.quality === "良好" ? "success" : record.quality === "一般" ? "warning" : "danger"}>
                          {record.quality}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReportView({ state, navigate }: { state: AppState; navigate: (view: StudentView) => void }) {
  const project = getStateProject(state, state.projectId)
  const progress = calculateTaskProgress(state.taskChecks)
  const summary = state.evaluation ?? summarizeEvaluation({
    diagnosisScore: state.diagnosis?.score,
    taskProgress: progress.percentage,
    labRecords: state.labRecords,
    chatCount: state.chat.length,
    participation: 82,
    teamwork: 80,
    design: 78,
    experiment: 84,
    presentation: 80,
    reflection: 76,
  })
  const exportJson = () => {
    const data = {
      system: "大学物理 AI 智慧教学系统",
      student: state.student ?? { name: "陈思远" },
      diagnosis: state.diagnosis ?? null,
      project: project ?? null,
      taskProgress: progress,
      labRecords: state.labRecords,
      evaluation: summary,
      generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([withUtf8Bom(toJson(data))], { type: "application/json;charset=utf-8" })
    const anchor = document.createElement("a")
    anchor.href = URL.createObjectURL(blob)
    anchor.download = "大学物理AI学习报告.json"
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }

  const exportMarkdown = () => {
    const content = buildStudentReportMarkdown({ state, project, summary })
    const studentName = state.student?.name ?? "陈思远"
    downloadMarkdown(`大学物理AI学习报告-${studentName}.md`, content)
  }

  const printReport = () => {
    if (typeof window !== "undefined") window.print()
  }

  const abilities = [
    { label: "知识理解", value: summary.knowledge, color: "#0369a1" },
    { label: "专业应用", value: summary.application, color: "#2a8a78" },
    { label: "创新实践", value: summary.innovation, color: "#c47a2c" },
    { label: "团队协作", value: summary.collaboration, color: "#8b65be" },
  ]

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <Button onClick={exportMarkdown} className="h-10 bg-[var(--primary)] px-5 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.5)] hover:bg-[var(--primary-strong)]">
          <Download className="size-4" />下载 Markdown 报告
        </Button>
        <Button variant="outline" className="h-10" onClick={exportJson} aria-label="下载 JSON 报告（兼容旧格式）">
          <FileText className="size-4" />下载 JSON
        </Button>
        <Button variant="outline" className="h-10" onClick={printReport} aria-label="打印或另存为 PDF">
          打印 / 另存 PDF
        </Button>
        <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">报告生成于 {new Date().toLocaleString("zh-CN")}</span>
      </div>

      <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] print:shadow-none">
        <CardHeader className="relative overflow-hidden border-b border-[var(--border)] px-7 pb-6 pt-7">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--primary)] via-cyan-400 to-[var(--success)]" aria-hidden="true" />
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                <FileBarChart className="size-3.5" aria-hidden="true" />
                大学物理学习报告
              </div>
              <CardTitle className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.025em]">{state.student?.name ?? "陈思远"}的学习画像</CardTitle>
              <CardDescription className="mt-2 max-w-xl text-sm leading-6">报告根据你的学习记录生成，可用于复盘学习进展。</CardDescription>
            </div>
            <div className="shrink-0 rounded-[var(--radius-lg)] border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary-softer)] to-white p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">综合得分</p>
              <p className="mt-1 text-[42px] font-semibold leading-none tracking-[-0.04em] text-[var(--primary)]">{summary.final}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">{summary.grade}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-7 px-7 pb-7 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryStat label="诊断结果" value={state.diagnosis ? `${state.diagnosis.score} 分` : "未完成"} hint={state.diagnosis?.level ?? "完成 8 道基础题"} tone="blue" />
            <SummaryStat label="项目与任务" value={project ? `${progress.percentage}%` : "未选择"} hint={project?.title ?? "从项目匹配中心选择"} tone="green" />
            <SummaryStat label="实验记录" value={`${state.labRecords.length} 条`} hint="超声波测距 / 误差散点" tone="amber" />
          </div>

          <section>
            <SectionTitle
              title="四阶能力结果"
              description={`优势维度：${summary.strongestDimension}，下一步重点：${summary.weakestDimension}。`}
            />
            <div className="grid gap-3 md:grid-cols-2">
              {abilities.map((item) => {
                const isStrongest = item.label === summary.strongestDimension
                const isWeakest = item.label === summary.weakestDimension
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "rounded-[var(--radius-md)] border p-4 transition-colors",
                      isStrongest
                        ? "border-emerald-200 bg-emerald-50/40"
                        : isWeakest
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-[var(--border)] bg-white"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                        <strong className="font-semibold">{item.label}</strong>
                      </span>
                      <strong className="font-mono text-[15px] tabular-nums text-[var(--foreground)]">{item.value}</strong>
                    </div>
                    <Progress value={item.value} className="h-1.5" />
                    <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                      <span>0</span>
                      <span>{isStrongest ? "优势维度" : isWeakest ? "重点突破" : "稳步推进"}</span>
                      <span>100</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-4 text-sm leading-6 text-[var(--primary-strong)]">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-[var(--primary)]">
              <Lightbulb className="size-4" aria-hidden="true" />
            </div>
            <div>
              <strong className="block text-[var(--primary)]">AI 教学建议</strong>
              <span>当前相对薄弱维度为「{summary.weakestDimension}」。建议下一轮项目保留一个可观察、可记录的专项任务，并用前后数据验证改进效果。</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!state.evaluation && (
        <div className="no-print flex flex-col gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/40 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
          <Lightbulb className="size-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="flex-1 leading-6">完成更多任务或实验后，报告会自动更新。</p>
          <Button size="sm" variant="outline" className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-50" onClick={() => navigate("tasks")}>
            继续留下证据 <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

function SummaryStat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "blue" | "green" | "amber" }) {
  const toneStyles = {
    blue: "border-sky-200/70 bg-sky-50/60 text-[var(--primary-strong)]",
    green: "border-emerald-200/70 bg-emerald-50/60 text-emerald-900",
    amber: "border-amber-200/70 bg-amber-50/60 text-amber-900",
  } as const
  return (
    <div className={cn("rounded-[var(--radius-md)] border p-4", toneStyles[tone])}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-2 text-[22px] font-semibold leading-none tracking-[-0.03em]">{value}</p>
      <p className="mt-2 text-[11px] leading-5 text-[var(--muted-foreground)]">{hint}</p>
    </div>
  )
}

function TeacherDashboard({ navigate }: { navigate: (view: TeacherView) => void }) {
  const riskCount = DEMO_STUDENTS.filter((student) => student.risk === "高风险").length
  const chartData = [
    { name: "知识理解", value: 76 },
    { name: "专业应用", value: 72 },
    { name: "创新实践", value: 68 },
    { name: "团队协作", value: 74 },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden rounded-[var(--radius-lg)] border-0 bg-[var(--sidebar)] text-white shadow-[var(--shadow-pop)]">
          <div className="absolute inset-0 bg-[radial-gradient(40rem_18rem_at_120%_-20%,rgba(56,189,248,0.28),transparent_60%)]" aria-hidden="true" />
          <CardContent className="relative p-7 md:p-8">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/85">
              <span className="inline-block size-1.5 rounded-full bg-sky-300" aria-hidden="true" />
              本周教学调控
            </div>
            <h2 className="mt-3 max-w-2xl text-[26px] font-semibold leading-[1.18] tracking-[-0.025em]">
              从班级信号里，<span className="text-sky-100">找出下一堂课真正需要被看见的问题。</span>
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-7 text-sky-50/85">当前教学数据已聚合到章节、项目、任务与能力维度，支持教师先定位，再调整任务支架。</p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button className="h-10 bg-white px-5 text-[var(--primary-strong)] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.35)] hover:bg-sky-50" onClick={() => navigate("class")}>
                查看班级画像 <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" className="h-10 border-white/25 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("insights")}>
                查看教学洞察
              </Button>
              <div className="ml-auto hidden items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sky-100/70 md:flex">
                <span className="inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                班级 42 人 · 教师判断权
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 pb-4 pt-5">
            <div>
              <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
                <Bell className="size-4 text-amber-600" aria-hidden="true" />
                即时提醒
              </CardTitle>
              <CardDescription className="mt-1 text-xs">需要人工判断的信号</CardDescription>
            </div>
            <StatusBadge tone="warning">{riskCount + 2} 条</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-2.5 px-6 pb-6 pt-4">
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-rose-200 bg-rose-50/70 p-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-rose-900">机械波概念误区</p>
                <p className="mt-0.5 text-xs leading-5 text-rose-800/85">12 名学生混淆波速和质点振动速度。</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50/70 p-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-amber-900">项目进度滞后</p>
                <p className="mt-0.5 text-xs leading-5 text-amber-800/85">无线传能项目有 2 组尚未提交方案。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="教学班人数" value="42" hint="物理学 2601 班" icon={Users} tone="blue" />
        <MetricCard label="诊断完成率" value="90.5%" hint="38 / 42" icon={ClipboardCheck} tone="green" />
        <MetricCard label="项目启动率" value="83.3%" hint="35 / 42" icon={Target} tone="amber" />
        <MetricCard label="学习预警" value={`${riskCount + 5} 人`} hint="需教师关注" icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 pb-4 pt-5">
            <div>
              <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
                <Activity className="size-4 text-[var(--primary)]" aria-hidden="true" />
                四阶能力平均表现
              </CardTitle>
              <CardDescription className="mt-1 text-xs">当前教学班最近一次汇总</CardDescription>
            </div>
            <StatusBadge tone="info">最近 7 天</StatusBadge>
          </CardHeader>
          <CardContent className="px-4 pb-5 pt-3">
            <ChartContainer config={{ value: { label: "平均分", color: "#0369a1" } }} className="h-[260px] w-full">
              <BarChart data={chartData} margin={{ top: 12, right: 12, bottom: 10, left: -16 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5a6877", fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#8b99ab", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-6 pb-4 pt-5">
            <CardTitle className="text-[15px] font-semibold tracking-[-0.01em]">教师下一步</CardTitle>
            <CardDescription className="mt-1 text-xs">从一个可执行入口开始</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 px-3 pb-4 pt-3">
            {[
              { label: "查看高风险学生", desc: "先处理需要关注的个体", view: "class" as TeacherView, icon: Users, tone: "blue" },
              { label: "复核 AI 建议分", desc: "保留教师最终判断", view: "evaluation" as TeacherView, icon: ClipboardCheck, tone: "green" },
              { label: "生成调控方案", desc: "结合本周教学信号", view: "insights" as TeacherView, icon: Lightbulb, tone: "amber" },
            ].map((item) => {
              const toneStyles = {
                blue: "bg-sky-50 text-sky-700",
                green: "bg-emerald-50 text-emerald-700",
                amber: "bg-amber-50 text-amber-700",
              } as const
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.view)}
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-transparent px-3 py-2.5 text-left transition-all hover:border-[var(--border)] hover:bg-[var(--primary-softer)]"
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]", toneStyles[item.tone as keyof typeof toneStyles])}>
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-[var(--foreground)]">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{item.desc}</span>
                  </span>
                  <ChevronRight className="ml-auto size-4 text-[var(--border-strong)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" aria-hidden="true" />
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ClassView({ navigate }: { navigate: (view: TeacherView) => void }) {
  const [risk, setRisk] = React.useState("全部")
  const students = DEMO_STUDENTS.filter((student) => risk === "全部" || student.risk === risk)
  return (
    <div className="space-y-5">
      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col justify-between gap-3 px-4 py-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">班级学习概况</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">筛选风险状态，定位下一次辅导对象。</p>
          </div>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="h-9 w-full md:w-44" aria-label="按风险筛选"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部状态</SelectItem>
              <SelectItem value="高风险">高风险</SelectItem>
              <SelectItem value="关注">关注</SelectItem>
              <SelectItem value="正常">正常</SelectItem>
              <SelectItem value="优秀">优秀</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--primary-softer)]/40">
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">学生</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">前测</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">薄弱维度</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">当前项目</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">任务进度</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">风险</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.name} className="hover:bg-[var(--primary-softer)]/30">
                  <TableCell className="font-semibold">{student.name}</TableCell>
                  <TableCell className="font-mono">{student.score}</TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">{student.weakDimension}</TableCell>
                  <TableCell className="font-medium text-[var(--primary-strong)]">{student.project}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="h-1.5 w-24" />
                      <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={student.risk === "高风险" ? "danger" : student.risk === "关注" ? "warning" : student.risk === "优秀" ? "success" : "default"}>
                      {student.risk}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-[var(--primary)] hover:bg-[var(--primary-softer)]" onClick={() => navigate("evaluation")}>
                      查看评价
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function TeacherCurriculumView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [query, setQuery] = React.useState("")
  const filtered = CHAPTER_MAPPINGS.filter((chapter) => `${chapter.title} ${chapter.module} ${getProjectById(chapter.primary)?.title ?? ""}`.toLowerCase().includes(query.toLowerCase()))
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newProjectName, setNewProjectName] = React.useState("")
  const [newProjectIntro, setNewProjectIntro] = React.useState("")
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null)
  const saveProject = () => {
    const title = newProjectName.trim()
    const intro = newProjectIntro.trim() || "教师新增的课程项目，用于课堂讨论与方案设计。"
    if (!title) return
    update((current) => {
      const existing = editingProjectId ? current.localProjects.find((project) => project.id === editingProjectId) : undefined
      const nextProject: Project = existing
        ? { ...existing, title, intro }
        : { id: `local-${Date.now()}`, title, intro, level: "基础", dims: ["实验"], styles: ["practice", "visual"], targets: ["application", "innovation"], ability: "从问题定义到实验验证，形成可复核的项目证据。" }
      return { ...current, localProjects: existing ? current.localProjects.map((project) => project.id === existing.id ? nextProject : project) : [...current.localProjects, nextProject] }
    })
    setDialogOpen(false)
    setNewProjectName("")
    setNewProjectIntro("")
    setEditingProjectId(null)
  }
  const openEdit = (project: Project) => {
    setEditingProjectId(project.id)
    setNewProjectName(project.title)
    setNewProjectIntro(project.intro)
    setDialogOpen(true)
  }
  return (
    <div className="space-y-5">
      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center">
          <label className="relative block flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节或项目" className="h-9 pl-9" aria-label="搜索章节或项目" />
          </label>
          <Button onClick={() => { setEditingProjectId(null); setNewProjectName(""); setNewProjectIntro(""); setDialogOpen(true) }} className="h-9 bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
            <Plus className="size-4" />新增项目
          </Button>
        </CardContent>
      </Card>

      {state.localProjects.length > 0 && (
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-6 pb-4 pt-5">
            <CardTitle className="text-[15px] font-semibold tracking-[-0.01em]">项目库</CardTitle>
            <CardDescription className="mt-1 text-xs">新增与编辑只影响当前账号的学习记录。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-6 pb-6 pt-4">
            {state.localProjects.map((project) => (
              <div key={project.id} className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]/30 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{project.title}</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">{project.intro}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(project)}>
                  <Pencil className="size-3.5" />编辑
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--primary-softer)]/40">
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">章节</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">核心知识</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">主项目</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">能力路径</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">成果证据</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((chapter) => (
                <TableRow key={chapter.no} className="hover:bg-[var(--primary-softer)]/30">
                  <TableCell>
                    <p className="font-semibold">{chapter.no}. {chapter.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{chapter.volume} · {chapter.module}</p>
                  </TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal leading-5 text-[var(--foreground-soft)]">{chapter.concepts.join("、")}</TableCell>
                  <TableCell className="max-w-[230px] whitespace-normal font-medium text-[var(--primary-strong)]">{getProjectById(chapter.primary)?.title}</TableCell>
                  <TableCell className="max-w-[240px] whitespace-normal leading-5 text-[var(--muted-foreground)]">{chapter.ability}</TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal leading-5 text-[var(--muted-foreground)]">{chapter.output}</TableCell>
                  <TableCell>
                    <StatusBadge tone={chapter.status === "成熟案例" ? "success" : chapter.status === "重点建设" ? "warning" : "default"}>{chapter.status}</StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProjectId ? "编辑项目" : "新增项目"}</DialogTitle>
            <DialogDescription>保存到项目库，不会影响其他课程内容。</DialogDescription>
          </DialogHeader>
          <label className="space-y-1.5 text-sm font-medium text-[var(--foreground-soft)]">
            项目名称
            <Input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="例如：光伏组件热效率优化" />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-[var(--foreground-soft)]">
            项目简介
            <Textarea value={newProjectIntro} onChange={(event) => setNewProjectIntro(event.target.value)} rows={3} placeholder="说明项目要解决的物理问题和成果证据。" />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={saveProject} disabled={!newProjectName.trim()} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
              <Save className="size-4" />保存项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReviewFields({ studentName, initialScore, initialReason, onScoreChange, onReasonChange }: { studentName: string; initialScore: string; initialReason: string; onScoreChange: (v: string) => void; onReasonChange: (v: string) => void }) {
  const [scoreInput, setScoreInput] = React.useState<string>(initialScore)
  const [reasonInput, setReasonInput] = React.useState<string>(initialReason)
  const parsedScore = Number(scoreInput)
  const clampedScore = Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, Math.round(parsedScore))) : null
  // Notify parent of latest values via callback ref
  React.useEffect(() => { onScoreChange(scoreInput); onReasonChange(reasonInput) }, [scoreInput, reasonInput, onScoreChange, onReasonChange])
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium">教师复核分</span>
        <Input aria-label={studentName + " 复核分"} type="number" inputMode="numeric" min={0} max={100} step={1} value={scoreInput} onChange={(event) => setScoreInput(event.target.value)} placeholder="0–100" />
        {clampedScore !== null && clampedScore !== parsedScore && (
          <p role="alert" className="text-xs text-amber-700">已自动夹紧到 {clampedScore}（输入越出 0–100）。</p>
        )}
        {clampedScore !== null && (
          <div className="mt-2 space-y-1">
            <Progress value={clampedScore} className="h-2" aria-hidden="true" />
            <p className="flex justify-between text-[10px] text-[var(--muted-foreground)]" aria-hidden="true"><span>0</span><span>50</span><span>100</span></p>
          </div>
        )}
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">复核理由</span>
        <Textarea aria-label={studentName + " 复核理由"} value={reasonInput} onChange={(event) => setReasonInput(event.target.value)} rows={5} placeholder="写出对 AI 建议分的判断依据，例如：考虑……" />
      </label>
    </>
  )
}

function TeacherEvaluationView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [filterRisk, setFilterRisk] = React.useState<string>("全部")
  const [activeStudent, setActiveStudent] = React.useState<string | null>(null)
  const [scoreInput, setScoreInput] = React.useState<string>("")
  const [reasonInput, setReasonInput] = React.useState<string>("")
  const [savedFlash, setSavedFlash] = React.useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = React.useState<Set<string>>(new Set())
  const [batchOpen, setBatchOpen] = React.useState(false)
  const [batchScore, setBatchScore] = React.useState<string>("")
  const [batchReason, setBatchReason] = React.useState<string>("")
  const [batchSaved, setBatchSaved] = React.useState(false)
  const filteredStudents = React.useMemo(() => DEMO_STUDENTS.filter((student) => filterRisk === "全部" || student.risk === filterRisk), [filterRisk])

  const toggleSelectStudent = (name: string) => {
    setSelectedStudents((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) setSelectedStudents(new Set())
    else setSelectedStudents(new Set(filteredStudents.map((student) => student.name)))
  }

  const parsedBatchScore = Number(batchScore)
  const clampedBatchScore = Number.isFinite(parsedBatchScore) ? Math.max(0, Math.min(100, Math.round(parsedBatchScore))) : null

  const applyBatchReview = () => {
    if (selectedStudents.size === 0 || clampedBatchScore === null) return
    const now = new Date().toISOString()
    const reason = batchReason.trim() || "教师批量复核（保留 AI 建议作为参考）"
    update((current) => {
      const nextReviews = { ...current.evaluationReviews }
      selectedStudents.forEach((name) => {
        nextReviews[name] = { score: clampedBatchScore, reason, updatedAt: now }
      })
      return { ...current, evaluationReviews: nextReviews }
    })
    setBatchSaved(true)
    setBatchScore("")
    setBatchReason("")
    window.setTimeout(() => {
      setBatchSaved(false)
      setBatchOpen(false)
      setSelectedStudents(new Set())
    }, 1400)
  }
  const activeStudentData = activeStudent ? DEMO_STUDENTS.find((s) => s.name === activeStudent) : undefined
  const activeSuggestion = React.useMemo(() => {
    if (!activeStudentData) return 0
    const idx = DEMO_STUDENTS.findIndex((s) => s.name === activeStudent)
    return Math.round((activeStudentData.score + 68 + idx * 3 + 64 + idx * 4 + 72 + idx * 2) / 4)
  }, [activeStudentData, activeStudent])
  const parsedScore = Number(scoreInput)
  const clampedScore = Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, Math.round(parsedScore))) : null
  const saveReview = () => {
    if (!activeStudent || clampedScore === null) return
    const review: EvaluationReview = { score: clampedScore, reason: reasonInput.trim(), updatedAt: new Date().toISOString() }
    update((current) => ({ ...current, evaluationReviews: { ...current.evaluationReviews, [activeStudent]: review } }))
    setSavedFlash(activeStudent)
    window.setTimeout(() => setSavedFlash((current) => (current === activeStudent ? null : current)), 3000)
  }
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-4 text-sm leading-6 text-[var(--primary-strong)]">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-[var(--primary)]">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </div>
        <p>评价中心保留教师复核权。每张学生卡显示 AI 建议分；点击复核进入侧栏，在 0–100 进度条上拖动或输入复核分，写下复核理由后保存。</p>
      </div>
      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">筛选复核对象</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">按风险状态过滤需要优先复核的学生。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="h-9 w-full md:w-44" aria-label="按风险筛选"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部状态</SelectItem>
                <SelectItem value="高风险">高风险</SelectItem>
                <SelectItem value="关注">关注</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="优秀">优秀</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSelectAll} aria-label="全选/取消全选">
              {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? "取消全选" : "全选"}
            </Button>
            <Button
              size="sm"
              className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]"
              disabled={selectedStudents.size === 0}
              onClick={() => setBatchOpen(true)}
              aria-label={selectedStudents.size > 0 ? `批量复核 ${selectedStudents.size} 人` : "请先勾选学生"}
            >
              <ListChecks className="size-4" />批量复核
              {selectedStudents.size > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                  {selectedStudents.size}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredStudents.map((student, index) => {
          const suggestion = Math.round((student.score + 68 + index * 3 + 64 + index * 4 + 72 + index * 2) / 4)
          const review = state.evaluationReviews[student.name]
          const finalScore = review?.score ?? suggestion
          return (
            <Card key={student.name} className={cn("flex flex-col rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]", review && "ring-1 ring-emerald-200/70")}>
              <CardHeader className="border-b border-[var(--border)] px-5 pb-3 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-[12px] font-semibold text-white">
                        {student.name.slice(0, 1)}
                      </span>
                      {student.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">薄弱维度：{student.weakDimension}</CardDescription>
                  </div>
                  <StatusBadge tone={student.risk === "高风险" ? "danger" : student.risk === "关注" ? "warning" : student.risk === "优秀" ? "success" : "default"}>
                    {student.risk}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5 pt-4">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { label: "知识", value: Math.min(95, student.score + 3) },
                    { label: "应用", value: 68 + index * 3 },
                    { label: "创新", value: 64 + index * 4 },
                    { label: "协作", value: 72 + index * 2 },
                  ].map((dim) => (
                    <div key={dim.label} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--primary-softer)]/40 px-2 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{dim.label}</p>
                      <strong className="mt-1 block font-mono text-[14px] tabular-nums text-[var(--foreground)]">{dim.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">最终分 / AI 建议</p>
                    <p className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-[var(--primary)]">{finalScore}</span>
                      <span className="font-mono text-sm text-[var(--muted-foreground)]">/ {suggestion}</span>
                    </p>
                  </div>
                  {review?.updatedAt && (
                    <p className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                      已复核 · {new Date(review.updatedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {review?.reason && (
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--primary-softer)]/40 p-2.5 text-xs leading-5 text-[var(--foreground-soft)] line-clamp-2">
                    「{review.reason}」
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t border-[var(--border)] bg-[var(--primary-softer)]/30 px-5 py-3">
                <Button size="sm" variant="outline" className="ml-auto border-[var(--primary)]/30 text-[var(--primary-strong)] hover:bg-[var(--primary-softer)]" onClick={() => setActiveStudent(student.name)}>
                  <Pencil className="size-3.5" />复核
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      <Sheet open={activeStudent !== null} onOpenChange={(open) => !open && setActiveStudent(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--primary-softer)] to-white px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-[12px] font-semibold text-white">
                {activeStudentData?.name.slice(0, 1) ?? ""}
              </span>
              {activeStudentData?.name ?? ""} 复核
            </SheetTitle>
            <SheetDescription>在 0–100 区间填写复核分。系统会用进度条高亮越界值。</SheetDescription>
          </SheetHeader>
          <div className="ds-scrollable flex-1 space-y-5 overflow-y-auto p-5">
            <div className="rounded-[var(--radius-md)] border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary-softer)] to-white p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">AI 建议分</p>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">仅辅助</span>
              </div>
              <p className="mt-1 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[var(--primary)]">{activeSuggestion}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">基于前测成绩、知识理解、专业应用、创新实践、团队协作四维度聚合，仅作为辅助判断。</p>
            </div>
            {activeStudentData &&
              (() => {
                const idx = DEMO_STUDENTS.findIndex((s) => s.name === activeStudentData.name)
                const sug = Math.round((activeStudentData.score + 68 + idx * 3 + 64 + idx * 4 + 72 + idx * 2) / 4)
                const initialReview = state.evaluationReviews[activeStudentData.name]
                const initialScore = String(initialReview?.score ?? sug)
                const initialReason = initialReview?.reason ?? ""
                return (
                  <ReviewFields
                    key={activeStudentData.name}
                    studentName={activeStudentData.name}
                    initialScore={initialScore}
                    initialReason={initialReason}
                    onScoreChange={setScoreInput}
                    onReasonChange={setReasonInput}
                  />
                )
              })()}
          </div>
          <SheetFooter className="flex flex-col gap-2 border-t border-[var(--border)] bg-white p-4 sm:flex-row">
            {savedFlash === activeStudent && (
              <div role="status" aria-live="polite" className="mr-auto flex items-center gap-2 self-center rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                <CheckCircle2 className="size-3.5" />已保存 {activeStudentData?.name} 的复核结果
              </div>
            )}
            <Button variant="outline" onClick={() => setActiveStudent(null)}>取消</Button>
            <Button onClick={saveReview} disabled={clampedScore === null} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
              <Save className="size-4" />保存复核
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
function TeacherInsightsView() {
  const [planIndex, setPlanIndex] = React.useState(0)
  const [feedback, setFeedback] = React.useState("")
  const plan = TEACHING_PLANS[planIndex]
  return (
    <div className="space-y-5">
      <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-[var(--border)] px-6 pb-4 pt-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <Lightbulb className="size-4 text-amber-600" aria-hidden="true" />
              本周教学调控方案
            </CardTitle>
            <CardDescription className="mt-1 text-xs">基于当前教学班信号生成，教师可编辑和采纳。</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPlanIndex((index) => (index + 1) % TEACHING_PLANS.length)}>
            <RotateCcw className="size-4" />刷新建议
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-5">
          <div className="rounded-[var(--radius-md)] border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary-softer)] to-white p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              AI 调控建议 · 方案 {planIndex + 1}
            </div>
            <p className="mt-2 text-[16px] font-semibold text-[var(--foreground)]">{plan.title}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{plan.content}</p>
          </div>
          <div className="mt-5 space-y-2">
            <label className="text-[13px] font-medium text-[var(--foreground-soft)]">
              教师补充备注
              <Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} placeholder="记录你准备在课堂上验证的调整。" className="mt-2" />
            </label>
          </div>
          <Button className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary-strong)]" onClick={() => setFeedback((value) => value.trim() ? value : "已采纳本周教学调控方案，下一次课后复盘。")}>
            <Save className="size-4" />保存调控记录
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-6 pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <Activity className="size-4 text-[var(--primary)]" aria-hidden="true" />
              教学质量诊断
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-5">
            {[
              { tone: "emerald" as const, label: "优势", text: "项目任务与课程知识关联清晰，课中互动记录较完整。" },
              { tone: "amber" as const, label: "改进", text: "光学模块高阶任务偏少，可补充智能对焦系统开放性设计。" },
              { tone: "rose" as const, label: "风险", text: "部分作业存在 AI 生成痕迹，需要增加口头答辩和过程证据核验。" },
            ].map((item) => {
              const toneStyles = {
                emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
                amber: "border-amber-200 bg-amber-50/70 text-amber-900",
                rose: "border-rose-200 bg-rose-50/70 text-rose-900",
              } as const
              const accentStyles = {
                emerald: "bg-emerald-100 text-emerald-700",
                amber: "bg-amber-100 text-amber-700",
                rose: "bg-rose-100 text-rose-700",
              } as const
              return (
                <div key={item.label} className={cn("rounded-[var(--radius-md)] border p-4", toneStyles[item.tone])}>
                  <div className="flex items-center gap-2">
                    <span className={cn("grid size-6 place-items-center rounded-full text-[10px] font-semibold uppercase tracking-[0.14em]", accentStyles[item.tone])}>
                      {item.label}
                    </span>
                    <p className="text-[13px] font-semibold">{item.label}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)] opacity-90">{item.text}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)] px-6 pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
              <ShieldCheck className="size-4 text-[var(--success)]" aria-hidden="true" />
              AI 使用边界
            </CardTitle>
            <CardDescription className="mt-1 text-xs">教师与学生在使用 AI 工具时共同遵守。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-5 text-sm leading-6 text-[var(--foreground-soft)]">
            {[
              "不上传含个人敏感信息、未公开试卷和涉密资料。",
              "AI 反馈必须可追溯、可解释，并由教师复核。",
              "项目作品需保留草图、实验记录和版本迭代等原创证据。",
              "学生使用 AI 时应声明用途，并进行事实核验与逻辑反思。",
            ].map((rule, index) => (
              <div key={rule} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--primary-softer)]/30 p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">{index + 1}</span>
                <span className="leading-6">{rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Shell({ role, state, update, onLogout, onReset }: { role: UserRole; state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; onLogout: () => void; onReset: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const view = viewFromPath(pathname, role)
  const navItems = role === "student" ? studentNavigation : teacherNavigation
  const undo = useUndoSnapshot()
  const navigate = (next: AppView) => { router.push(`/${role}/${next}`) }
  const meta = role === "teacher" && view === "curriculum" ? teacherCurriculumMeta : pageMeta[view]
  const [showShortcutsHelp, setShowShortcutsHelp] = React.useState(false)

  const handlePaletteCommand = React.useCallback(
    (commandId: string) => {
      if (commandId === "logout") onLogout()
      else if (commandId === "reset") onReset()
      else if (commandId === "open-shortcuts-help") setShowShortcutsHelp(true)
    },
    [onLogout, onReset],
  )

  const { open: paletteOpen, setOpen: setPaletteOpen, shortcuts: paletteShortcuts } = useShortcuts({
    role,
    navigate: (route) => router.push(route),
    onCommand: handlePaletteCommand,
    onShowHelp: () => setShowShortcutsHelp(true),
  })
  const renderView = () => { if (role === "student") { if (view === "overview") return <OverviewView state={state} navigate={navigate as (view: StudentView) => void} />; if (view === "diagnosis") return <DiagnosisView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "curriculum") return <CurriculumView state={state} navigate={navigate} />; if (view === "projects") return <ProjectsView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "tasks") return <TasksView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "assistant") return <AssistantView state={state} update={update} />; if (view === "lab") return <LabView state={state} update={update} />; return <ReportView state={state} navigate={navigate as (view: StudentView) => void} /> } if (view === "dashboard") return <TeacherDashboard navigate={navigate as (view: TeacherView) => void} />; if (view === "class") return <ClassView navigate={navigate as (view: TeacherView) => void} />; if (view === "curriculum") return <TeacherCurriculumView state={state} update={update} />; if (view === "evaluation") return <TeacherEvaluationView state={state} update={update} />; return <TeacherInsightsView /> }
  const progressBadge = React.useMemo(() => {
    if (role !== "student") return null
    return calculateTaskProgress(state.taskChecks).percentage
  }, [role, state.taskChecks])

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        collapsible="offcanvas"
        data-sidebar
        className="border-r-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)]"
      >
        <SidebarHeader className="border-b border-white/10 px-4 py-5">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent className="bg-transparent px-2 py-3 scroll-thin">
          {Array.from(new Set(navItems.map((item) => item.group))).map((group, index) => (
            <SidebarGroup key={group} className={cn("p-0", index > 0 && "mt-5")}>
              <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--sidebar-muted)]">
                {group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {navItems.filter((item) => item.group === group).map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={view === item.id}
                        aria-current={view === item.id ? "page" : undefined}
                        onClick={() => navigate(item.id)}
                        className={cn(
                          "group h-10 rounded-md px-3 text-[13.5px] text-[#c3d9ec] transition-all duration-200 hover:bg-[var(--sidebar-hover)] hover:text-white",
                          "data-[active=true]:bg-[var(--sidebar-active)] data-[active=true]:font-semibold data-[active=true]:text-white",
                          "data-[active=true]:shadow-[inset_3px_0_0_0_#38bdf8]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-[18px] transition-colors",
                            view === item.id ? "text-sky-300" : "text-[var(--sidebar-muted)] group-hover:text-white"
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                        {item.id === "tasks" && role === "student" && (progressBadge ?? 0) > 0 && (
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight",
                              view === item.id ? "bg-white/15 text-white" : "bg-white/10 text-[var(--sidebar-muted)]"
                            )}
                          >
                            {progressBadge}%
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarSeparator className="bg-white/10" />
        <SidebarFooter className="bg-transparent p-3">
          <div className="mb-3 flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
            <Avatar className="size-9 shrink-0 bg-sky-100 text-[var(--primary-strong)] ring-2 ring-white/15">
              <AvatarFallback className="text-sm font-semibold">{role === "student" ? "学" : "师"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{role === "student" ? state.student?.name ?? "陈思远" : "顿老师"}</p>
              <p className="truncate text-[11px] text-[var(--sidebar-muted)]">{role === "student" ? "学生 · 物理学 2601 班" : "教师 · 物理学教研组"}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-[var(--sidebar-muted)] hover:bg-white/10 hover:text-white" onClick={onLogout}>
            <LogOut className="size-4" />
            退出登录
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-[var(--sidebar-muted)] hover:bg-rose-500/20 hover:text-rose-100">
                <RotateCcw className="size-4" />
                重置学习记录
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认重置学习记录？</AlertDialogTitle>
                <AlertDialogDescription>将清空诊断、项目、任务、问答、实验和评价记录，账号登录状态不会被删除。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-rose-600 hover:bg-rose-700">确认重置</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-transparent">
        <header className="sticky top-0 z-20 flex flex-col border-b border-[var(--border)] bg-white/85 shadow-[0_1px_0_rgba(15,30,60,0.04)] backdrop-blur-xl">
          <div className="flex h-[60px] items-center justify-between gap-3 px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="-ml-1 size-9 md:hidden" aria-label="打开导航侧栏" />
              <div className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white shadow-sm md:flex">
                <span className="text-[13px] font-semibold tracking-tight">物</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">{meta.eyebrow}</p>
                <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--foreground)]">{meta.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800 sm:flex">
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                系统运行中
              </div>
              <Avatar className="size-9 bg-sky-100 text-[var(--primary-strong)] ring-2 ring-white">
                <AvatarFallback className="text-sm font-semibold">{role === "student" ? "学" : "师"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex h-9 items-center gap-3 overflow-x-auto border-t border-[var(--border)] bg-[var(--primary-softer)]/70 px-4 text-[11px] text-[var(--primary-strong)] md:px-7" aria-label="当前上下文">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="inline-block size-1 rounded-full bg-[var(--primary)]" aria-hidden="true" />
              长江大学文理学院
            </span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
            <span className="text-[var(--muted-foreground)]">物理学 2601 班</span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
            <span className="text-[var(--muted-foreground)]">{role === "student" ? state.student?.name ?? "陈思远" : "顿老师"}</span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
            <span className="text-[var(--muted-foreground)]">上学期力学模块</span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
            <span className="text-[var(--muted-foreground)]">{role === "student" ? "学生工作台" : "教学工作台"}</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 pb-10 pt-6 md:px-7 md:pt-8">
          {undo.lastUndo && (
            <UndoBanner
              meta={undo.lastUndo}
              onRestore={() => {
                const raw = typeof window !== "undefined" ? window.localStorage.getItem(UNDO_KEY) : null
                if (!raw) return
                try {
                  const restored = JSON.parse(raw) as AppState
                  update(() => restored)
                  undo.dismiss()
                } catch {
                  undo.dismiss()
                }
              }}
              onDismiss={undo.dismiss}
            />
          )}
          <PageHeader view={view} />
          {renderView()}
        </main>
      </SidebarInset>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        role={role}
        shortcuts={paletteShortcuts}
        onSelect={(binding) => {
          if (binding.action.type === "navigate") {
            router.push(`/${binding.action.role}/${binding.action.view}`)
          } else if (binding.action.type === "command") {
            handlePaletteCommand(binding.action.id)
          }
        }}
      />

      <Dialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-[var(--primary-softer)] text-[var(--primary)]">
                <ListChecks className="size-4" aria-hidden="true" />
              </span>
              键盘快捷键
            </DialogTitle>
            <DialogDescription>
              按下 <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">g</kbd> 再按下表字母可快速跳转；按 <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd> / <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd> 唤起命令面板；按 <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">?</kbd> 打开本表。
            </DialogDescription>
          </DialogHeader>
          <div className="ds-scrollable max-h-[420px] overflow-y-auto px-1 pb-1">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  <th className="border-b border-[var(--border)] py-2 pr-3 font-semibold">快捷键</th>
                  <th className="border-b border-[var(--border)] py-2 font-semibold">跳转</th>
                </tr>
              </thead>
              <tbody>
                {(role === "student"
                  ? [
                      ["g o", "学习总览"],
                      ["g d", "AI 学情诊断"],
                      ["g c", "章节与知识图谱"],
                      ["g p", "项目匹配"],
                      ["g t", "任务闯关"],
                      ["g a", "AI 助教"],
                      ["g l", "虚拟实验"],
                      ["g r", "学习报告"],
                    ]
                  : [
                      ["g o", "教师驾驶舱"],
                      ["g c", "班级画像"],
                      ["g m", "章节项目矩阵"],
                      ["g e", "评价复核"],
                      ["g i", "教学洞察"],
                    ]
                ).map(([combo, label]) => (
                  <tr key={combo} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--primary-strong)]">
                        {combo}
                      </code>
                    </td>
                    <td className="py-2">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShortcutsHelp(false)}>关闭</Button>
            <Button onClick={() => { setShowShortcutsHelp(false); setPaletteOpen(true) }} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">
              打开命令面板 <ArrowRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default function PhysicsApp() {
  const router = useRouter()
  const pathname = usePathname()
  const { state, update, setState, hydrated } = usePersistedAppState()
  const [session, setSession] = React.useState<{ role: UserRole; displayName: string } | null>(() => getSession())

  const logout = React.useCallback(() => {
    clearSession()
    setSession(null)
    router.push("/login")
  }, [router])

  const reset = React.useCallback(() => {
    clearState()
    const next = createInitialState()
    next.role = session?.role ?? "student"
    const account = accountForRole(next.role)
    if (next.role === "student") next.student = account?.profile as AppState["student"]
    if (next.role === "teacher") next.teacher = account?.profile as AppState["teacher"]
    setState(next)
    saveState(next)
  }, [session, setState])

  const onCommand = React.useCallback(
    (id: string) => {
      if (id === "logout") logout()
      else if (id === "reset") reset()
      else if (id === "open-shortcuts-help") {
        alert("快捷键帮助：\n\n• ⌘K / Ctrl+K 打开命令面板\n• g + o/d/c/p/t/a/l/r 快速跳转\n• ? 查看帮助（当前提示）\n\n更多快捷键请打开命令面板（⌘K）查看。")
      }
    },
    [logout, reset]
  )

  const { open, setOpen, shortcuts: availableShortcuts } = useShortcuts({
    role: session?.role ?? null,
    navigate: (route: string) => router.push(route),
    onCommand,
    onShowHelp: () => onCommand("open-shortcuts-help"),
  })

  React.useEffect(() => {
    if (!hydrated || !session) return
    const account = accountForRole(session.role)
    if (session.role === "student" && !state.student && account?.profile) {
      window.queueMicrotask(() => update({ student: account.profile as AppState["student"] }))
    }
    if (session.role === "teacher" && !state.teacher && account?.profile) {
      window.queueMicrotask(() => update({ teacher: account.profile as AppState["teacher"] }))
    }
  }, [hydrated, session, state.student, state.teacher, update])

  React.useEffect(() => {
    const homePath = `/${session?.role ?? "student"}/${session?.role === "teacher" ? "dashboard" : "overview"}`
    if (session && (pathname === "/" || pathname === "/login")) {
      router.replace(homePath)
    } else if (!session && pathname !== "/login") {
      router.replace("/login")
    }
  }, [pathname, router, session])

  React.useEffect(() => {
    const handler = (event: Event) => {
      const projectId = (event as CustomEvent<string>).detail
      update((current) => ({ ...current, projectId }))
    }
    window.addEventListener("physics:set-project", handler)
    return () => window.removeEventListener("physics:set-project", handler)
  }, [update])

  if (!hydrated)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-full max-w-md space-y-3 px-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    )

  if (!session)
    return (
      <LoginScreen
        onLogin={(role, displayName) => {
          const account = accountForRole(role)
          setSession({ role, displayName })
          update((current) => ({
            ...current,
            role,
            student: role === "student" ? (account?.profile as AppState["student"]) : current.student,
            teacher: role === "teacher" ? (account?.profile as AppState["teacher"]) : current.teacher,
          }))
          router.push(`/${role}/${role === "student" ? "overview" : "dashboard"}`)
        }}
      />
    )

  const activeRole = pathname.startsWith("/teacher") ? "teacher" : pathname.startsWith("/student") ? "student" : session.role
  if (activeRole !== session.role) {
    router.replace(`/${session.role}/${session.role === "student" ? "overview" : "dashboard"}`)
    return null
  }

  const onPaletteSelect = (binding: ShortcutBinding) => {
    if (binding.action.type === "navigate") {
      router.push(`/${binding.action.role}/${binding.action.view}`)
    } else if (binding.action.type === "command") {
      onCommand(binding.action.id)
    }
  }

  return (
    <>
      <Shell role={session.role} state={state} update={update} onLogout={logout} onReset={reset} />
      <CommandPalette open={open} onOpenChange={setOpen} role={session.role} shortcuts={availableShortcuts} onSelect={onPaletteSelect} />
    </>
  )
}
