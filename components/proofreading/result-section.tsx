"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertCircle, Wand2, EyeOff, Eye, GitCompareArrows } from "lucide-react"
import type { Issue, IssueCategory } from "@/types/proofreading"
import { IssueHighlight } from "./issue-highlight"
import { IssueList } from "./issue-list"

interface ResultSectionProps {
  inputText: string
  issues: Issue[]
  analyze: Record<string, any>
  onAcceptSuggestion: (id: number) => void
  onIgnoreSuggestion: (id: number) => void
  onUnignoreSuggestion: (id: number) => void
  onFixAll: () => void
  onFixCategory: (category: IssueCategory | "all") => void
  onIgnoreCategory: (category: IssueCategory | "all") => void
}

const CATEGORIES: { value: IssueCategory | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "错别字", label: "错别字" },
  { value: "语法错误", label: "语法错误" },
  { value: "标点符号", label: "标点符号" },
  { value: "表达优化", label: "表达优化" },
]

export function ResultSection({
  inputText,
  issues,
  analyze,
  onAcceptSuggestion,
  onIgnoreSuggestion,
  onUnignoreSuggestion,
  onFixAll,
  onFixCategory,
  onIgnoreCategory,
}: ResultSectionProps) {  
  const [showDiff, setShowDiff] = useState(false)
  const [activeCategory, setActiveCategory] = useState<IssueCategory | "all">("all")
  const [showIgnored, setShowIgnored] = useState(true)

  const activeIssues = useMemo(() => issues.filter((i) => !i.ignored), [issues])
  const unfixedCount = useMemo(() => activeIssues.filter((i) => !i.fixed).length, [activeIssues])
  const ignoredCount = useMemo(() => issues.filter((i) => i.ignored).length, [issues])

  const filteredIssues = useMemo(() => {
    let filtered = showIgnored ? issues : activeIssues
    if (activeCategory !== "all") {
      filtered = filtered.filter((i) => i.category === activeCategory)
    }
    return filtered
  }, [issues, activeIssues, activeCategory, showIgnored])

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { all: issues.length }
    CATEGORIES.forEach((cat) => {
      if (cat.value !== "all") {
        counts[cat.value] = issues.filter((i) => i.category === cat.value).length
      }
    })
    return counts
  }, [issues])

  const unfixedInCategory = useMemo(() => {
    return filteredIssues.filter((i) => !i.fixed && !i.ignored).length
  }, [filteredIssues])

  useEffect(() => {
    return () => {
      setShowDiff(false)
    }
  }, [inputText])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              校对结果
            </div>

            {unfixedCount === 0 && <Button size="sm" onClick={() => setShowDiff(!showDiff)}>
              <GitCompareArrows className="h-4 w-4" /> {showDiff ? "隐藏对比" : "查看对比"}
            </Button>}
          </CardTitle>

          {activeIssues.length > 0 && unfixedCount > 0 && (
            <div className="flex items-center gap-2">
              {ignoredCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowIgnored(!showIgnored)}>
                  {showIgnored ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showIgnored ? "隐藏已忽略" : "显示已忽略"}
                </Button>
              )}

              {activeCategory !== "all" && unfixedInCategory > 0 && (
                <Button variant="outline" size="sm" onClick={() => onIgnoreCategory(activeCategory)}>
                  <EyeOff className="h-4 w-4" />
                  忽略此分类
                </Button>
              )}

              <Button size="sm" onClick={() => onFixCategory(activeCategory)}>
                <Wand2 className="h-4 w-4" />
                {activeCategory === "all" ? `修复全部 (${unfixedInCategory})` : `修复分类 (${unfixedInCategory})`}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        {activeIssues.length > 0 ? (
          <div
            className={`p-4 rounded-lg border ${unfixedCount > 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}
          >
            <div className="flex items-center gap-3">
              {unfixedCount > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                {unfixedCount > 0 ? (
                  <p className="text-sm text-foreground">
                    共发现<span className="font-semibold mx-1">{activeIssues.length}</span>个问题，还有
                    <span className="font-semibold mx-1">{unfixedCount}</span>个待处理。
                    将鼠标悬停在下方高亮文本上查看修改建议，修改后更新到上方输入框。
                  </p>
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    太棒了！所有问题都已修复。最终文本已更新到上方输入框。
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">未发现明显问题，您的文章质量很高！</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {showDiff && (
            <IssueHighlight
              inputText={inputText}
              issues={issues.map((i) => ({ ...i, fixed: false }))}
              activeCategory={activeCategory}
              onAcceptSuggestion={onAcceptSuggestion}
              onIgnoreSuggestion={onIgnoreSuggestion}
            />
          )}

          <IssueHighlight
            inputText={inputText}
            issues={showIgnored ? issues : activeIssues}
            activeCategory={activeCategory}
            onAcceptSuggestion={onAcceptSuggestion}
            onIgnoreSuggestion={onIgnoreSuggestion}
          />
        </div>

        {/* Issue List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">问题列表</h3>
            {analyze.tokens && <span className="text-xs text-muted-foreground">
              {`首字: ${analyze?.firstTime}S ｜ 总耗时: ${analyze?.allTime}S ｜ 词数: ${analyze?.tokens}`}
            </span>}
          </div>

          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as IssueCategory | "all")}>
            <TabsList className="w-full justify-start overflow-y-auto bg-muted scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
                  {cat.label}
                  <Badge variant="secondary" className="ml-1">
                    {categoryCount[cat.value] || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <IssueList
            issues={filteredIssues}
            onAcceptSuggestion={onAcceptSuggestion}
            onIgnoreSuggestion={onIgnoreSuggestion}
            onUnignoreSuggestion={onUnignoreSuggestion}
          />
        </div>
      </CardContent>
    </Card>
  )
}
