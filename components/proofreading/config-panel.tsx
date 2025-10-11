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
import { DEFAULT_CONFIG } from "@/hooks/use-proofreading"
import { useLocalStorage } from "@/hooks/use-localStorage"

interface ConfigPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: ProofreadingConfig
  onSave: (config: ProofreadingConfig) => void
  onReset: () => void
}

export function ConfigPanel({ open, onOpenChange, config, onSave, onReset }: ConfigPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tempConfig, setTempConfig] = useState({ ...config });
  const [availableModels, setAvailableModels] = useLocalStorage<string[]>('availableModels', []);

  const fetchOpenAIModels = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const [modelUrl] = tempConfig.apiUrl.split('/chat');
      const response = await fetch(`${modelUrl}/models`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempConfig.apiKey}`,
        },
      }); 

      if (!response.ok) throw new Error('无法获取模型列表');

      const res = await response.json();
      if (res.data) {
        const models = res.data.map((m: Record<string, unknown>) => m.id || m.root || "");
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(tempConfig.model)) {
          setTempConfig({ ...tempConfig, model: models[0] });
        }

        return models;
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setIsLoading(false);
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
              value={tempConfig.apiUrl}
              onChange={(e) => setTempConfig({ ...tempConfig, apiUrl: e.target.value })}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>

            <Input
              id="apiKey"
              type="password"
              value={tempConfig.apiKey}
              onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型</Label>
            <div className="flex gap-2">
              {availableModels.length > 0 ? (
                <Select value={tempConfig.model} onValueChange={(value) => setTempConfig({ ...tempConfig, model: value as any })}>
                  <SelectTrigger className="w-full" id="model">
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
                  value={tempConfig.model}
                  onChange={(e) => setTempConfig({ ...tempConfig, model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                />
              )}
              {tempConfig.apiUrl && tempConfig.apiKey && <Button onClick={fetchOpenAIModels} disabled={isLoading} className="disabled:opacity-50">获取</Button>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between" htmlFor="firecrawlKey">
              <span>firecrawl Key（可选）</span>
              <a href="https://firecrawl.dev" target="_blank" className="text-xs text-primary">获取链接</a>
            </Label>

            <Input
              id="firecrawlKey"
              type="password"
              value={tempConfig.firecrawlKey}
              onChange={(e) => setTempConfig({ ...tempConfig, firecrawlKey: e.target.value })}
              placeholder="fc-..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">自定义提示词</Label>
            <Textarea
              id="customPrompt"
              value={tempConfig.customPrompt}
              onChange={(e) => setTempConfig({ ...tempConfig, customPrompt: e.target.value })}
              placeholder="你是一个专业的文章校对编辑..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" 
            onClick={() => {
              setTempConfig(DEFAULT_CONFIG)
              onReset()
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            恢复默认
          </Button>
          <Button
            onClick={() => {
              onSave(tempConfig)
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
