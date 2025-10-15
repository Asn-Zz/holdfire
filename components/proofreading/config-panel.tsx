"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProofreadingConfig } from "@/types/proofreading"
import { Save, RotateCcw, Lock, Eye, EyeClosed } from "lucide-react"
import { DEFAULT_CONFIG } from "@/hooks/use-proofreading"
import { useLocalStorage } from "@/hooks/use-localStorage"
import { usePrompt } from "@/components/prompt-provider"

interface ConfigPanelProps {
  authCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  config: ProofreadingConfig
  onSave: (config: ProofreadingConfig) => void
  onReset: () => void
}

export function ConfigPanel({ authCode, open, onOpenChange, config, onSave, onReset }: ConfigPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tempConfig, setTempConfig] = useState({ ...config });
  const [keyVisible, setKeyVisible] = useState(false)
  const [availableModels, setAvailableModels] = useLocalStorage<string[]>('availableModels', []);
  const { showPrompt } = usePrompt();

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
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthAdmin = async () => {
    if (isLoading) return;
    const code = authCode || await showPrompt("请输入访问密码");
    if (code !== process.env.NEXT_PUBLIC_AUTH_TOKEN) { return }

    setIsLoading(true);
    try {      
      const res = await fetch(process.env.NEXT_PUBLIC_CONFIG_URL || '')
      const data = await res.json()
      setTempConfig(data)
      fetchOpenAIModels()
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (authCode) handleAuthAdmin()
  }, [authCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>校对配置</DialogTitle>
          <DialogDescription>标准 OpenAI API 格式</DialogDescription>
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

            <div className="relative flex gap-2">
              <Input
                id="apiKey"
                type={keyVisible ? "text" : "password"}
                value={tempConfig.apiKey}
                onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                placeholder="sk-..."
                className="pr-7"
              />

              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-primary" onClick={() => setKeyVisible(!keyVisible)}>
                {keyVisible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            </div>
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
              {tempConfig.apiUrl && tempConfig.apiKey && 
                <Button 
                  onClick={fetchOpenAIModels} 
                  disabled={isLoading}
                  variant="secondary"
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-4 w-4" />
                  获取列表
                </Button>
              }
            </div>
          </div>

          <div className="space-y-2 grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="flex items-center justify-between" htmlFor="firecrawlKey">
                <span>firecrawl Key</span>
                <a href="https://firecrawl.dev" target="_blank" className="text-xs text-primary">获取链接</a>
              </Label>

              <Input
                id="firecrawlKey"
                type="password"
                value={tempConfig.firecrawlKey}
                onChange={(e) => setTempConfig({ ...tempConfig, firecrawlKey: e.target.value })}
                placeholder="fc-..."
              />

              <p className="text-xs text-muted-foreground">可选，用于解析链接，获取文章内容</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center justify-between" htmlFor="pollinationsKey">
                <span>pollinations Key</span>
                <a href="https://auth.pollinations.ai" target="_blank" className="text-xs text-primary">获取链接</a>
              </Label>

              <Input
                id="pollinationsKey"
                type="password"
                value={tempConfig.pollinationsKey}
                onChange={(e) => setTempConfig({ ...tempConfig, pollinationsKey: e.target.value })}
                placeholder="xxxx_xxxx"
              />

              <p className="text-xs text-muted-foreground">可选，多模态支持，提供图片、音频、搜索等功能</p>
            </div>
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

        <div className="flex justify-between gap-2">
          <Button 
            onClick={handleAuthAdmin}
            variant="secondary"
            disabled={isLoading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            访问密码
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" 
              onClick={() => {
                setTempConfig(DEFAULT_CONFIG)
                onReset()
              }}
            >
              <RotateCcw className="h-4 w-4" />
              恢复默认
            </Button>
            <Button
              onClick={() => {
                onSave(tempConfig)
                onOpenChange(false)
              }}
              disabled={isLoading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              保存配置
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
