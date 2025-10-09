"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { ParsedFile } from "@/lib/file-parser"

interface FilePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: ParsedFile | null
  onConfirm: () => void
}

export function FilePreviewDialog({ open, onOpenChange, file, onConfirm }: FilePreviewDialogProps) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            文件预览
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{file.metadata.fileName}</Badge>
            <Badge variant="outline">{file.metadata.fileType.toUpperCase()}</Badge>
            <Badge variant="outline">{file.metadata.wordCount} 字符</Badge>
            {file.metadata.pageCount && <Badge variant="outline">{file.metadata.pageCount} 页</Badge>}
          </div>

          {/* File content preview */}
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{file.text}</div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              使用此文本
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
