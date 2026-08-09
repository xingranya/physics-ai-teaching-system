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
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CHAPTER_MAPPINGS, DEMO_STUDENTS, DIAGNOSTIC_DIMENSIONS, KNOWLEDGE_NODES, PROJECTS, QUIZ_QUESTIONS, TASK_TEMPLATES, TEACHING_PLANS, getProjectById } from "@/lib/data"
import { aiReply, calculateChapterMatchScore, calculateTaskProgress, calculateUltrasonicEchoTime, matchProjects, scoreDiagnosis, simulateUltrasonicMeasurement, summarizeEvaluation, toJson, withUtf8Bom } from "@/lib/physics"
import { accountForRole, authenticate, clearState, createInitialState, loadState, saveState } from "@/lib/store"
import type { AppState, ChapterMapping, DiagnosisResult, EvaluationReview, LabRecord, Project, UserRole } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type StudentView = "overview" | "diagnosis" | "curriculum" | "projects" | "tasks" | "assistant" | "lab" | "report"
type TeacherView = "dashboard" | "class" | "curriculum" | "evaluation" | "insights"
type AppView = StudentView | TeacherView

const studentNavigation: Array<{ id: StudentView; label: string; icon: React.ElementType; group?: string }> = [
  { id: "overview", label: "学习总览", icon: LayoutDashboard, group: "学习工作台" },
  { id: "diagnosis", label: "AI 学情诊断", icon: ClipboardCheck },
  { id: "curriculum", label: "章节与知识图谱", icon: Network },
  { id: "projects", label: "项目匹配", icon: Library, group: "项目实践" },
  { id: "tasks", label: "任务闯关", icon: ListChecks },
  { id: "assistant", label: "AI 助教", icon: Bot },
  { id: "lab", label: "虚拟实验", icon: FlaskConical, group: "过程评价" },
  { id: "report", label: "学习报告", icon: FileBarChart },
]

const teacherNavigation: Array<{ id: TeacherView; label: string; icon: React.ElementType; group?: string }> = [
  { id: "dashboard", label: "教师驾驶舱", icon: LayoutDashboard, group: "教学工作台" },
  { id: "class", label: "班级画像", icon: Users },
  { id: "curriculum", label: "章节项目矩阵", icon: Network, group: "课程重构" },
  { id: "evaluation", label: "评价复核", icon: ClipboardCheck, group: "质量治理" },
  { id: "insights", label: "教学洞察", icon: Lightbulb },
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

function viewFromPath(pathname: string, role: UserRole): AppView {
  const segment = pathname.split("/").filter(Boolean).at(-1)
  if (role === "teacher" && segment && ["dashboard", "class", "curriculum", "evaluation", "insights"].includes(segment)) return segment as TeacherView
  if (role === "student" && segment && ["overview", "diagnosis", "curriculum", "projects", "tasks", "assistant", "lab", "report"].includes(segment)) return segment as StudentView
  return role === "student" ? "overview" : "dashboard"
}

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 p-1.5", compact && "size-8")}>
        <Image src="/assets/college-brand.png" alt="长江大学文理学院" width={260} height={60} className="h-auto w-full object-contain" priority />
      </div>
      {!compact && <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">大学物理 AI</p><p className="truncate text-xs text-[var(--sidebar-muted)]">智慧教学系统</p></div>}
    </div>
  )
}

function StatusBadge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const styles = { default: "border-slate-200 bg-slate-50 text-slate-700", success: "border-emerald-200 bg-emerald-50 text-emerald-700", warning: "border-amber-200 bg-amber-50 text-amber-700", danger: "border-rose-200 bg-rose-50 text-rose-700", info: "border-sky-200 bg-sky-50 text-sky-700" }
  return <Badge variant="outline" className={cn("font-medium", styles[tone])}>{children}</Badge>
}

function PageHeader({ view, action }: { view: AppView; action?: React.ReactNode }) {
  const meta = pageMeta[view]
  return <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">{meta.eyebrow}</p><h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[28px]">{meta.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{meta.description}</p></div>{action}</div>
}

function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>{description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>}</div>{action}</div>
}

function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }: { label: string; value: string; hint: string; icon: React.ElementType; tone?: "blue" | "green" | "amber" | "red" }) {
  const toneStyles = { blue: "bg-sky-50 text-sky-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700" }
  return <Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--muted-foreground)]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{value}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p></div><div className={cn("grid size-9 place-items-center rounded-md", toneStyles[tone])}><Icon className="size-4" /></div></div></CardContent></Card>
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] bg-white/50 p-8 text-center"><div className="mb-3 grid size-10 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"><FileText className="size-5" /></div><p className="font-medium">{title}</p><p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
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

  return <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-900 px-4 py-8 md:px-8" style={{ backgroundImage: "url('/assets/teaching-login-bg.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}>
    <div className="absolute inset-0 bg-[#0c4a6e]/55" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,74,110,.82),rgba(12,74,110,.35)_55%,rgba(12,74,110,.48))]" />
    <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_420px] lg:items-center">
      <section className="hidden text-white lg:block"><div className="mb-10 max-w-xl"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/85">长江大学文理学院</p><h1 className="text-5xl font-semibold leading-[1.1] tracking-[-0.04em]">大学物理<br /><span className="text-sky-100">AI 智慧教学系统</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-sky-50/85">围绕课程学习、项目实践和过程评价，建立从诊断到反馈的完整学习路径。</p></div><div className="grid max-w-xl grid-cols-3 gap-3"><div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><Network className="mb-5 size-5 text-sky-100" /><p className="text-sm font-medium">知识图谱</p><p className="mt-1 text-xs leading-5 text-sky-50/70">按章节连接概念与项目</p></div><div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><FlaskConical className="mb-5 size-5 text-sky-100" /><p className="text-sm font-medium">虚拟实验</p><p className="mt-1 text-xs leading-5 text-sky-50/70">调节参数查看测量变化</p></div><div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><FileBarChart className="mb-5 size-5 text-sky-100" /><p className="text-sm font-medium">过程评价</p><p className="mt-1 text-xs leading-5 text-sky-50/70">保留任务和实验证据</p></div></div></section>
      <Card className="overflow-hidden rounded-xl border-white/40 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"><CardHeader className="space-y-5 p-7 pb-4"><div><Image src="/assets/college-brand.png" alt="长江大学文理学院" width={260} height={60} className="h-auto w-[190px] object-contain" priority /></div><div><CardTitle className="text-xl tracking-[-0.02em]">欢迎登录</CardTitle><CardDescription className="mt-2 leading-6">请输入账号和密码，进入对应教学工作台。</CardDescription></div></CardHeader><CardContent className="p-7 pt-3"><form className="space-y-4" onSubmit={submit}><label className="block space-y-2 text-sm font-medium">账号<Input aria-label="账号" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入账号" required /></label><label className="block space-y-2 text-sm font-medium">密码<div className="relative"><Input aria-label="密码" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" className="pr-10" required /> <button type="button" aria-label={showPassword ? "隐藏密码" : "显示密码"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>{error && <div role="alert" className="flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-700"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</div>}<Button type="submit" className="h-10 w-full bg-[var(--primary)] hover:bg-[var(--primary-strong)]" disabled={loading}>{loading ? <><span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />正在进入...</> : <>进入教学工作台<ArrowRight className="size-4" /></>}</Button></form></CardContent><CardFooter className="border-t border-[var(--border)] bg-slate-50/80 px-7 py-4 text-xs leading-5 text-[var(--muted-foreground)]"><ShieldCheck className="mr-2 size-4 shrink-0 text-[var(--success)]" />登录后可继续上次的学习进度。</CardFooter></Card>
    </div>
  </main>
}

function OverviewView({ state, navigate }: { state: AppState; navigate: (view: StudentView) => void }) {
  const progress = calculateTaskProgress(state.taskChecks).percentage
  const project = getStateProject(state, state.projectId)
  const diagnosisScore = state.diagnosis?.score ?? 0
  const reportScore = state.evaluation?.final
  const steps = [{ label: "完成 AI 学情诊断", done: Boolean(state.diagnosis), meta: state.diagnosis ? `前测 ${state.diagnosis.score} 分` : "完成 8 道基础题" }, { label: "选择一个真实项目", done: Boolean(project), meta: project?.title ?? "从匹配中心选择项目" }, { label: "完成五阶任务", done: progress > 0, meta: `已完成 ${progress}%` }, { label: "留下实验与问答证据", done: state.labRecords.length > 0 || state.chat.length > 0, meta: `${state.labRecords.length} 次实验 / ${state.chat.length} 条问答` }, { label: "生成学习报告", done: Boolean(state.evaluation), meta: reportScore ? `综合 ${reportScore} 分` : "汇总过程证据" }]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden rounded-lg border-0 bg-[var(--sidebar)] text-white shadow-none">
          <CardContent className="relative p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/75">今天的学习焦点</p>
            <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight md:text-3xl">把一个物理问题，推进到下一条可验证证据。</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-sky-50/75">先诊断，再匹配；先留下过程，再生成评价。每一步都能回到课程章节和项目目标。</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button className="bg-white text-[var(--primary-strong)] hover:bg-sky-50" onClick={() => navigate(state.diagnosis ? "projects" : "diagnosis")}>
                {state.diagnosis ? "查看项目匹配" : "开始学情诊断"}<ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("curriculum")}>浏览课程结构</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-[var(--border)] shadow-none">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div><CardTitle className="text-base">学习路径</CardTitle><CardDescription className="mt-1">当前学习记录的完成情况</CardDescription></div>
              <StatusBadge tone={progress >= 60 ? "success" : "info"}>{progress}%</StatusBadge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <Progress value={Math.max(progress, diagnosisScore ? 20 : 0)} className="h-2" />
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => <button key={step.label} className="flex w-full items-start gap-3 text-left" onClick={() => navigate(index === 0 ? "diagnosis" : index === 1 ? "projects" : index === 2 ? "tasks" : index === 3 ? "lab" : "report")}>
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[11px]", step.done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>{step.done ? <Check className="size-3" /> : index + 1}</span>
                <span className="min-w-0"><span className="block text-sm font-medium">{step.label}</span><span className="mt-0.5 block truncate text-xs text-[var(--muted-foreground)]">{step.meta}</span></span>
                <ChevronRight className="ml-auto mt-1 size-4 text-slate-300" />
              </button>)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="学情诊断" value={state.diagnosis ? `${state.diagnosis.score} 分` : "未完成"} hint={state.diagnosis?.level ?? "知识基础与学习特征"} icon={ClipboardCheck} tone="blue" />
        <MetricCard label="当前项目" value={project ? project.title.slice(0, 9) : "未选择"} hint={project?.level ? `${project.level} 难度` : "来自项目案例库"} icon={Target} tone="green" />
        <MetricCard label="任务进度" value={`${progress}%`} hint="五阶项目闯关" icon={ListChecks} tone="amber" />
        <MetricCard label="综合评价" value={reportScore ? `${reportScore} 分` : "待生成"} hint={state.evaluation?.grade ?? "四阶能力增值评价"} icon={FileBarChart} tone="red" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-lg border-[var(--border)] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-base">四阶能力目标</CardTitle><CardDescription className="mt-1">每个项目都应留下对应证据</CardDescription></CardHeader>
          <CardContent className="grid gap-3 p-6 pt-3 sm:grid-cols-2">
            {[{ title: "知识理解", text: "识别概念，解释现象，建立联系。", color: "#0369a1" }, { title: "专业应用", text: "建模计算，实验测量，迁移解决问题。", color: "#2a8a78" }, { title: "创新实践", text: "设计方案，优化系统，形成作品。", color: "#c47a2c" }, { title: "团队协作", text: "表达论证，分工协同，反思改进。", color: "#6c58a5" }].map((item) => <div key={item.title} className="rounded-md bg-slate-50 p-4"><div className="mb-3 size-2 rounded-full" style={{ backgroundColor: item.color }} /><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.text}</p></div>)}
          </CardContent>
        </Card>
        <Card className="rounded-lg border-[var(--border)] shadow-none">
          <CardHeader className="p-6 pb-3"><CardTitle className="text-base">开始位置</CardTitle><CardDescription className="mt-1">根据当前状态选择一个入口</CardDescription></CardHeader>
          <CardContent className="space-y-2 p-6 pt-3">
            {[{ label: "补齐基础画像", desc: "前测还未完成", view: "diagnosis" as StudentView, icon: ClipboardCheck }, { label: "寻找匹配项目", desc: "查看章节与案例关联", view: "projects" as StudentView, icon: Library }, { label: "运行一次实验", desc: "记录可复核的数据", view: "lab" as StudentView, icon: FlaskConical }].map((item) => <button key={item.label} onClick={() => navigate(item.view)} className="flex w-full items-center gap-3 rounded-md border border-transparent p-3 text-left transition-colors hover:border-[var(--border)] hover:bg-slate-50"><span className="grid size-8 place-items-center rounded-md bg-sky-50 text-[var(--primary)]"><item.icon className="size-4" /></span><span className="min-w-0"><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-[var(--muted-foreground)]">{item.desc}</span></span><ChevronRight className="ml-auto size-4 text-slate-300" /></button>)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DiagnosisView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [result, setResult] = React.useState<DiagnosisResult | undefined>(state.diagnosis)
  const [notice, setNotice] = React.useState("")
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const next = (Object.keys(answers).length === QUIZ_QUESTIONS.length ? answers : QUIZ_QUESTIONS.reduce((acc, item) => ({ ...acc, [item.id]: answers[item.id] ?? -1 }), answers)); if (Object.values(next).some((answer) => answer < 0)) { setNotice("请先完成全部题目，再生成诊断结果。"); return } const diagnosis = scoreDiagnosis(next); setResult(diagnosis); update((current) => ({ ...current, diagnosis, projectId: null, taskChecks: {}, evaluation: undefined })); setNotice("诊断已保存，可以前往项目匹配中心。") }
  return <div className="space-y-6"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="border-b border-[var(--border)] p-6"><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-base">基础知识前测</CardTitle><CardDescription className="mt-1">每题只有一个最佳答案，结果用于调整项目推荐顺序。</CardDescription></div><StatusBadge tone="info">{Object.keys(answers).length}/{QUIZ_QUESTIONS.length} 已作答</StatusBadge></div></CardHeader><CardContent className="p-6"><form onSubmit={submit} className="space-y-6">{QUIZ_QUESTIONS.map((question, index) => <fieldset key={question.id} className="space-y-3"><legend className="text-sm font-medium leading-6"><span className="mr-2 inline-flex size-6 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-600">{index + 1}</span>{question.question}</legend><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors", answers[question.id] === optionIndex ? "border-sky-300 bg-sky-50 text-[var(--primary-strong)]" : "border-[var(--border)] hover:bg-slate-50")}><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className="size-4 accent-[var(--primary)]" />{option}</label>)}</div></fieldset>)}{notice && <p className="rounded-md bg-sky-50 p-3 text-sm text-sky-800">{notice}</p>}<Button type="submit" className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">生成 AI 学情画像<ArrowRight className="size-4" /></Button></form></CardContent></Card>{result && <Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><div className="flex items-center justify-between"><div><CardTitle className="text-base">{state.student?.name ?? "陈思远"}的诊断结果</CardTitle><CardDescription className="mt-1">{result.level}，系统将用薄弱维度参与项目排序。</CardDescription></div><div className="text-right"><p className="text-3xl font-semibold text-[var(--primary)]">{result.score}</p><p className="text-xs text-[var(--muted-foreground)]">前测得分</p></div></div></CardHeader><CardContent className="grid gap-3 p-6 pt-3 sm:grid-cols-2">{DIAGNOSTIC_DIMENSIONS.map((dimension) => <div key={dimension} className="rounded-md bg-slate-50 p-3"><div className="mb-2 flex justify-between text-sm"><span>{dimension}</span><strong>{result.dimensions[dimension] ?? 0}</strong></div><Progress value={result.dimensions[dimension] ?? 0} className="h-2" /></div>)}</CardContent><CardFooter className="flex flex-wrap gap-2 border-t border-[var(--border)] px-6 py-4"><Button onClick={() => navigate("projects")} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">查看项目匹配</Button><Button variant="outline" onClick={() => navigate("curriculum")}>回到课程结构</Button></CardFooter></Card>}</div>
}

function CurriculumView({ state, navigate, teacher = false }: { state: AppState; navigate: (view: AppView) => void; teacher?: boolean }) {
  const [query, setQuery] = React.useState("")
  const [module, setModule] = React.useState("全部")
  const [selectedNode, setSelectedNode] = React.useState("core")
  const [sortPersonal, setSortPersonal] = React.useState(false)
  const node = KNOWLEDGE_NODES.find((item) => item.id === selectedNode) ?? KNOWLEDGE_NODES[0]
  const filtered = CHAPTER_MAPPINGS.filter((chapter) => { const haystack = [chapter.title, chapter.module, chapter.concepts.join(" "), getProjectById(chapter.primary)?.title ?? ""].join(" "); return (!query || haystack.toLowerCase().includes(query.toLowerCase())) && (module === "全部" || chapter.module === module) }).sort((a, b) => sortPersonal ? calculateChapterMatchScore(b, state.diagnosis, state.student) - calculateChapterMatchScore(a, state.diagnosis, state.student) : a.no - b.no)
  return <div className="space-y-6"><Tabs defaultValue="chapters"><TabsList className="w-full justify-start overflow-x-auto rounded-md border border-[var(--border)] bg-white p-1"><TabsTrigger value="chapters">章节项目矩阵</TabsTrigger><TabsTrigger value="graph">知识图谱</TabsTrigger></TabsList><TabsContent value="chapters" className="mt-5 space-y-4"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_auto]"><label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索章节、概念或项目" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节、概念或项目" className="pl-9" /></label><Select value={module} onValueChange={setModule}><SelectTrigger className="w-full"><SelectValue placeholder="知识模块" /></SelectTrigger><SelectContent><SelectItem value="全部">全部模块</SelectItem>{["力学", "振动与波", "热学", "电磁学", "光学", "近代物理"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Button variant={sortPersonal ? "default" : "outline"} onClick={() => setSortPersonal((value) => !value)} disabled={!state.diagnosis}><Filter className="size-4" />按学情排序</Button></CardContent></Card><div className="grid gap-3">{filtered.map((chapter) => <ChapterRow key={chapter.no} chapter={chapter} diagnosis={state.diagnosis} student={state.student} onProject={() => navigate(teacher ? "curriculum" : "projects")} onTask={() => { updateRouteProject(chapter.primary); navigate("tasks" as AppView) }} />)}{filtered.length === 0 && <EmptyState title="没有匹配章节" description="尝试换一个关键词或清除模块筛选。" />}</div></TabsContent><TabsContent value="graph" className="mt-5"><div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="relative min-h-[480px] overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#eef4fb)] p-6"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#c7e6f7_1px,transparent_1px),linear-gradient(90deg,#c7e6f7_1px,transparent_1px)] [background-size:36px_36px]" /><div className="relative grid min-h-[430px] place-items-center"><button onClick={() => setSelectedNode("core")} className="grid size-28 place-items-center rounded-full bg-[var(--primary)] p-3 text-center text-sm font-semibold text-white shadow-lg shadow-sky-900/20">大学物理<br />知识核心</button>{KNOWLEDGE_NODES.filter((item) => item.id !== "core").map((item, index) => { const angle = (index / 14) * Math.PI * 2 - Math.PI / 2; const x = 50 + Math.cos(angle) * 37; const y = 50 + Math.sin(angle) * 37; return <React.Fragment key={item.id}><span className="absolute left-1/2 top-1/2 h-px w-[38%] origin-left bg-slate-300" style={{ transform: `rotate(${angle}rad)` }} /><button onClick={() => setSelectedNode(item.id)} className={cn("absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-white px-1 text-center text-[11px] font-medium shadow-sm transition-all hover:scale-105", selectedNode === item.id ? "border-[var(--primary)] text-[var(--primary)] ring-4 ring-sky-100" : "border-slate-200 text-slate-700")} style={{ left: `${x}%`, top: `${y}%` }}>{item.title}</button></React.Fragment> })}</div></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><StatusBadge tone="info">当前节点</StatusBadge><CardTitle className="mt-3 text-xl">{node.title}</CardTitle><CardDescription className="mt-2 leading-6">{node.description}</CardDescription></CardHeader><CardContent className="space-y-4 p-6 pt-3"><div className="rounded-md bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">关联项目与资源</p><p className="mt-2 text-sm leading-6 text-slate-700">{node.recommendations}</p></div><Button variant="outline" onClick={() => navigate(teacher ? "curriculum" : "projects")}>打开项目匹配<ArrowRight className="size-4" /></Button></CardContent></Card></div></TabsContent></Tabs></div>
}

function updateRouteProject(projectId: string) { window.dispatchEvent(new CustomEvent("physics:set-project", { detail: projectId })) }

function ChapterRow({ chapter, diagnosis, student, onProject, onTask }: { chapter: ChapterMapping; diagnosis?: DiagnosisResult; student?: AppState["student"]; onProject: () => void; onTask: () => void }) {
  const project = getProjectById(chapter.primary)
  const match = calculateChapterMatchScore(chapter, diagnosis, student)
  return <Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-sky-50 text-sm font-semibold text-[var(--primary)]">{String(chapter.no).padStart(2, "0")}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{chapter.title}</h3><StatusBadge tone={chapter.status === "成熟案例" ? "success" : chapter.status === "重点建设" ? "warning" : "default"}>{chapter.status}</StatusBadge></div><p className="mt-1 text-xs text-[var(--muted-foreground)]">{chapter.volume} · {chapter.module} · 建议课时 {chapter.hours}</p></div></div><div className="text-left lg:text-right"><p className="text-xs text-[var(--muted-foreground)]">匹配度</p><p className="text-xl font-semibold text-[var(--primary)]">{match}%</p></div></div><div className="mt-4 flex flex-wrap gap-2">{chapter.concepts.map((concept) => <span key={concept} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{concept}</span>)}</div><div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><div><p className="text-xs text-[var(--muted-foreground)]">主项目</p><p className="mt-1 font-medium text-[var(--primary)]">{project?.title ?? "待建设"}</p></div><div><p className="text-xs text-[var(--muted-foreground)]">能力路径</p><p className="mt-1 leading-5">{chapter.ability}</p></div><div><p className="text-xs text-[var(--muted-foreground)]">成果证据</p><p className="mt-1 leading-5">{chapter.output}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onProject}>查看项目<ArrowRight className="size-3.5" /></Button><Button size="sm" onClick={onTask} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]">生成本章任务单<ListChecks className="size-3.5" /></Button></div></CardContent></Card>
}

function ProjectsView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const [query, setQuery] = React.useState("")
  const [level, setLevel] = React.useState("全部")
  const matches = matchProjects(state.diagnosis, state.student, [...PROJECTS, ...state.localProjects]).filter((item) => (!query || item.project.title.toLowerCase().includes(query.toLowerCase()) || item.project.intro.toLowerCase().includes(query.toLowerCase())) && (level === "全部" || item.project.level === level))
  const selectProject = (projectId: string) => update((current) => ({ ...current, projectId, activeTask: 0, taskChecks: {}, taskTexts: {}, evaluation: undefined }))
  return <div className="space-y-5"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_auto]"><label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目名称或简介" className="pl-9" /></label><Select value={level} onValueChange={setLevel}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="全部">全部难度</SelectItem><SelectItem value="基础">基础</SelectItem><SelectItem value="中等">中等</SelectItem><SelectItem value="较高">较高</SelectItem></SelectContent></Select><StatusBadge tone={state.diagnosis ? "success" : "warning"}>{state.diagnosis ? "已结合学情" : "完成诊断后更精准"}</StatusBadge></CardContent></Card>{!state.diagnosis && <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><Lightbulb className="mt-0.5 size-4 shrink-0" /><p>当前展示课程适配度。完成 AI 学情诊断后，系统会优先显示覆盖薄弱维度、符合学习方式和能力目标的项目。</p><Button size="sm" variant="outline" className="ml-auto shrink-0 border-amber-300 bg-transparent" onClick={() => navigate("diagnosis")}>去诊断</Button></div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.map(({ project, score, reasons }, index) => <ProjectCard key={project.id} project={project} score={score} reasons={reasons} featured={index === 0 && Boolean(state.diagnosis)} selected={state.projectId === project.id} onSelect={() => selectProject(project.id)} onTasks={() => navigate("tasks")} />)}</div></div>
}

function ProjectCard({ project, score, reasons, featured, selected, onSelect, onTasks }: { project: Project; score: number; reasons: readonly string[]; featured: boolean; selected: boolean; onSelect: () => void; onTasks: () => void }) {
  return <Card className={cn("flex h-full flex-col rounded-lg border-[var(--border)] shadow-none", featured && "border-sky-300 bg-sky-50/30", selected && "ring-2 ring-sky-200")}><CardHeader className="p-5 pb-3"><div className="flex items-center justify-between gap-3"><StatusBadge tone={featured ? "info" : project.level === "基础" ? "success" : project.level === "较高" ? "warning" : "default"}>{featured ? "AI 优先推荐" : project.level}</StatusBadge>{score > 0 && <span className="text-sm font-semibold text-[var(--primary)]">{score}%</span>}</div><CardTitle className="mt-4 text-base leading-6">{project.title}</CardTitle><CardDescription className="mt-2 leading-6">{project.intro}</CardDescription></CardHeader><CardContent className="flex-1 p-5 pt-2"><div className="flex flex-wrap gap-2">{project.dims.map((dimension) => <span key={dimension} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{dimension}</span>)}</div><p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">能力路径：{project.ability}</p>{reasons.length > 0 && <ul className="mt-4 space-y-2 text-xs text-slate-600">{reasons.slice(0, 3).map((reason) => <li key={reason} className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-emerald-600" />{reason}</li>)}</ul>}</CardContent><CardFooter className="gap-2 border-t border-[var(--border)] px-5 py-4">{selected ? <Button size="sm" variant="outline" className="flex-1 border-emerald-300 bg-emerald-50 text-emerald-700" onClick={onTasks}><CheckCircle2 className="size-4" />已选择，去闯关</Button> : <Button size="sm" className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-strong)]" onClick={onSelect}>选择项目</Button>}</CardFooter></Card>
}

function TasksView({ state, update, navigate }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; navigate: (view: StudentView) => void }) {
  const project = getStateProject(state, state.projectId)
  const [active, setActive] = React.useState(state.activeTask ?? 0)
  const [text, setText] = React.useState(state.taskTexts?.[String(active)] ?? "")
  React.useEffect(() => {
    window.queueMicrotask(() => setText(state.taskTexts?.[String(active)] ?? ""))
  }, [active, state.taskTexts])
  if (!project) return <EmptyState title="还没有选择项目" description="先从项目匹配中心选择一个案例，系统会为你打开五阶任务路径。" action={<Button onClick={() => navigate("projects")}>前往项目匹配<ArrowRight className="size-4" /></Button>} />
  const progress = calculateTaskProgress(state.taskChecks)
  const current = TASK_TEMPLATES[active]
  const saveTask = () => update((currentState) => ({ ...currentState, activeTask: active, taskTexts: { ...currentState.taskTexts, [String(active)]: text } }))
  const toggleCheck = (key: string, value: boolean) => update((currentState) => ({ ...currentState, taskChecks: { ...currentState.taskChecks, [key]: value } }))
  return <div className="space-y-5"><div className="flex flex-col justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50/70 p-5 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">当前项目</p><h2 className="mt-2 text-lg font-semibold text-[var(--primary-strong)]">{project.title}</h2><p className="mt-1 text-sm text-sky-900/70">{project.ability}</p></div><div className="min-w-[180px]"><div className="mb-2 flex justify-between text-xs text-sky-900/70"><span>总进度</span><strong>{progress.percentage}%</strong></div><Progress value={progress.percentage} className="h-2 bg-sky-100" /></div></div><div className="grid gap-4 lg:grid-cols-[280px_1fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-5 pb-3"><CardTitle className="text-base">五阶任务</CardTitle><CardDescription className="mt-1">点击切换任务阶段</CardDescription></CardHeader><CardContent className="space-y-1 p-3 pt-2">{TASK_TEMPLATES.map((task, index) => { const taskDone = task.checks.every((_, checkIndex) => state.taskChecks[`${index}-${checkIndex}`]); return <button key={task.id} onClick={() => setActive(index)} className={cn("flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors", active === index ? "bg-sky-50 text-[var(--primary-strong)]" : "hover:bg-slate-50")}><span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs", taskDone ? "border-emerald-200 bg-emerald-50 text-emerald-700" : active === index ? "border-sky-300 bg-white text-[var(--primary)]" : "border-slate-200 bg-slate-50 text-slate-500")}>{taskDone ? <Check className="size-3" /> : index + 1}</span><span><span className="block text-sm font-medium">{task.name}</span><span className="mt-1 block text-xs text-[var(--muted-foreground)]">{task.ability}</span></span></button> })}</CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge tone="info">{current.ability}</StatusBadge><StatusBadge>{active + 1}/5</StatusBadge></div><CardTitle className="mt-3 text-xl">{current.name}</CardTitle><CardDescription className="mt-2 leading-6">{current.goal}</CardDescription></CardHeader><CardContent className="space-y-5 p-6 pt-3"><div><p className="mb-3 text-sm font-semibold">闯关条件</p><div className="space-y-2">{current.checks.map((check, index) => { const key = `${active}-${index}`; return <label key={check} className="flex cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] p-3 text-sm hover:bg-slate-50"><input type="checkbox" checked={Boolean(state.taskChecks[key])} onChange={(event) => toggleCheck(key, event.target.checked)} className="size-4 accent-[var(--primary)]" />{check}</label> })}</div></div><label className="block space-y-2 text-sm font-medium">过程说明<span className="block text-xs font-normal text-[var(--muted-foreground)]">记录思路、证据、困难和下一步计划。</span><Textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="例如：我先用……测量……，发现……，下一步准备……" /></label><div className="flex flex-wrap gap-2"><Button onClick={saveTask} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]"><Save className="size-4" />保存本关记录</Button>{active < TASK_TEMPLATES.length - 1 && <Button variant="outline" onClick={() => { saveTask(); setActive((index) => index + 1) }}>进入下一关<ArrowRight className="size-4" /></Button>}</div><div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900"><Bot className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /><p><strong>AI 实践智能体提示：</strong>{current.prompt}</p></div></CardContent></Card></div></div>
}

function AssistantView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [input, setInput] = React.useState("")
  const log = state.chat.length > 0 ? state.chat : [{ role: "ai" as const, text: "你好，我是物理 AI 助教“知物”。我会帮助你梳理概念、分析实验和审查方案，但不会直接替你完成作业。" }]
  const send = (value = input) => { const question = value.trim(); if (!question) return; update((current) => ({ ...current, chat: [...current.chat, { role: "user", text: question }, { role: "ai", text: aiReply(question) }] })); setInput("") }
  const quickQuestions = ["为什么超声波可以测距？", "如何判断项目方案是否合理？", "如何分析实验误差？", "牛顿第二定律怎么迁移应用？"]
  return <div className="grid gap-4 lg:grid-cols-[250px_1fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-5 pb-3"><CardTitle className="text-base">快捷问题</CardTitle><CardDescription className="mt-1">从一个具体问题开始</CardDescription></CardHeader><CardContent className="space-y-2 p-4 pt-1">{quickQuestions.map((question) => <button key={question} onClick={() => send(question)} className="w-full rounded-md border border-transparent p-3 text-left text-sm leading-5 transition-colors hover:border-[var(--border)] hover:bg-slate-50">{question}<ChevronRight className="mt-1 inline size-3.5 text-slate-400" /></button>)}<div className="mt-3 rounded-md bg-sky-50 p-3 text-xs leading-5 text-sky-900"><ShieldCheck className="mb-2 size-4 text-[var(--primary)]" /><strong className="block">知识辅导</strong>围绕课程知识提供分步追问、提示和验证建议。</div></CardContent></Card><Card className="flex min-h-[560px] flex-col rounded-lg border-[var(--border)] shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-[var(--border)] p-5"><div><CardTitle className="text-base">知物对话</CardTitle><CardDescription className="mt-1">追问 · 提示 · 验证</CardDescription></div><StatusBadge tone="success">在线</StatusBadge></CardHeader><CardContent className="flex-1 space-y-4 overflow-y-auto p-5">{log.map((message, index) => <div key={`${message.role}-${index}`} className={cn("flex gap-3", message.role === "user" && "justify-end")}><Avatar className={cn("size-8 shrink-0", message.role === "ai" ? "bg-sky-100 text-[var(--primary)]" : "bg-slate-700 text-white") }><AvatarFallback>{message.role === "ai" ? "知" : "我"}</AvatarFallback></Avatar><div className={cn("max-w-[78%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-6", message.role === "ai" ? "bg-slate-100 text-slate-700" : "bg-[var(--primary)] text-white")}>{message.text}</div></div>)}</CardContent><CardFooter className="border-t border-[var(--border)] p-4"><div className="flex w-full items-end gap-2"><Textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send() } }} placeholder="输入物理问题、实验困难或项目思路" rows={2} /><Button aria-label="发送问题" onClick={() => send()} className="size-10 shrink-0 bg-[var(--primary)] p-0 hover:bg-[var(--primary-strong)]"><Send className="size-4" /></Button></div></CardFooter></Card></div>
}

function LabView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const [distance, setDistance] = React.useState(1)
  const [speed, setSpeed] = React.useState(343)
  const [reflectivity, setReflectivity] = React.useState(80)
  const [noise, setNoise] = React.useState(2)
  const [lastRun, setLastRun] = React.useState<LabRecord | undefined>(state.labRecords.at(-1))
  const echoTime = calculateUltrasonicEchoTime(distance, speed)
  const run = () => { const measurement = simulateUltrasonicMeasurement({ distanceM: distance, speedMps: speed, reflectivity, noisePercent: noise }); const record: LabRecord = { ...measurement, timestamp: new Date().toISOString(), time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), reflect: reflectivity, noise }; setLastRun(record); update((current) => ({ ...current, labRecords: [...current.labRecords, record] })) }
  return <div className="space-y-5"><div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><div className="flex items-center justify-between"><div><CardTitle className="text-base">超声波测距场景</CardTitle><CardDescription className="mt-1">观察往返传播时间如何映射到目标距离。</CardDescription></div><StatusBadge tone={lastRun?.quality === "较差" ? "danger" : lastRun ? "success" : "info"}>{lastRun ? lastRun.quality : "待运行"}</StatusBadge></div></CardHeader><CardContent className="p-6 pt-3"><div className="relative h-64 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#e0f2fe,#f0f9ff)]"><div className="absolute bottom-12 left-10 grid size-16 place-items-center rounded-xl border-2 border-sky-300 bg-sky-100 text-center text-xs font-semibold text-sky-800">超声<br />模块</div><div className="absolute bottom-10 right-12 h-36 w-8 rounded-md border-2 border-slate-500 bg-slate-700" /><div className="absolute bottom-[92px] left-[116px] right-[74px] h-1 bg-sky-400/50" /><div className="absolute bottom-[88px] left-[116px] h-2 w-2 rounded-full bg-sky-600 shadow-[0_0_0_6px_rgba(2,132,199,.12)]" /><div className="absolute bottom-[98px] left-[116px] right-[74px] border-t border-dashed border-sky-500/60" /><div className="absolute left-1/2 top-7 -translate-x-1/2 rounded-md bg-white/75 px-3 py-2 text-center text-xs text-slate-600 shadow-sm"><strong className="block text-lg text-[var(--primary)]">{echoTime.toFixed(2)} ms</strong>理论往返时间</div><div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500">目标距离 {distance.toFixed(2)} m</div></div></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">实验参数</CardTitle><CardDescription className="mt-1">拖动参数后运行一次测量。</CardDescription></CardHeader><CardContent className="space-y-5 p-6 pt-2">{[{label: "目标距离", value: distance, min: 0.2, max: 3, step: 0.1, unit: "m", set: setDistance}, {label: "环境声速", value: speed, min: 320, max: 360, step: 1, unit: "m/s", set: setSpeed}, {label: "反射率", value: reflectivity, min: 20, max: 100, step: 1, unit: "%", set: setReflectivity}, {label: "测量噪声", value: noise, min: 0, max: 15, step: 1, unit: "%", set: setNoise}].map((item) => <label key={item.label} className="block space-y-2"><span className="flex justify-between text-sm"><span className="font-medium">{item.label}</span><strong className="text-[var(--primary)]">{typeof item.value === "number" && item.step < 1 ? item.value.toFixed(2) : item.value} {item.unit}</strong></span><input aria-label={item.label} type="range" min={item.min} max={item.max} step={item.step} value={item.value} onChange={(event) => item.set(Number(event.target.value))} className="w-full accent-[var(--primary)]" /></label>)}<Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary-strong)]" onClick={run}><Play className="size-4" />运行一次测量</Button>{lastRun && <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-50 p-3 text-sm"><div><p className="text-xs text-[var(--muted-foreground)]">测量结果</p><strong>{lastRun.measuredDistanceM.toFixed(3)} m</strong></div><div><p className="text-xs text-[var(--muted-foreground)]">相对误差</p><strong>{lastRun.errorPercent.toFixed(2)}%</strong></div></div>}</CardContent></Card></div><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-[var(--border)] p-5"><div><CardTitle className="text-base">实验记录</CardTitle><CardDescription className="mt-1">记录会自动保存。</CardDescription></div><Button size="sm" variant="outline" onClick={() => update((current) => ({ ...current, labRecords: [] }))} disabled={state.labRecords.length === 0}><Trash2 className="size-4" />清空记录</Button></CardHeader><CardContent className="p-0">{state.labRecords.length === 0 ? <div className="p-6"><EmptyState title="尚未运行测量" description="调整参数后点击“运行一次测量”，系统会将一条记录加入表格。" /></div> : <Table><TableHeader><TableRow><TableHead>时间</TableHead><TableHead>距离</TableHead><TableHead>测量值</TableHead><TableHead>误差</TableHead><TableHead>信号质量</TableHead></TableRow></TableHeader><TableBody>{state.labRecords.slice().reverse().map((record, index) => <TableRow key={`${record.timestamp}-${index}`}><TableCell>{record.time ?? record.timestamp}</TableCell><TableCell>{record.distanceM.toFixed(2)} m</TableCell><TableCell>{record.measuredDistanceM.toFixed(3)} m</TableCell><TableCell>{record.errorPercent.toFixed(2)}%</TableCell><TableCell><StatusBadge tone={record.quality === "良好" ? "success" : record.quality === "一般" ? "warning" : "danger"}>{record.quality}</StatusBadge></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></div>
}

function ReportView({ state, navigate }: { state: AppState; navigate: (view: StudentView) => void }) {
  const project = getStateProject(state, state.projectId)
  const progress = calculateTaskProgress(state.taskChecks)
  const summary = state.evaluation ?? summarizeEvaluation({ diagnosisScore: state.diagnosis?.score, taskProgress: progress.percentage, labRecords: state.labRecords, chatCount: state.chat.length, participation: 82, teamwork: 80, design: 78, experiment: 84, presentation: 80, reflection: 76 })
  const exportReport = () => { const data = { system: "大学物理 AI 智慧教学系统", student: state.student ?? { name: "陈思远" }, diagnosis: state.diagnosis ?? null, project: project ?? null, taskProgress: progress, labRecords: state.labRecords, evaluation: summary, generatedAt: new Date().toISOString() }; const blob = new Blob([withUtf8Bom(toJson(data))], { type: "application/json;charset=utf-8" }); const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(blob); anchor.download = "大学物理AI学习报告.json"; anchor.click(); URL.revokeObjectURL(anchor.href) }
  return <div className="space-y-5"><div className="no-print flex flex-wrap gap-2"><Button onClick={exportReport} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]"><Download className="size-4" />下载 JSON 报告</Button><Button variant="outline" onClick={() => window.print()}>打印报告</Button></div><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="border-b border-[var(--border)] p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">大学物理学习报告</p><CardTitle className="mt-2 text-2xl">{state.student?.name ?? "陈思远"}的大学物理学习画像</CardTitle><CardDescription className="mt-2">报告根据你的学习记录生成，可用于复盘学习进展。</CardDescription></div><div className="text-left sm:text-right"><p className="text-4xl font-semibold text-[var(--primary)]">{summary.final}</p><p className="text-xs text-[var(--muted-foreground)]">{summary.grade}</p></div></div></CardHeader><CardContent className="space-y-6 p-6"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-md bg-slate-50 p-4"><p className="text-xs text-[var(--muted-foreground)]">诊断结果</p><p className="mt-2 text-lg font-semibold">{state.diagnosis ? `${state.diagnosis.score} 分` : "未完成"}</p></div><div className="rounded-md bg-slate-50 p-4"><p className="text-xs text-[var(--muted-foreground)]">项目与任务</p><p className="mt-2 text-lg font-semibold">{project ? `${progress.percentage}%` : "未选择"}</p></div><div className="rounded-md bg-slate-50 p-4"><p className="text-xs text-[var(--muted-foreground)]">实验记录</p><p className="mt-2 text-lg font-semibold">{state.labRecords.length} 条</p></div></div><div><SectionTitle title="四阶能力结果" description={`优势维度：${summary.strongestDimension}，下一步重点：${summary.weakestDimension}`} /><div className="grid gap-3 sm:grid-cols-2">{[{label: "知识理解", value: summary.knowledge}, {label: "专业应用", value: summary.application}, {label: "创新实践", value: summary.innovation}, {label: "团队协作", value: summary.collaboration}].map((item) => <div key={item.label} className="rounded-md border border-[var(--border)] p-4"><div className="mb-2 flex justify-between text-sm"><span>{item.label}</span><strong>{item.value}</strong></div><Progress value={item.value} className="h-2" /></div>)}</div></div><div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900"><strong>AI 建议：</strong>当前相对薄弱维度为“{summary.weakestDimension}”。建议下一轮项目保留一个可观察、可记录的专项任务，并用前后数据验证改进效果。</div></CardContent></Card>{!state.evaluation && <div className="no-print flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><span>完成更多任务或实验后，报告会自动更新。</span><Button size="sm" variant="outline" onClick={() => navigate("tasks")} className="border-amber-300 bg-transparent">继续留下证据</Button></div>}</div>
}

function TeacherDashboard({ navigate }: { navigate: (view: TeacherView) => void }) {
  const riskCount = DEMO_STUDENTS.filter((student) => student.risk === "高风险").length
  const chartData = [{ name: "知识理解", value: 76 }, { name: "专业应用", value: 72 }, { name: "创新实践", value: 68 }, { name: "团队协作", value: 74 }]
  return <div className="space-y-6"><div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><Card className="rounded-lg border-0 bg-[var(--sidebar)] text-white shadow-none"><CardContent className="p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/70">本周教学调控</p><h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em]">从班级信号里，找出下一堂课真正需要被看见的问题。</h2><p className="mt-3 max-w-xl text-sm leading-6 text-sky-50/75">当前教学数据已聚合到章节、项目、任务与能力维度，支持教师先定位，再调整任务支架。</p><div className="mt-6 flex flex-wrap gap-2"><Button className="bg-white text-[var(--primary-strong)] hover:bg-sky-50" onClick={() => navigate("class")}>查看班级画像<ArrowRight className="size-4" /></Button><Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("insights")}>查看教学洞察</Button></div></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><div className="flex items-center justify-between"><div><CardTitle className="text-base">即时提醒</CardTitle><CardDescription className="mt-1">需要人工判断的信号</CardDescription></div><Bell className="size-4 text-[var(--warning)]" /></div></CardHeader><CardContent className="space-y-3 p-6 pt-2"><div className="rounded-md border border-rose-200 bg-rose-50 p-3"><p className="text-sm font-medium text-rose-800">机械波概念误区</p><p className="mt-1 text-xs leading-5 text-rose-700">12 名学生混淆波速和质点振动速度。</p></div><div className="rounded-md border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-medium text-amber-800">项目进度滞后</p><p className="mt-1 text-xs leading-5 text-amber-700">无线传能项目有 2 组尚未提交方案。</p></div></CardContent></Card></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="教学班人数" value="42" hint="物理学 2601 班" icon={Users} tone="blue" /><MetricCard label="诊断完成率" value="90.5%" hint="38 / 42" icon={ClipboardCheck} tone="green" /><MetricCard label="项目启动率" value="83.3%" hint="35 / 42" icon={Target} tone="amber" /><MetricCard label="学习预警" value={`${riskCount + 5} 人`} hint="需教师关注" icon={AlertTriangle} tone="red" /></div><div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">四阶能力平均表现</CardTitle><CardDescription className="mt-1">当前教学班最近一次汇总</CardDescription></CardHeader><CardContent className="p-5 pt-1"><ChartContainer config={{ value: { label: "平均分", color: "#0369a1" } }} className="h-[250px] w-full"><BarChart data={chartData} margin={{ top: 12, right: 12, bottom: 10, left: -16 }}><CartesianGrid vertical={false} stroke="#e5eaf0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#607086", fontSize: 12 }} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#8b99ab", fontSize: 11 }} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">教师下一步</CardTitle><CardDescription className="mt-1">从一个可执行入口开始</CardDescription></CardHeader><CardContent className="space-y-2 p-5 pt-2">{[{label: "查看高风险学生", desc: "先处理需要关注的个体", view: "class" as TeacherView, icon: Users}, {label: "复核 AI 建议分", desc: "保留教师最终判断", view: "evaluation" as TeacherView, icon: ClipboardCheck}, {label: "生成调控方案", desc: "结合本周教学信号", view: "insights" as TeacherView, icon: Lightbulb}].map((item) => <button key={item.label} onClick={() => navigate(item.view)} className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-slate-50"><span className="grid size-8 place-items-center rounded-md bg-slate-100 text-[var(--primary)]"><item.icon className="size-4" /></span><span><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-[var(--muted-foreground)]">{item.desc}</span></span><ChevronRight className="ml-auto size-4 text-slate-300" /></button>)}</CardContent></Card></div></div>
}

function ClassView({ navigate }: { navigate: (view: TeacherView) => void }) {
  const [risk, setRisk] = React.useState("全部")
  const students = DEMO_STUDENTS.filter((student) => risk === "全部" || student.risk === risk)
  return <div className="space-y-5"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center"><div><p className="text-sm font-medium">班级学习概况</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">筛选风险状态，定位下一次辅导对象。</p></div><Select value={risk} onValueChange={setRisk}><SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="全部">全部状态</SelectItem><SelectItem value="高风险">高风险</SelectItem><SelectItem value="关注">关注</SelectItem><SelectItem value="正常">正常</SelectItem><SelectItem value="优秀">优秀</SelectItem></SelectContent></Select></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>学生</TableHead><TableHead>前测</TableHead><TableHead>薄弱维度</TableHead><TableHead>当前项目</TableHead><TableHead>任务进度</TableHead><TableHead>风险</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{students.map((student) => <TableRow key={student.name}><TableCell className="font-medium">{student.name}</TableCell><TableCell>{student.score}</TableCell><TableCell>{student.weakDimension}</TableCell><TableCell>{student.project}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={student.progress} className="w-20" /><span className="text-xs text-slate-500">{student.progress}%</span></div></TableCell><TableCell><StatusBadge tone={student.risk === "高风险" ? "danger" : student.risk === "关注" ? "warning" : student.risk === "优秀" ? "success" : "default"}>{student.risk}</StatusBadge></TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => navigate("evaluation")}>查看评价</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>
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
  const openEdit = (project: Project) => { setEditingProjectId(project.id); setNewProjectName(project.title); setNewProjectIntro(project.intro); setDialogOpen(true) }
  return <div className="space-y-5"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="flex flex-col gap-3 p-4 md:flex-row"><label className="relative block flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节或项目" className="pl-9" /></label><Button onClick={() => { setEditingProjectId(null); setNewProjectName(""); setNewProjectIntro(""); setDialogOpen(true) }} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]"><Plus className="size-4" />新增项目</Button></CardContent></Card>{state.localProjects.length > 0 && <Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">项目库</CardTitle><CardDescription className="mt-1">新增与编辑只影响当前账号的学习记录。</CardDescription></CardHeader><CardContent className="space-y-2 p-6 pt-2">{state.localProjects.map((project) => <div key={project.id} className="flex flex-col gap-3 rounded-md border border-[var(--border)] p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-medium">{project.title}</p><p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">{project.intro}</p></div><Button size="sm" variant="outline" onClick={() => openEdit(project)}><Pencil className="size-3.5" />编辑</Button></div>)}</CardContent></Card>}<Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>章节</TableHead><TableHead>核心知识</TableHead><TableHead>主项目</TableHead><TableHead>能力路径</TableHead><TableHead>成果证据</TableHead><TableHead>状态</TableHead></TableRow></TableHeader><TableBody>{filtered.map((chapter) => <TableRow key={chapter.no}><TableCell><p className="font-medium">{chapter.no}. {chapter.title}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{chapter.volume} · {chapter.module}</p></TableCell><TableCell className="max-w-[220px] whitespace-normal leading-5">{chapter.concepts.join("、")}</TableCell><TableCell className="max-w-[230px] whitespace-normal font-medium text-[var(--primary)]">{getProjectById(chapter.primary)?.title}</TableCell><TableCell className="max-w-[240px] whitespace-normal leading-5">{chapter.ability}</TableCell><TableCell className="max-w-[220px] whitespace-normal leading-5">{chapter.output}</TableCell><TableCell><StatusBadge tone={chapter.status === "成熟案例" ? "success" : chapter.status === "重点建设" ? "warning" : "default"}>{chapter.status}</StatusBadge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingProjectId ? "编辑项目" : "新增项目"}</DialogTitle><DialogDescription>保存到项目库，不会影响其他课程内容。</DialogDescription></DialogHeader><label className="space-y-2 text-sm font-medium">项目名称<Input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="例如：光伏组件热效率优化" /></label><label className="space-y-2 text-sm font-medium">项目简介<Textarea value={newProjectIntro} onChange={(event) => setNewProjectIntro(event.target.value)} rows={3} placeholder="说明项目要解决的物理问题和成果证据。" /></label><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={saveProject} disabled={!newProjectName.trim()} className="bg-[var(--primary)] hover:bg-[var(--primary-strong)]"><Save className="size-4" />保存项目</Button></DialogFooter></DialogContent></Dialog></div>
}

function TeacherEvaluationView({ state, update }: { state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void }) {
  const saveReview = (name: string, score: string, reason: string) => {
    const parsedScore = Number(score)
    if (!Number.isFinite(parsedScore)) return
    const review: EvaluationReview = { score: Math.max(0, Math.min(100, Math.round(parsedScore))), reason: reason.trim(), updatedAt: new Date().toISOString() }
    update((current) => ({ ...current, evaluationReviews: { ...current.evaluationReviews, [name]: review } }))
  }
  return <div className="space-y-5"><div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" /><p>评价中心保留教师复核权。表格中的建议分用于辅助判断，点击保存后会记录教师复核结果。</p></div><Card className="rounded-lg border-[var(--border)] shadow-none"><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>学生</TableHead><TableHead>知识理解</TableHead><TableHead>专业应用</TableHead><TableHead>创新实践</TableHead><TableHead>团队协作</TableHead><TableHead>AI 建议分</TableHead><TableHead>教师复核分</TableHead><TableHead>复核理由</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>{DEMO_STUDENTS.map((student, index) => { const suggestion = Math.round((student.score + 68 + index * 3 + 64 + index * 4 + 72 + index * 2) / 4); const review = state.evaluationReviews[student.name] ?? { score: suggestion, reason: "" }; return <TableRow key={student.name}><TableCell className="font-medium">{student.name}</TableCell><TableCell>{Math.min(95, student.score + 3)}</TableCell><TableCell>{68 + index * 3}</TableCell><TableCell>{64 + index * 4}</TableCell><TableCell>{72 + index * 2}</TableCell><TableCell><strong>{suggestion}</strong></TableCell><TableCell><Input aria-label={`${student.name}复核分`} defaultValue={review.score} key={`${student.name}-${review.updatedAt}`} className="h-8 w-20" /></TableCell><TableCell><Input aria-label={`${student.name}复核理由`} defaultValue={review.reason} key={`${student.name}-reason-${review.updatedAt}`} className="h-8 min-w-[180px]" /></TableCell><TableCell><Button size="sm" variant="outline" onClick={(event) => { const row = event.currentTarget.closest("tr"); const inputs = row?.querySelectorAll("input"); saveReview(student.name, inputs?.[0]?.value ?? String(suggestion), inputs?.[1]?.value ?? "") }}><Save className="size-3.5" />保存</Button></TableCell></TableRow> })}</TableBody></Table></CardContent></Card></div>
}

function TeacherInsightsView() {
  const [planIndex, setPlanIndex] = React.useState(0)
  const [feedback, setFeedback] = React.useState("")
  const plan = TEACHING_PLANS[planIndex]
  return <div className="space-y-5"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="flex-row items-start justify-between p-6"><div><CardTitle className="text-base">本周教学调控方案</CardTitle><CardDescription className="mt-1">基于当前教学班信号生成，教师可编辑和采纳。</CardDescription></div><Button size="sm" variant="outline" onClick={() => setPlanIndex((index) => (index + 1) % TEACHING_PLANS.length)}><RotateCcw className="size-4" />刷新建议</Button></CardHeader><CardContent className="p-6 pt-1"><div className="rounded-md bg-slate-50 p-5"><p className="text-sm font-semibold">{plan.title}</p><p className="mt-3 text-sm leading-7 text-slate-700">{plan.content}</p></div><label className="mt-5 block space-y-2 text-sm font-medium">教师补充备注<Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} placeholder="记录你准备在课堂上验证的调整。" /></label><Button className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary-strong)]" onClick={() => setFeedback((value) => value.trim() ? value : "已采纳本周教学调控方案，下一次课后复盘。")}>保存调控记录<Save className="size-4" /></Button></CardContent></Card><div className="grid gap-4 lg:grid-cols-2"><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">教学质量诊断</CardTitle></CardHeader><CardContent className="space-y-3 p-6 pt-2"><div className="rounded-md border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-800">优势</p><p className="mt-1 text-sm leading-6 text-emerald-700">项目任务与课程知识关联清晰，课中互动记录较完整。</p></div><div className="rounded-md border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-medium text-amber-800">改进</p><p className="mt-1 text-sm leading-6 text-amber-700">光学模块高阶任务偏少，可补充智能对焦系统开放性设计。</p></div><div className="rounded-md border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-medium text-rose-800">风险</p><p className="mt-1 text-sm leading-6 text-rose-700">部分作业存在 AI 生成痕迹，需要增加口头答辩和过程证据核验。</p></div></CardContent></Card><Card className="rounded-lg border-[var(--border)] shadow-none"><CardHeader className="p-6 pb-3"><CardTitle className="text-base">AI 使用边界</CardTitle></CardHeader><CardContent className="space-y-3 p-6 pt-2 text-sm leading-6 text-slate-700">{["不上传含个人敏感信息、未公开试卷和涉密资料。", "AI 反馈必须可追溯、可解释，并由教师复核。", "项目作品需保留草图、实验记录和版本迭代等原创证据。", "学生使用 AI 时应声明用途，并进行事实核验与逻辑反思。"].map((rule) => <div key={rule} className="flex gap-3"><ShieldCheck className="mt-1 size-4 shrink-0 text-[var(--success)]" /><span>{rule}</span></div>)}</CardContent></Card></div></div>
}

function Shell({ role, state, update, onLogout, onReset }: { role: UserRole; state: AppState; update: (patch: Partial<AppState> | ((current: AppState) => AppState)) => void; onLogout: () => void; onReset: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const view = viewFromPath(pathname, role)
  const navItems = role === "student" ? studentNavigation : teacherNavigation
  const navigate = (next: AppView) => { router.push(`/${role}/${next}`) }
  const meta = role === "teacher" && view === "curriculum" ? teacherCurriculumMeta : pageMeta[view]
  const renderView = () => { if (role === "student") { if (view === "overview") return <OverviewView state={state} navigate={navigate as (view: StudentView) => void} />; if (view === "diagnosis") return <DiagnosisView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "curriculum") return <CurriculumView state={state} navigate={navigate} />; if (view === "projects") return <ProjectsView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "tasks") return <TasksView state={state} update={update} navigate={navigate as (view: StudentView) => void} />; if (view === "assistant") return <AssistantView state={state} update={update} />; if (view === "lab") return <LabView state={state} update={update} />; return <ReportView state={state} navigate={navigate as (view: StudentView) => void} /> } if (view === "dashboard") return <TeacherDashboard navigate={navigate as (view: TeacherView) => void} />; if (view === "class") return <ClassView navigate={navigate as (view: TeacherView) => void} />; if (view === "curriculum") return <TeacherCurriculumView state={state} update={update} />; if (view === "evaluation") return <TeacherEvaluationView state={state} update={update} />; return <TeacherInsightsView /> }
  return <SidebarProvider defaultOpen><Sidebar collapsible="offcanvas" className="border-r-0"><SidebarHeader className="border-b border-white/10 px-4 py-5"><AppLogo /></SidebarHeader><SidebarContent className="bg-[var(--sidebar)]"><SidebarGroup><SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.15em] text-[var(--sidebar-muted)]">{role === "student" ? "学生端" : "教师端"}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navItems.map((item) => <SidebarMenuItem key={item.id}><SidebarMenuButton isActive={view === item.id} onClick={() => navigate(item.id)} className="h-10 rounded-md px-3 text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white data-[active=true]:bg-[var(--sidebar-active)] data-[active=true]:text-white"><item.icon className="size-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarSeparator className="bg-white/10" /><SidebarFooter className="bg-[var(--sidebar)] p-3"><div className="mb-2 flex items-center gap-3 rounded-md bg-white/5 p-3"><Avatar className="size-8 bg-sky-100 text-[var(--primary)]"><AvatarFallback>{role === "student" ? "学" : "师"}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{role === "student" ? state.student?.name ?? "陈思远" : "顿老师"}</p><p className="truncate text-xs text-[var(--sidebar-muted)]">{role === "student" ? "学生账号" : "教师账号"}</p></div></div><Button variant="ghost" className="w-full justify-start text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white" onClick={onLogout}><LogOut className="size-4" />退出登录</Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" className="w-full justify-start text-[var(--sidebar-muted)] hover:bg-rose-900/30 hover:text-rose-100"><RotateCcw className="size-4" />重置学习记录</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>确认重置学习记录？</AlertDialogTitle><AlertDialogDescription>将清空诊断、项目、任务、问答、实验和评价记录，账号登录状态不会被删除。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={onReset} className="bg-rose-600 hover:bg-rose-700">确认重置</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></SidebarFooter></Sidebar><SidebarInset className="min-w-0 bg-[var(--background)]"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/90 px-4 backdrop-blur md:px-7"><div className="flex items-center gap-3"><SidebarTrigger className="md:hidden" /><div className="hidden size-8 items-center justify-center rounded-md bg-[var(--primary)] text-white md:flex"><span className="text-xs font-semibold">物</span></div><div><p className="text-xs text-[var(--muted-foreground)]">{meta.eyebrow}</p><p className="text-sm font-semibold">{meta.title}</p></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-[var(--muted-foreground)] sm:flex"><Activity className="size-3.5 text-[var(--success)]" />系统运行中</div><Avatar className="size-8 bg-sky-100 text-[var(--primary)]"><AvatarFallback>{role === "student" ? "学" : "师"}</AvatarFallback></Avatar></div></header><main className="mx-auto w-full max-w-[1480px] px-4 py-6 md:px-7 md:py-8"><PageHeader view={view} />{renderView()}</main></SidebarInset></SidebarProvider>
}

export default function PhysicsApp() {
  const router = useRouter()
  const pathname = usePathname()
  const { state, update, setState, hydrated } = usePersistedAppState()
  const [session, setSession] = React.useState<{ role: UserRole; displayName: string } | null>(() => getSession())
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
  React.useEffect(() => { const handler = (event: Event) => { const projectId = (event as CustomEvent<string>).detail; update((current) => ({ ...current, projectId })) }; window.addEventListener("physics:set-project", handler); return () => window.removeEventListener("physics:set-project", handler) }, [update])
  if (!hydrated) return <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]"><div className="w-full max-w-md space-y-3 px-6"><Skeleton className="h-6 w-40" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /></div></main>
  if (!session) return <LoginScreen onLogin={(role, displayName) => {
    const account = accountForRole(role)
    setSession({ role, displayName })
    update((current) => ({
      ...current,
      role,
      student: role === "student" ? account?.profile as AppState["student"] : current.student,
      teacher: role === "teacher" ? account?.profile as AppState["teacher"] : current.teacher,
    }))
    router.push(`/${role}/${role === "student" ? "overview" : "dashboard"}`)
  }} />
  const logout = () => { clearSession(); setSession(null); router.push("/login") }
  const reset = () => {
    clearState()
    const next = createInitialState()
    next.role = session.role
    const account = accountForRole(session.role)
    if (session.role === "student") next.student = account?.profile as AppState["student"]
    if (session.role === "teacher") next.teacher = account?.profile as AppState["teacher"]
    setState(next)
    saveState(next)
  }
  const activeRole = pathname.startsWith("/teacher") ? "teacher" : pathname.startsWith("/student") ? "student" : session.role
  if (activeRole !== session.role) { router.replace(`/${session.role}/${session.role === "student" ? "overview" : "dashboard"}`); return null }
  return <Shell role={session.role} state={state} update={update} onLogout={logout} onReset={reset} />
}
