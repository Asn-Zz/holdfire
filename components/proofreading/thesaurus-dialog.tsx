"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import type { ThesaurusGroup, Correction } from "@/types/proofreading"
import { Plus, Trash2, Edit } from "lucide-react"

interface ThesaurusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesauruses: ThesaurusGroup[]
  onAddGroup: (name: string) => void
  onDeleteGroup: (id: string) => void
  onToggleGroup: (id: string) => void
  onAddCorrection: (groupId: string, correction: Correction) => void
  onDeleteCorrection: (groupId: string, original: string) => void
  onEditCorrection: (groupId: string, original: string, updatedCorrection: Correction) => void
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
  onEditCorrection,
}: ThesaurusDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(thesauruses[0]?.id || null)
  const [newGroupName, setNewGroupName] = useState("")
  const [newOriginal, setNewOriginal] = useState("")
  const [newSuggestion, setNewSuggestion] = useState("")
  const [editingCorrection, setEditingCorrection] = useState<{ original: string; suggestion: string } | null>(null)

  const selectedGroup = thesauruses.find((g) => g.id === selectedGroupId)

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim())
      setNewGroupName("")
    }
  }

  const handleAddCorrection = () => {
    if (newOriginal.trim() && newSuggestion.trim() && selectedGroupId) {
      if (editingCorrection) {
        onEditCorrection(selectedGroupId, editingCorrection.original, {
          original: newOriginal.trim(),
          suggestion: newSuggestion.trim(),
        })
        setEditingCorrection(null)
      } else {
        onAddCorrection(selectedGroupId, {
          original: newOriginal.trim(),
          suggestion: newSuggestion.trim(),
        })
      }
      setNewOriginal("")
      setNewSuggestion("")
    }
  }

  const startEditCorrection = (original: string, suggestion: string) => {
    setNewOriginal(original)
    setNewSuggestion(suggestion)
    setEditingCorrection({ original, suggestion })
  }

  const cancelEditCorrection = () => {
    setNewOriginal("")
    setNewSuggestion("")
    setEditingCorrection(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl flex flex-col">
        <DialogHeader>
          <DialogTitle>词库管理</DialogTitle>
          <DialogDescription>管理自定义词汇替换规则</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 flex-1">
          {/* Groups Section - Full width on mobile, side panel on desktop */}
          <div className="md:col-span-4 space-y-4">
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

            <ScrollArea className="max-h-[55vh]">
              <div className="space-y-1">
                {thesauruses.map((group) => (
                  <div
                    key={group.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
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
                      <span className="truncate text-sm">
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

          {/* Corrections Section - Full width on mobile, side panel on desktop */}
          <div className="md:col-span-8 space-y-4">
            {selectedGroup ? (
              <div className="flex flex-col gap-4">
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
                  <div className="flex gap-2">
                    <Button onClick={handleAddCorrection} className="flex-1">
                      {editingCorrection ? (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          更新词对
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          添加词对
                        </>
                      )}
                    </Button>
                    {editingCorrection && (
                      <Button variant="outline" onClick={cancelEditCorrection} className="flex-1">
                        取消
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[30vh] md:h-[45vh] rounded-lg border border-border">
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
                            onClick={() => startEditCorrection(correction.original, correction.suggestion)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>

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
              </div>
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
