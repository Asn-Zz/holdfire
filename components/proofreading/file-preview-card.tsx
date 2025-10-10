"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, List } from "lucide-react"
import type { ParsedFile, Chapter } from "@/lib/file-parser"
import { useState, useEffect, useRef } from "react"

interface FilePreviewCardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: ParsedFile | null
  onConfirm: (text?: string) => void
}

export function FilePreviewCard({ open, onOpenChange, file, onConfirm }: FilePreviewCardProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      // Use pre-extracted chapters from the parsed file or extract them if not available
      const fileChapters = file.chapters || [];
      setChapters(fileChapters);
      
      // Select the first chapter by default
      if (fileChapters.length > 0) {
        const firstChapter = fileChapters[0];
        setSelectedChapter(firstChapter);
        setActiveChapterId(firstChapter.id);
      } else if (file.text) {
        // Fallback: if no chapters exist but we have text, create a single chapter for the full text
        const fallbackChapter: Chapter = {
          id: 'chapter-full',
          title: '全文',
          content: file.text,
        };
        setChapters([fallbackChapter]);
        setSelectedChapter(fallbackChapter);
        setActiveChapterId(fallbackChapter.id);
      }
    } else {
      setChapters([]);
      setSelectedChapter(null);
      setActiveChapterId(null);
    }
  }, [file]);

  if (!file) return null;

  if (!open || !file) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          文件预览
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
              <div className="p-3 border-b bg-muted/30">
                <h3 className="font-medium line-clamp-2">{selectedChapter?.title || '选择一个章节'}</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div ref={previewRef} className="whitespace-pre-wrap font-sans text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedChapter?.content || "请选择左侧的章节进行预览" }} />
              </ScrollArea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              style={{display: chapters.length > 1 ? "block" : "none"}}
              onClick={() => {
                onConfirm();
              }}
            >
              全部
            </Button>
            <Button
              onClick={() => {
                onConfirm(previewRef.current?.innerText);
              }}
            >
              使用此章节
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}