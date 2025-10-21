import { DiffItem } from "@/lib/utils"

interface TextOutputProps {
    diff: DiffItem[]
}

export function TextOutput({ diff }: TextOutputProps) {    
    const getHighlightClass = (item: DiffItem) => {
        const keyMap = {
            update: "highlight-warning",
            del: "highlight-error",
            add: "highlight-fixed",
        }
        return keyMap[item.type as keyof typeof keyMap] || ""
    }
      
    return (
        <div className="flex-1 relative px-3 py-2 rounded-lg bg-card border border-border min-h-[200px] whitespace-pre-wrap leading-relaxed text-sm">
            {diff.map((item, index) => (
                <span key={index} className={getHighlightClass(item)}>{item.content}</span>
            ))}
        </div>
    )
}