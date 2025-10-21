"use client"

import type { Issue } from "@/types/proofreading"
import { Badge } from "@/components/ui/badge"
import { Check, X, Undo2, CheckCircle2, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IssueListProps {
  issues: Issue[]
  onAcceptSuggestion: (id: number) => void
  onIgnoreSuggestion: (id: number) => void
  onUnignoreSuggestion: (id: number) => void
}

const CATEGORY_STYLES = {
  错别字: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  语法错误: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  标点符号: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  表达优化: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
}

export function IssueList({ issues, onAcceptSuggestion, onIgnoreSuggestion, onUnignoreSuggestion }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暂无问题</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] rounded-lg border border-border">
      <div className="divide-y divide-border">
        {issues.map((issue: Issue) => {
          const style = CATEGORY_STYLES[issue.category] || CATEGORY_STYLES["表达优化"]

          return (
            <div
              key={issue.id}
              className={`p-4 hover:bg-muted/50 transition-colors ${
                issue.fixed ? "bg-green-500/5" : issue.ignored ? "bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} border w-[65px]`}>
                  {issue.ignored ? "已忽略" : issue.category}
                </Badge>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm mb-2 ${issue.fixed || issue.ignored ? "text-muted-foreground" : "text-destructive"}`}
                  >
                    {issue.reason}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`line-through ${issue.fixed || issue.ignored ? "text-muted-foreground" : "text-foreground/70"}`}
                    >
                      {issue.original}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-green-500">{issue.suggestion}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                  {issue.fixed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : issue.ignored ? (
                    <Badge variant="secondary" className="h-6" onClick={() => onUnignoreSuggestion(issue.id)}>
                      <Undo2 className="h-4 w-4" />撤销
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="default" className="h-6" onClick={() => onAcceptSuggestion(issue.id)}>
                        <Check className="h-4 w-4" />
                      </Badge>
                      <Badge variant="secondary" className="h-6" onClick={() => onIgnoreSuggestion(issue.id)}>
                        <X className="h-4 w-4" />
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
