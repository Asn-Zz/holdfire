"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, List, Loader2 } from "lucide-react"
import type { ParsedFile, Chapter } from "@/lib/file-parser"
import { useState, useEffect, useRef } from "react"

interface FilePreviewCardProps {
  open: boolean
  file: ParsedFile | null
  onConfirm: (text: string) => void
  onTransfer: (text: string) => Promise<void>
}

export function FilePreviewCard({ open, file, onConfirm, onTransfer }: FilePreviewCardProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isTransferring, setIsTransferring] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const fallbackChapter: Chapter = {
        id: 'chapter-full',
        title: '全文（纯文本）',
        content: file.text,
      };

      // Use pre-extracted chapters from the parsed file or extract them if not available
      const fileChapters = [fallbackChapter, ...(file.chapters || [])];
      setChapters(fileChapters);
      
      // Select the first chapter by default
      if (fileChapters.length > 0) {
        const firstChapter = fileChapters[0];
        setSelectedChapter(firstChapter);
        setActiveChapterId(firstChapter.id);
      }
    } else {
      setChapters([]);
      setSelectedChapter(null);
      setActiveChapterId(null);
    }
  }, [file]);

  const onTransferFile = () => {
    const innerText = previewRef.current?.innerText || ''

    setIsTransferring(true)
    onTransfer(innerText).finally(() => {
      setIsTransferring(false)
    })
  }

  if (!file) return null;

  if (!open || !file) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> 文件预览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{file.metadata.fileName}</Badge>
            <Badge variant="outline">{file.metadata.fileType.toUpperCase()}</Badge>
            <Badge variant="outline">{file.metadata.wordCount} 字符</Badge>
            {file.metadata.pageCount && <Badge variant="outline">{file.metadata.pageCount} 页</Badge>}
          </div>

          {/* Two-column layout for chapters and content */}
          <div className="flex gap-4 h-[400px]">
            {/* Left column - Chapters list */}
            <div className="w-1/4 flex flex-col border rounded-md">
              <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="font-medium">章节列表</span>
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                  {chapters.map((chapter) => (
                    <Button
                      key={chapter.id}
                      variant={activeChapterId === chapter.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto py-2 px-3 text-left"
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setActiveChapterId(chapter.id);
                      }}
                    >
                      <span className="truncate text-sm">{chapter.title}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right column - Chapter content */}
            <div className="w-3/4 flex flex-col border rounded-md">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <h3 className="font-medium line-clamp-2">{selectedChapter?.title || '选择一个章节'}</h3>
                <span className="text-xs text-muted-foreground">{selectedChapter?.content.length} 字符</span>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div ref={previewRef} className="whitespace-pre-wrap font-sans text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedChapter?.content || "请选择左侧的章节进行预览" }} />
              </ScrollArea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {file.metadata.fileType !== 'md' && <Button onClick={onTransferFile} disabled={isTransferring} className="disabled:opacity-50">
              {isTransferring ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 转换中...</> : '转 Markdown'}
            </Button>}

            <Button
              onClick={() => {
                onConfirm(previewRef.current?.innerText || '');
              }}
            >
              选择当前文本
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}