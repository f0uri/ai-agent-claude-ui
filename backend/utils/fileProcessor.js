import fs from 'fs'
import path from 'path'

const TEXT_EXTENSIONS = [
  'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'csv', 'tsv',
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs',
  'go', 'rb', 'php', 'html', 'css', 'scss', 'less', 'sql',
  'sh', 'bash', 'zsh', 'env', 'ini', 'cfg', 'conf', 'toml',
  'vue', 'svelte', 'dart', 'kotlin', 'swift', 'rust', 'r',
]

function parseDataUrl(value) {
  if (typeof value !== 'string') return null
  const match = value.match(/^data:([^;,]+)?(;base64)?,(.*)$/s)
  if (!match) return null

  const [, mimeType = '', isBase64, data = ''] = match
  const buffer = isBase64
    ? Buffer.from(data, 'base64')
    : Buffer.from(decodeURIComponent(data), 'utf8')

  return { mimeType, buffer }
}

function resolveUploadedPath(filePath, url) {
  if (filePath) return filePath
  if (!url || url.startsWith('data:')) return null
  return path.join(process.cwd(), 'uploads', path.basename(url))
}

function getExtension(name = '') {
  return path.extname(name).toLowerCase().slice(1)
}

function isTextFile(type = '', ext = '') {
  return type.startsWith('text/') || TEXT_EXTENSIONS.includes(ext)
}

async function extractPdf(buffer, fullPath, name) {
  try {
    const pdfParse = (await import('pdf-parse')).default
    const pdfData = await pdfParse(buffer || fs.readFileSync(fullPath))
    return pdfData.text || `[Empty PDF: ${name}]`
  } catch (e) {
    return `[PDF file: ${name}] - Could not extract text`
  }
}

async function extractWord(buffer, fullPath, name) {
  try {
    const mammoth = (await import('mammoth')).default
    const result = buffer
      ? await mammoth.extractRawText({ buffer })
      : await mammoth.extractRawText({ path: fullPath })
    return result.value || `[Empty document: ${name}]`
  } catch (e) {
    return `[Word document: ${name}] - Could not extract text`
  }
}

async function extractSpreadsheet(buffer, fullPath, name) {
  try {
    const XLSX = (await import('xlsx')).default
    const workbook = buffer
      ? XLSX.read(buffer, { type: 'buffer' })
      : XLSX.readFile(fullPath)

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

/**
 * Process different file types and extract content.
 * Supports both multer-uploaded files ({ path/url }) and frontend inline files
 * ({ content }) used by web/mobile builds.
 */
export async function processFile(file = {}) {
  const { type = '', name = 'unnamed-file', path: filePath, url, content } = file
  const ext = getExtension(name)
  const dataUrl = parseDataUrl(content)
  const fullPath = resolveUploadedPath(filePath, url)

  try {
    // Images - return description (the current chat route is text-only).
    if (type.startsWith('image/') || dataUrl?.mimeType.startsWith('image/')) {
      return `[Image file: ${name}] - Image content attached; visual analysis requires a vision-capable chat route.`
    }

    // Inline text/code files from the frontend.
    if (typeof content === 'string' && !dataUrl && isTextFile(type, ext)) {
      return content
    }

    const buffer = dataUrl?.buffer

    // If this is a server-side upload, make sure the file exists.
    if (!buffer && fullPath && !fs.existsSync(fullPath)) {
      return `[File not found: ${name}]`
    }

    // PDF files
    if (type === 'application/pdf' || ext === 'pdf') {
      if (!buffer && !fullPath) return `[PDF file: ${name}] - No readable content supplied`
      return extractPdf(buffer, fullPath, name)
    }

    // Word documents
    if (ext === 'docx' || ext === 'doc') {
      if (!buffer && !fullPath) return `[Word document: ${name}] - No readable content supplied`
      return extractWord(buffer, fullPath, name)
    }

    // Excel/CSV files
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      if (!buffer && !fullPath) return `[Spreadsheet: ${name}] - No readable content supplied`
      return extractSpreadsheet(buffer, fullPath, name)
    }

    // Text-based files from disk.
    if (fullPath && isTextFile(type, ext)) {
      return fs.readFileSync(fullPath, 'utf-8')
    }

    // Unknown inline content.
    if (typeof content === 'string' && content) {
      return dataUrl
        ? `[File: ${name}] - Type: ${type || dataUrl.mimeType || 'unknown'} - Size: ${(buffer.length / 1024).toFixed(2)}KB`
        : content
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      const size = buffer?.length || (fullPath ? fs.statSync(fullPath).size : file.size || 0)
      return `[Archive: ${name}] - Size: ${(size / 1024).toFixed(2)}KB - Contains compressed files`
    }

    // Audio files
    if (type.startsWith('audio/')) {
      return `[Audio file: ${name}] - Audio content attached; transcription is not enabled in this text route.`
    }

    // Video files
    if (type.startsWith('video/')) {
      return `[Video file: ${name}] - Video content attached; video analysis is not enabled in this text route.`
    }

    // Binary / unknown files
    const size = buffer?.length || (fullPath ? fs.statSync(fullPath).size : file.size || 0)
    return `[File: ${name}] - Type: ${type || dataUrl?.mimeType || 'unknown'} - Size: ${(size / 1024).toFixed(2)}KB`
  } catch (error) {
    console.error(`Error processing file ${name}:`, error.message)
    return `[Error processing file: ${name} - ${error.message}]`
  }
}
