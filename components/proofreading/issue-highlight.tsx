"use client"

import { useMemo } from "react"
import type { Issue, IssueCategory } from "@/types/proofreading"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface IssueHighlightProps {
  inputText: string
  issues: Issue[]
  activeCategory: IssueCategory | "all"
  onAcceptSuggestion: (id: number) => void
  onIgnoreSuggestion: (id: number) => void
}

export function IssueHighlight({
  inputText,
  issues,
  activeCategory,
  onAcceptSuggestion,
  onIgnoreSuggestion,
}: IssueHighlightProps) {
  const segments = useMemo(() => {
    if (issues.length === 0) {
      return [{ type: "text" as const, content: inputText }]
    }

    const sortedIssues = [...issues].sort((a, b) => a.start - b.start)
    const result: Array<{ type: "text" | "highlight"; content: string; issue?: Issue }> = []
    let lastIndex = 0

    sortedIssues.forEach((issue) => {
      if (issue.start > lastIndex) {
        result.push({
          type: "text",
          content: inputText.substring(lastIndex, issue.start),
        })
      }
      result.push({
        type: "highlight",
        content: inputText.substring(issue.start, issue.end),
        issue,
      })
      lastIndex = issue.end
    })

    if (lastIndex < inputText.length) {
      result.push({
        type: "text",
        content: inputText.substring(lastIndex),
      })
    }

    return result
  }, [inputText, issues])

  const getHighlightClass = (issue: Issue) => {
    if (issue.fixed) return "highlight-fixed"
    if (issue.ignored) return "highlight-ignored"

    const isActive = activeCategory === "all" || activeCategory === issue.category

    const baseClass =
      {
        错别字: "highlight-error",
        语法错误: "highlight-warning",
        标点符号: "highlight-info",
        表达优化: "highlight-success",
      }[issue.category] || "highlight-info"

    return `${baseClass} ${!isActive ? "opacity-30" : ""}`
  }

  return (
    <div className="relative p-6 rounded-lg bg-card border border-border min-h-[200px] whitespace-pre-wrap leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>
        }

        const issue = segment.issue!
        return (
          <span key={index} className={`relative group cursor-pointer ${getHighlightClass(issue)}`}>
            {segment.content}
            {!issue.fixed && !issue.ignored && (
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-80">
                <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                  <div className="text-xs font-medium text-destructive mb-1">问题：{issue.reason}</div>
                  <div className="text-xs mb-2">
                    建议修改为：<span className="font-medium text-green-500">{issue.suggestion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={() => onAcceptSuggestion(issue.id)}>
                      <Check className="h-3 w-3 mr-1" />
                      接受
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-transparent"
                      onClick={() => onIgnoreSuggestion(issue.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      忽略
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </span>
        )
      })}
    </div>
  )
}
