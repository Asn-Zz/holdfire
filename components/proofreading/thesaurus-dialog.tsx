"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import type { ThesaurusGroup, Correction } from "@/types/proofreading"
import { Plus, Trash2 } from "lucide-react"

interface ThesaurusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesauruses: ThesaurusGroup[]
  onAddGroup: (name: string) => void
  onDeleteGroup: (id: string) => void
  onToggleGroup: (id: string) => void
  onAddCorrection: (groupId: string, correction: Correction) => void
  onDeleteCorrection: (groupId: string, original: string) => void
}

export function ThesaurusDialog({
  open,
  onOpenChange,
  thesauruses,
  onAddGroup,
  onDeleteGroup,
  onToggleGroup,
  onAddCorrection,
  onDeleteCorrection,
}: ThesaurusDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(thesauruses[0]?.id || null)
  const [newGroupName, setNewGroupName] = useState("")
  const [newOriginal, setNewOriginal] = useState("")
  const [newSuggestion, setNewSuggestion] = useState("")

  const selectedGroup = thesauruses.find((g) => g.id === selectedGroupId)

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim())
      setNewGroupName("")
    }
  }

  const handleAddCorrection = () => {
    if (newOriginal.trim() && newSuggestion.trim() && selectedGroupId) {
      onAddCorrection(selectedGroupId, {
        original: newOriginal.trim(),
        suggestion: newSuggestion.trim(),
      })
      setNewOriginal("")
      setNewSuggestion("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>词库管理</DialogTitle>
          <DialogDescription>管理自定义词汇替换规则</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 h-[600px]">
          {/* Left Panel: Groups */}
          <div className="col-span-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                placeholder="新分组名"
              />
              <Button size="icon" onClick={handleAddGroup}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[520px]">
              <div className="space-y-1">
                {thesauruses.map((group) => (
                  <div
                    key={group.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGroupId === group.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={group.enabled}
                        onCheckedChange={() => onToggleGroup(group.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="truncate">
                        {group.name} ({group.corrections.length})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteGroup(group.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel: Corrections */}
          <div className="col-span-8 space-y-4">
            {selectedGroup ? (
              <>
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={newOriginal} onChange={(e) => setNewOriginal(e.target.value)} placeholder="原词" />
                    <Input
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCorrection()}
                      placeholder="建议词"
                    />
                  </div>
                  <Button onClick={handleAddCorrection} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    添加词对
                  </Button>
                </div>

                <ScrollArea className="h-[480px] rounded-lg border border-border">
                  <div className="divide-y divide-border">
                    {selectedGroup.corrections.map((correction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50">
                        <span className="text-sm">
                          原词 <span className="font-medium">{correction.original}</span> → 建议词{" "}
                          <span className="font-medium text-primary">{correction.suggestion}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDeleteCorrection(selectedGroup.id, correction.original)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <p>请先在左侧选择或创建一个词库分组</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
