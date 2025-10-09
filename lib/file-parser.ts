// File parsing utilities for Word, PDF, and text files

export interface ParsedFile {
  text: string
  metadata: {
    fileName: string
    fileType: string
    pageCount?: number
    wordCount: number
  }
}

/**
 * Parse DOCX files using mammoth
 */
export async function parseDocx(file: File): Promise<ParsedFile> {
  try {
    const mammoth = await import("mammoth")
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    return {
      text: result.value,
      metadata: {
        fileName: file.name,
        fileType: "docx",
        wordCount: result.value.length,
      },
    }
  } catch (error) {
    console.error("[v0] Error parsing DOCX:", error)
    throw new Error("无法解析 Word 文档，请确保文件格式正确")
  }
}

/**
 * Parse PDF files using pdf-parse
 */
export async function parsePdf(file: File): Promise<ParsedFile> {
  try {
    const pdfjsLib = await import("pdfjs-dist")

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n\n"
    }

    return {
      text: fullText.trim(),
      metadata: {
        fileName: file.name,
        fileType: "pdf",
        pageCount: pdf.numPages,
        wordCount: fullText.length,
      },
    }
  } catch (error) {
    console.error("[v0] Error parsing PDF:", error)
    throw new Error("无法解析 PDF 文档，请确保文件格式正确")
  }
}

/**
 * Parse plain text files
 */
export async function parseText(file: File): Promise<ParsedFile> {
  try {
    const text = await file.text()

    return {
      text,
      metadata: {
        fileName: file.name,
        fileType: file.name.split(".").pop()?.toLowerCase() || "txt",
        wordCount: text.length,
      },
    }
  } catch (error) {
    console.error("[v0] Error parsing text file:", error)
    throw new Error("无法读取文本文件")
  }
}

/**
 * Main file parser that routes to appropriate parser based on file type
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith(".docx")) {
    return parseDocx(file)
  } else if (fileName.endsWith(".pdf")) {
    return parsePdf(file)
  } else if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
    return parseText(file)
  } else {
    throw new Error("不支持的文件格式。请上传 TXT, MD, DOCX 或 PDF 文件")
  }
}
