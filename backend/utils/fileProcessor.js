import fs from 'fs'
import path from 'path'

/**
 * Process different file types and extract content
 */
export async function processFile(file) {
  const { type, name, path: filePath, url } = file

  if (!filePath && !url) {
    return `[File: ${name}]`
  }

  const fullPath = filePath || path.join(process.cwd(), 'uploads', path.basename(url || ''))

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return `[File not found: ${name}]`
  }

  const ext = path.extname(name).toLowerCase().slice(1)

  try {
    // Images - return description (for AI vision processing)
    if (type?.startsWith('image/')) {
      return `[Image file: ${name}] - Image content available for visual analysis`
    }

    // PDF files
    if (type === 'application/pdf' || ext === 'pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const dataBuffer = fs.readFileSync(fullPath)
        const pdfData = await pdfParse(dataBuffer)
        return pdfData.text || `[Empty PDF: ${name}]`
      } catch (e) {
        return `[PDF file: ${name}] - Could not extract text`
      }
    }

    // Word documents
    if (ext === 'docx' || ext === 'doc') {
      try {
        const mammoth = (await import('mammoth')).default
        const result = await mammoth.extractRawText({ path: fullPath })
        return result.value || `[Empty document: ${name}]`
      } catch (e) {
        return `[Word document: ${name}] - Could not extract text`
      }
    }

    // Excel files
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      try {
        const XLSX = (await import('xlsx')).default
        const workbook = XLSX.readFile(fullPath)
        let content = ''
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName]
          const csvContent = XLSX.utils.sheet_to_csv(sheet)
          content += `\n--- Sheet: ${sheetName} ---\n${csvContent}\n`
        }
        return content || `[Empty spreadsheet: ${name}]`
      } catch (e) {
        return `[Spreadsheet: ${name}] - Could not extract data`
      }
    }

    // Text-based files (code, txt, json, yaml, md, etc.)
    const textExtensions = [
      'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'csv', 'tsv',
      'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs',
      'go', 'rb', 'php', 'html', 'css', 'scss', 'less', 'sql',
      'sh', 'bash', 'zsh', 'env', 'ini', 'cfg', 'conf', 'toml',
      'vue', 'svelte', 'dart', 'kotlin', 'swift', 'rust', 'r',
    ]

    if (textExtensions.includes(ext) || type?.startsWith('text/')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      return content
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      const stats = fs.statSync(fullPath)
      return `[Archive: ${name}] - Size: ${(stats.size / 1024).toFixed(2)}KB - Contains compressed files`
    }

    // Audio files
    if (type?.startsWith('audio/')) {
      return `[Audio file: ${name}] - Audio content for transcription/analysis`
    }

    // Video files
    if (type?.startsWith('video/')) {
      return `[Video file: ${name}] - Video content for analysis`
    }

    // Binary / unknown files
    const stats = fs.statSync(fullPath)
    return `[File: ${name}] - Type: ${type || 'unknown'} - Size: ${(stats.size / 1024).toFixed(2)}KB`

  } catch (error) {
    console.error(`Error processing file ${name}:`, error.message)
    return `[Error processing file: ${name} - ${error.message}]`
  }
}
