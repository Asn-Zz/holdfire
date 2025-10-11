import type { ProofreadingConfig } from "@/types/proofreading"

export default async function fetchSSE(
    config: ProofreadingConfig,
    inputText: string,
    onChunk: (chunk: string) => void,
) {
    const controller = new AbortController()
    const signal = controller.signal

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
                { role: "user", content: inputText },
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
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const jsonLine = line.slice(6)
                if (jsonLine === "[DONE]") continue;

                const data = JSON.parse(jsonLine)
                content += data.choices[0]?.delta?.content || ''
                onChunk(content)
            }
        }
    }

    return {
        content,
        abort: () => controller.abort(),
    }
}
