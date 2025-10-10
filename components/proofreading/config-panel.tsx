"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProofreadingConfig } from "@/types/proofreading"
import { Save, RotateCcw } from "lucide-react"

interface ConfigPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: ProofreadingConfig
  onConfigChange: (config: Partial<ProofreadingConfig>) => void
  onSave: () => void
  onReset: () => void
}

export function ConfigPanel({ open, onOpenChange, config, onConfigChange, onSave, onReset }: ConfigPanelProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const fetchOpenAIModels = async () => {
    try {
      const [modelUrl] = config.apiUrl.split('/chat');
      const response = await fetch(`${modelUrl}/models`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
      });

      if (!response.ok) throw new Error('无法获取模型列表');

      const res = await response.json();
      if (res.data) {
        const models = res.data.map((m: Record<string, unknown>) => m.id as string);
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(config.model)) {
          onConfigChange({ model: models[0] });
        }

        return models;
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>校对配置</DialogTitle>
          <DialogDescription>配置 AI 校对 API 和校对参数</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              value={config.apiUrl}
              onChange={(e) => onConfigChange({ apiUrl: e.target.value })}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>

            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => onConfigChange({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型</Label>
            <div className="flex gap-2">
              {availableModels.length > 0 ? (
                <Select value={config.model} onValueChange={(value) => onConfigChange({ model: value as any })}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="model"
                  value={config.model}
                  onChange={(e) => onConfigChange({ model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                />
              )}
              <Button onClick={fetchOpenAIModels}>获取</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity">校对强度</Label>
            <Select value={config.intensity} onValueChange={(value) => onConfigChange({ intensity: value as any })}>
              <SelectTrigger id="intensity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gentle">轻度</SelectItem>
                <SelectItem value="moderate">中度</SelectItem>
                <SelectItem value="strict">严格</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">自定义提示词</Label>
            <Textarea
              id="customPrompt"
              value={config.customPrompt}
              onChange={(e) => onConfigChange({ customPrompt: e.target.value })}
              placeholder="你是一个专业的文章校对编辑..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            恢复默认
          </Button>
          <Button
            onClick={() => {
              onSave()
              onOpenChange(false)
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            保存配置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
