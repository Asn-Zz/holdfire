"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "./proofreading/header"
import { Footer } from "./proofreading/footer"
import { InputSection } from "./proofreading/input-section"
import { ResultSection } from "./proofreading/result-section"
import { ConfigPanel } from "./proofreading/config-panel"
import { HistoryDialog } from "./proofreading/history-dialog"
import { ThesaurusDialog } from "./proofreading/thesaurus-dialog"
import { useProofreading } from "@/hooks/use-proofreading"
import eventBus from "@/lib/eventBus"

export function ProofreadingAssistant() {
  const [showConfig, setShowConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showThesaurus, setShowThesaurus] = useState(false)

  const router = useRouter()
  const proofreading = useProofreading()

  const authCode = new URL(window.location.href).searchParams.get('code') || ''

  useEffect(() => {
    eventBus.on("openThesaurusModal", async (text: string) => {
      setShowThesaurus(true);
      await navigator.clipboard.writeText(text);
    });

    if (authCode) {
      setShowConfig(true)
      router.replace('/')
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenThesaurus={() => setShowThesaurus(true)} />

      <div className="flex flex-col gap-8 container mx-auto px-4 py-8 max-w-7xl">
        <InputSection
          abortCheck={proofreading.abortCheck}
          config={proofreading.config}
          inputText={proofreading.inputText}
          setInputText={proofreading.setInputText}
          wordCount={proofreading.wordCount}
          isLoading={proofreading.isLoading}
          onCheck={proofreading.checkText}
          onClear={proofreading.clearInput}
          onLoadExample={proofreading.loadExample}
          onOpenConfig={() => setShowConfig(true)}
          charCount={proofreading.charCount}
        />

        {proofreading.apiError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">校对出错</p>
            <p className="text-sm text-muted-foreground mt-1">{proofreading.apiError}</p>
          </div>
        )}

        {proofreading.showResults && !proofreading.isLoading && (
          <ResultSection
            inputText={proofreading.inputText}
            issues={proofreading.issues}
            analyze={proofreading.analyze}
            onAcceptSuggestion={proofreading.acceptSuggestion}
            onIgnoreSuggestion={proofreading.ignoreSuggestion}
            onUnignoreSuggestion={proofreading.unignoreSuggestion}
            onFixAll={proofreading.fixAllIssues}
            onFixCategory={proofreading.fixCategoryIssues}
            onIgnoreCategory={proofreading.ignoreCategoryIssues}
          />
        )}

        <Footer />
      </div>

      <ConfigPanel
        authCode={authCode}
        open={showConfig}
        onOpenChange={setShowConfig}
        config={proofreading.config}
        onSave={proofreading.saveConfig}
        onReset={proofreading.resetConfig}
      />

      <HistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        history={proofreading.history}
        onRestore={proofreading.restoreFromHistory}
        onDelete={proofreading.deleteHistoryEntry}
        onClearAll={proofreading.clearAllHistory}
      />

      <ThesaurusDialog
        open={showThesaurus}
        onOpenChange={setShowThesaurus}
        thesauruses={proofreading.thesauruses}
        onAddGroup={proofreading.addThesaurusGroup}
        onDeleteGroup={proofreading.deleteThesaurusGroup}
        onToggleGroup={proofreading.toggleThesaurusGroup}
        onAddCorrection={proofreading.addCorrection}
        onDeleteCorrection={proofreading.deleteCorrection}
        onEditCorrection={proofreading.editCorrection}
      />

      {/* Floating History Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="查看历史记录"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 mx-auto"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>
    </div>
  )
}
