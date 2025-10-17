"use client"

import { useMemo, useState } from "react"
import type { Issue, IssueCategory } from "@/types/proofreading"
import { Button } from "@/components/ui/button"
import { X, Languages, BookOpen, Search } from "lucide-react"
import eventBus from "@/lib/eventBus"

interface IssueHighlightProps {
  inputText: string
  issues: Issue[]
  activeCategory: IssueCategory | "all"
  onAcceptSuggestion: (id: number) => void
  onIgnoreSuggestion: (id: number) => void
}

export function IssueHighlight({
  inputText,
  issues,
  activeCategory,
  onAcceptSuggestion,
  onIgnoreSuggestion,
}: IssueHighlightProps) {
  const segments = useMemo(() => {
    if (issues.length === 0) {
      return [{ type: "text" as const, content: inputText }]
    }

    const sortedIssues = [...issues].sort((a, b) => a.start - b.start)
    const result: Array<{ type: "text" | "highlight"; content: string; issue?: Issue }> = []
    let lastIndex = 0

    sortedIssues.forEach((issue) => {
      if (issue.start > lastIndex) {
        result.push({
          type: "text",
          content: inputText.substring(lastIndex, issue.start),
        })
      }
      result.push({
        type: "highlight",
        content: inputText.substring(issue.start, issue.end),
        issue,
      })
      lastIndex = issue.end
    })

    if (lastIndex < inputText.length) {
      result.push({
        type: "text",
        content: inputText.substring(lastIndex),
      })
    }

    return result
  }, [inputText, issues])

  const getHighlightClass = (issue: Issue) => {
    if (issue.fixed) return "highlight-fixed"
    if (issue.ignored) return "highlight-ignored"

    const isActive = activeCategory === "all" || activeCategory === issue.category

    const baseClass =
      {
        错别字: "highlight-error",
        语法错误: "highlight-warning",
        标点符号: "highlight-suggest",
        表达优化: "highlight-info",
      }[issue.category] || "highlight-info"

    return `${baseClass} ${!isActive ? "opacity-30" : ""}`
  }

  const [searchPopup, setSearchPopup] = useState<{ visible: boolean; x: number; y: number; text: string } | null>(null);
  const handleTextSelection = () => {                                                                
    const selection = window.getSelection();                                                                   
    const selectedText = selection?.toString().trim();                                                         
    const resultArea = document.getElementById('result-text-area');   
    
    if (selectedText && selection && resultArea) {                                                             
      const range = selection.getRangeAt(0);                                                                 
      const rect = range.getBoundingClientRect();                                                            
      const containerRect = resultArea.getBoundingClientRect();                                             
      setSearchPopup({                                                                                      
        visible: true,                                                                                     
        x: rect.left - containerRect.left + rect.width / 2 - 75, // Adjust for icon size                   
        y: rect.top - containerRect.top - 40, // Position above selection                                  
        text: selectedText,                                                                                
      });                                                                                                    
    } else {                                                                                                   
      setSearchPopup(null);                                                                                  
    }                                                                                                          
  };

  return (
    <>
      <div id="result-text-area" className="flex-1 relative p-6 rounded-lg bg-card border border-border min-h-[200px] whitespace-pre-wrap leading-relaxed" onMouseUp={handleTextSelection}>
        {searchPopup?.visible && (
            <div 
                className='absolute z-10 flex bg-white rounded-lg shadow-lg overflow-hidden' 
                style={{ left: searchPopup.x, top: searchPopup.y }} 
                onMouseDown={(e) => e.preventDefault()}
            >
                <a 
                    href={`https://www.shenyandayi.com/wantWordsResult?query=${encodeURIComponent(searchPopup.text)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 border-r border-gray-100 hover:bg-gray-100"  
                    title="近义词查询"
                >
                    <Languages className="w-4 h-4 text-green-500" /> 
                </a>

                <a 
                    href={`https://cn.bing.com/search?q=${encodeURIComponent(searchPopup.text)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 border-r border-gray-100 hover:bg-gray-100"  
                    title="网页搜索"
                >
                    <Search className="w-4 h-4 text-blue-500" />
                </a>

                <button 
                    onClick={() => eventBus.emit('openThesaurusModal', searchPopup.text)}
                    className="px-4 py-2 hover:bg-gray-100"
                    title="打开词库"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </button>
            </div>
        )}

        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return <span key={index}>{segment.content}</span>
          }

          const issue = segment.issue!
          return (
            <span key={index} className={`relative group cursor-pointer ${getHighlightClass(issue)}`}>
              {issue.fixed ? segment.content : segment.content ? segment.issue?.original : segment.content}
              {!issue.fixed && !issue.ignored && (
                <div className="suggestion-popup absolute bottom-full mb-2 left-0 hidden group-hover:block group-active:block z-10 min-w-[200px]">
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                    <div className="text-xs font-medium text-destructive mb-1">问题：{issue.reason}</div>
                    <div className="text-xs mb-2">
                      建议修改为：<span className="font-medium text-green-500">{issue.suggestion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => onAcceptSuggestion(issue.id)}>
                        接受建议
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => onIgnoreSuggestion(issue.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </span>
          )
        })}
      </div>

      <style>
        {`
        .opacity-30 .suggestion-popup {
          display: none;
        }
        .suggestion-popup:before {
          content: "";
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 10px;
        }
        .suggestion-popup:after {
          content: "";
          position: absolute;
          top: calc(100% - 1px);
          left: 10%;
          border: 6px solid transparent;
          border-top-color: white;
        }
        `}
      </style>
    </>
  )
}
