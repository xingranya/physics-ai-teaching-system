"use client"

import * as React from "react"
import { ArrowRight, Bot, CheckCircle2, ClipboardCheck, FileBarChart, FileText, FlaskConical, LayoutDashboard, Library, Lightbulb, ListChecks, LogOut, Network, RotateCcw, Target, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ShortcutBinding } from "@/lib/shortcuts"
import type { UserRole } from "@/lib/types"

const iconMap: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  dashboard: LayoutDashboard,
  diagnosis: ClipboardCheck,
  curriculum: Network,
  projects: Library,
  tasks: ListChecks,
  assistant: Bot,
  lab: FlaskConical,
  report: FileBarChart,
  class: Users,
  evaluation: ClipboardCheck,
  insights: Lightbulb,
  "open-shortcuts-help": FileText,
  logout: LogOut,
  reset: RotateCcw,
  default: ArrowRight,
}

function iconFor(binding: ShortcutBinding): React.ElementType {
  if (binding.action.type === "navigate") {
    return iconMap[binding.action.view] ?? iconMap.default
  }
  return iconMap[binding.action.id] ?? iconMap.default
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: UserRole | null
  shortcuts: ShortcutBinding[]
  onSelect: (binding: ShortcutBinding) => void
}

export function CommandPalette({ open, onOpenChange, role, shortcuts, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      // Defer reset to avoid synchronous setState inside the effect body.
      window.queueMicrotask(() => {
        setQuery("")
        setActiveIndex(0)
      })
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  const filtered = React.useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return shortcuts
    return shortcuts.filter((binding) => {
      const label = binding.label.toLowerCase()
      const hint = binding.hint.toLowerCase()
      return label.includes(lower) || hint.includes(lower)
    })
  }, [query, shortcuts])

  // Clamp the active index whenever the filtered list shrinks, instead of
  // resetting it from an effect on every keystroke.
  const clampedActiveIndex = filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1)

  const pick = (binding: ShortcutBinding) => {
    onOpenChange(false)
    onSelect(binding)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % Math.max(1, filtered.length))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const target = filtered[clampedActiveIndex]
      if (target) pick(target)
    } else if (event.key === "Escape") {
      onOpenChange(false)
    }
  }

  const groups = React.useMemo(() => {
    const seen: Record<string, ShortcutBinding[]> = {}
    filtered.forEach((binding) => {
      const key = binding.scope === "global" ? "操作" : role === "teacher" ? "教师工作台" : "学生工作台"
      seen[key] = seen[key] ? [...seen[key], binding] : [binding]
    })
    return Object.entries(seen)
  }, [filtered, role])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden border-[var(--border)] bg-white/95 p-0 shadow-[var(--shadow-pop)] backdrop-blur-xl" onKeyDown={onKeyDown}>
        <DialogTitle className="sr-only">命令面板</DialogTitle>
        <DialogDescription className="sr-only">通过命令面板快速跳转页面或触发操作。</DialogDescription>
        <div className="border-b border-[var(--border)] bg-[var(--primary-softer)]/60 px-4 py-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入以过滤命令…（支持拼音 / 中文）"
            aria-label="命令搜索"
            className="h-10 bg-white/80"
          />
          <p className="mt-2 flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
            <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
            <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
            选择 ·
            <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
            执行 ·
            <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
            关闭
          </p>
        </div>
        <div className="ds-scrollable max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
              没有匹配「{query}」的命令。
            </div>
          )}
          {groups.map(([groupLabel, items]) => (
            <div key={groupLabel} className="mb-2 last:mb-0">
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {groupLabel}
              </p>
              <ul role="listbox" aria-label={groupLabel}>
                {items.map((binding) => {
                  const index = filtered.indexOf(binding)
                  const Icon = iconFor(binding)
                  const active = index === clampedActiveIndex
                  return (
                    <li key={binding.label}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(binding)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                          active ? "bg-[var(--primary)] text-white shadow-[0_8px_18px_-8px_rgba(3,105,161,0.45)]" : "hover:bg-[var(--primary-softer)]"
                        )}
                      >
                        <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", active ? "bg-white/15 text-white" : "bg-[var(--primary-softer)] text-[var(--primary)]")}>
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium">{binding.label}</span>
                          {binding.combo && (
                            <span className={cn("mt-0.5 block text-[10px] font-mono uppercase tracking-[0.14em]", active ? "text-white/80" : "text-[var(--muted-foreground)]")}>
                              {binding.combo.split("").join(" ")}
                            </span>
                          )}
                        </span>
                        <ArrowRight className={cn("size-3.5 shrink-0", active ? "text-white" : "text-[var(--border-strong)]")} aria-hidden="true" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] bg-[var(--surface-muted)]/70 px-4 py-2.5">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
            <span>
              快捷键 <kbd className="rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">g</kbd> 然后按字母跳转 ·
              <kbd className="ml-1 rounded border border-[var(--border-strong)] bg-white px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd> 打开面板
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="size-3" />
              {filtered.length} 条命令
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}