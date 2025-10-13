export type IssueCategory = "错别字" | "语法错误" | "标点符号" | "表达优化"

export interface Issue {
  id: number
  original: string
  suggestion: string
  reason: string
  category: IssueCategory
  start: number
  end: number
  fixed: boolean
  ignored: boolean
}

export interface ProofreadingConfig {
  apiUrl: string
  apiKey: string
  model: string
  firecrawlKey: string
  pollinationsKey: string
  customPrompt: string
}

export interface HistoryEntry {
  text: string
  issues: Issue[]
  timestamp: string
}

export interface Correction {
  original: string
  suggestion: string
}

export interface ThesaurusGroup {
  id: string
  name: string
  enabled: boolean
  corrections: Correction[]
}
