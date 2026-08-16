// API configuration - works on both web and mobile (APK)
import { Capacitor } from '@capacitor/core'

// The AI backend is a deployed Base44 function (Deno/serverless), reachable
// directly over HTTPS from any origin (web, GitHub Pages, or the native app).
const API_BASE = import.meta.env.VITE_API_URL || 'https://vesper-c6f9e404.base44.app/functions'

// Detect if running as native app
export const isNative = Capacitor.isNativePlatform()

export { API_BASE }

/**
 * Read a File as text (for text/code files) or as a base64 data URL
 * (for images and binary files), so it can be sent as JSON to the backend.
 */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)

    const isTextLike =
      file.type.startsWith('text/') ||
      file.type === 'application/json' ||
      file.type === '' ||
      /\.(js|jsx|ts|tsx|py|java|c|cpp|h|css|html|md|txt|json|yml|yaml|xml|sh)$/i.test(file.name)

    if (isTextLike) {
      reader.onload = () => resolve(reader.result)
      reader.readAsText(file)
    } else {
      reader.onload = () => resolve(reader.result) // data:...;base64,....
      reader.readAsDataURL(file)
    }
  })
}

/**
 * Prepare files for sending: read their content client-side and package
 * them as plain objects. There is no separate upload endpoint — the chat
 * function accepts file content inline in the request body.
 */
export async function uploadFiles(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      let content = ''
      try {
        content = await readFile(file)
      } catch (e) {
        console.error('Failed to read file', file.name, e)
      }
      return {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content,
        url: file.type?.startsWith('image/') ? content : undefined,
      }
    })
  )
  return results
}

/**
 * Send a chat message to the AI agent
 */
export async function sendChatMessage({ message, files, history }) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      files: files || [],
      history: (history || []).map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Get supported file types (static list — no backend call needed)
 */
export async function getSupportedFileTypes() {
  return [
    'image/*',
    'text/*',
    'application/pdf',
    'application/json',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/*',
    'video/*',
  ]
}
