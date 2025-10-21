"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Languages, Server, Search, ArrowRightLeft, Link, HistoryIcon, Lightbulb, Loader2 } from "lucide-react"
import { useProofreading } from "@/hooks/use-proofreading"
import { generateDiffMarkup, DiffItem, delay } from "@/lib/utils"
import { Header } from "./proofreading/header"
import { Footer } from "./proofreading/footer"
import { ConfigPanel } from "./proofreading/config-panel"
import { HistoryDialog } from "./proofreading/history-dialog"
import { TextInput } from "./different/text-input"
import { TextOutput } from "./different/text-output"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { HistoryEntry } from "@/types/proofreading"

export function DiffAssistant() {
  const [showConfig, setShowConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const proofreading = useProofreading()
  const authCode = useSearchParams().get('code') || ''

  const [inputLeft, setInputLeft] = useState('')
  const [inputRight, setInputRight] = useState('')

  const [leftDiff, setLeftDiff] = useState<DiffItem[]>([])
  const [rightDiff, setRightDiff] = useState<DiffItem[]>([])
  const [loading, setLoading] = useState(false)
  const disabled = useMemo(() => inputLeft.length === 0 || inputRight.length === 0, [inputLeft, inputRight])
  const analyze = useMemo(() => ({
    update: rightDiff.filter(item => item.type === 'update').length,
    add: leftDiff.concat(rightDiff).filter(item => item.type === 'add').length,
    result: leftDiff.concat(rightDiff).length,
  }), [leftDiff, rightDiff])

  const generateDiff = async () => {
    setLoading(true)
    const leftDiff = generateDiffMarkup(inputLeft, inputRight)
    const rightDiff = generateDiffMarkup(inputRight, inputLeft)

    await delay(500)
    setLeftDiff(leftDiff.filter(item => item.type !== 'del'))
    setRightDiff(rightDiff.filter(item => item.type !== 'del'))    
    setLoading(false)
  }

  const onLoadExample = () => {
    setInputLeft(`太阳徐徐升起，给大地带来了早晨的气息。小名从梦中惊醒，他揉了揉眼睛，发先已经9点了。
他慌张的穿上衣服，拿起手提包就像着学校奔去。路上，他遇到了几个同班同学，他们一个个都在得意的笑着，原来，今天是星期六，没有课。
小明停下了脚本，仔细的想了想，确实，昨天是星期五，所以今天应该没有上课。他懊恼的拍了拍脑袋，自言自语道："我记忆力怎么这么差啊！"
回到家后，妈妈正在做饭。"你去哪了？"妈妈问道。小名有点心虚的回答"我以为今天有课，差点去学校上课了。"妈妈哈哈大笑，说道："你呀，真是太马虎了，连今天星期几都能记错。"
小明想起上周也发生过类似的一件事情，他把语文老师留的作业给忘记了，结果被老师在全班面前批评，他真的很伤心；
人们常说"书读百变，其义自现。"小明觉的这句话特别有道理。他决定从明天开始，每天写一篇读书笔记，提高自己的阅读理解能力。我是新增的`)
    setInputRight(`太阳徐徐升起，给大地带来了早晨的气息。他揉了揉眼睛，发现已经9点了。
他慌张地穿上衣服，拿起手提包就向着学校奔去。路上，他遇到了几个同班同学，他们一个个都在得意的笑着，原来，今天是星期六，没有课。
小明停下了脚步，仔细地想了想，确实，昨天是星期五，所以今天应该没有上课。他懊恼的拍了拍脑袋，自言自语道："我记忆力怎么这么差啊！"
回到家后，妈妈正在做饭。"你去哪了？"妈妈问道。小明有点尴尬的回答"我以为今天有课，差点去学校上课了。"妈妈哈哈大笑，说道："你呀，真是太马虎了，连今天星期几都能记错。"
小明想起上周也发生过类似的一件事情，他把语文教师留的作业给忘记了，结果被老师在全班面前批评，他真的很伤心。
人们常说"书读百遍，其义自见。"小明觉得这句话特别有道理。他决定从明天开始，每天写一篇读书笔记，提高自己的阅读理解能力。`)
  }

  const restoreFromHistory = (entry: HistoryEntry) => {
    setInputLeft(entry.text)

    const fixedText = entry.issues.reduce((text, issue) => {
      return text.replace(issue.original, issue.suggestion)
    }, entry.text)

    setInputRight(fixedText)
  }

  const onClear = () => {
    window.scrollTo({ top: 0 })
    window.location.reload()
  }

  const onReverse = () => {
    setInputLeft(inputRight)
    setInputRight(inputLeft)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenConfig={() => setShowConfig(true)} />

      <div className="flex flex-col gap-8 container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />输入文本
              </span>
              <a href="https://changfengbox.top/wechat" target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Link className="h-3 w-3" />
                文章在线下载
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-start gap-4`}>
              <TextInput config={proofreading.config} inputText={inputLeft} setInputText={setInputLeft} />
              <TextInput config={proofreading.config} inputText={inputRight} setInputText={setInputRight} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onLoadExample}>
                  <Lightbulb className="h-4 w-4" />
                  示例
                </Button>

                <Button variant="outline" onClick={onReverse}>
                  <ArrowRightLeft className="h-4 w-4" />
                  转换
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
                  清空
                </Button>
                <Button onClick={generateDiff} disabled={loading || disabled} className="disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  比对文本
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {leftDiff.length > 0 && <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-end justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-500 rotate-90" />比对结果
                </span>

                {analyze.result > 0 && <span className="text-xs text-muted-foreground">
                  统计：{`更改: ${analyze?.update}、不同: ${analyze?.add}`}
                </span>}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-start gap-4`}>
              <TextOutput diff={leftDiff}/>
              <TextOutput diff={rightDiff}/>
            </div>
          </CardContent>
        </Card>}

        <Footer />
      </div>

      <ConfigPanel
        authCode={authCode}
        open={showConfig}
        onOpenChange={setShowConfig}
        config={proofreading.config}
        onSave={proofreading.saveConfig}
        onReset={proofreading.resetConfig}
      />

      <HistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        history={proofreading.history}
        onRestore={restoreFromHistory}
        onDelete={proofreading.deleteHistoryEntry}
        onClearAll={proofreading.clearAllHistory}
      />

      {/* Floating History Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-5 right-4 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="查看历史记录"
      >
        <HistoryIcon className="w-4 h-4 mx-auto" />
      </button>
    </div>
  )
}
