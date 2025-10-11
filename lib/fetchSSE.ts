import type { ProofreadingConfig } from "@/types/proofreading"

interface fetchSSEParams extends ProofreadingConfig {
    inputText: string,
    controller: AbortController,
    onChunk: (chunk: string) => void,
}

export default async function fetchSSE(config: fetchSSEParams) {
    const startTime = new Date();
    const signal = config.controller.signal
    const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: config.customPrompt },
                { role: "user", content: config.inputText },
            ],
            stream: true,
            temperature: 0.1,
            response_format: { type: "json_object" },
        }),
        signal,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
        throw new Error("No reader available")
    }

    let content = ""
    let analyze = { firstTime: "", allTime: "", tokens: 0 };
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        analyze.firstTime = analyze.firstTime || ((new Date().getTime() - startTime.getTime()) / 1000).toFixed(2)
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const jsonLine = line.slice(6)
                if (jsonLine === "[DONE]") continue;

                const data = JSON.parse(jsonLine)
                content += data.choices[0]?.delta?.content || ''
                config?.onChunk(content)
            }
        }
    }

    analyze.allTime = ((new Date().getTime() - startTime.getTime()) / 1000).toFixed(2)
    analyze.tokens = content.length

    return {
        content,
        analyze,
    }
}
