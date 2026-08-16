// API configuration - works on web, Docker deployments, mobile APK,
// and can fall back to free public AI endpoints when no backend is reachable.
import { Capacitor } from '@capacitor/core'

// By default the web app talks to this repository's Express backend through
// Vite's /api proxy in development, or the same origin in production. Native
// builds can set VITE_API_URL to a public backend URL, with or without /api.
const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api'
const POLLINATIONS_MODEL = import.meta.env.VITE_POLLINATIONS_MODEL || 'openai'

function normalizeApiBase(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) return '/api'

  // Keep relative API paths as-is.
  if (trimmed.startsWith('/')) return trimmed

  // Base44/serverless deployments in older builds expose /functions/chat.
  if (trimmed.endsWith('/functions')) return trimmed

  // If the caller already supplied /api, do not append it again.
  if (trimmed.endsWith('/api')) return trimmed

  return `${trimmed}/api`
}

const API_BASE = normalizeApiBase(RAW_API_BASE)

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
      file.type?.startsWith('text/') ||
      file.type === 'application/json' ||
      file.type === '' ||
      /\.(js|jsx|ts|tsx|py|java|c|cpp|h|css|html|md|txt|json|yml|yaml|xml|sh|csv|tsv|ini|conf|env)$/i.test(file.name)

    reader.onload = () => resolve(reader.result || '')

    if (isTextLike) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}

/**
 * Prepare files for sending: read their content client-side and package
 * them as plain objects. There is no separate upload endpoint required — the
 * chat endpoint accepts file content inline in the request body.
 */
export async function uploadFiles(files = []) {
  const fileList = Array.from(files)

  return Promise.all(
    fileList.map(async (file) => {
      // Regeneration can pass previously uploaded metadata instead of File
      // objects. Reuse it without trying to read it through FileReader.
      if (!(file instanceof File)) {
        return file
      }

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
}

function buildPrompt({ message, files = [], history = [] }) {
  const recentHistory = history
    .filter((m) => m.role && typeof m.content === 'string' && m.content.trim())
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
    .join('\n')

  const fileContext = files
    .map((file) => {
      const rawContent = typeof file.content === 'string'
        ? file.content
        : (file.url && !file.url.startsWith('data:') ? file.url : '')
      const content = rawContent?.startsWith('data:')
        ? `[ملف ثنائي/صورة مرفق: ${file.name}]`
        : (rawContent || `[ملف مرفق بدون نص قابل للقراءة: ${file.name}]`)

      return `اسم الملف: ${file.name}\nالنوع: ${file.type || 'unknown'}\nالمحتوى:\n${content.slice(0, 6000)}`
    })
    .join('\n\n---\n\n')

  return `أنت مساعد ذكي عربي بواجهة تشبه Claude. أجب بوضوح وبصيغة Markdown مختصرة ومفيدة.
إذا كانت رسالة المستخدم بالعربية فأجب بالعربية. لا تخترع معلومات غير موجودة في السياق.

${recentHistory ? `سياق المحادثة:\n${recentHistory}\n\n` : ''}${fileContext ? `الملفات المرفقة:\n${fileContext}\n\n` : ''}رسالة المستخدم:\n${message || (files.length ? 'حلّل الملفات المرفقة.' : '')}`
}

async function sendToBackend(payload) {
  // In a native APK, a relative /api URL points to the bundled app, and
  // localhost/10.0.2.2 are only useful for emulators. Skip them on real phones
  // and use the public/free fallbacks unless the build provides a real backend.
  if (isNative && (API_BASE.startsWith('/') || /^(https?:\/\/)?(localhost|127\.0\.0\.1|10\.0\.2\.2)(:|\/|$)/i.test(API_BASE))) {
    throw new Error('No public backend configured for native app')
  }

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let details = response.statusText
    try {
      const errorBody = await response.json()
      details = errorBody.error || errorBody.details || details
    } catch {
      // Response was not JSON; keep the HTTP status text.
    }
    throw new Error(`Backend chat failed: ${details}`)
  }

  return response.json()
}

async function sendToPollinations(payload) {
  const prompt = buildPrompt(payload)
  const url = new URL(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
  url.searchParams.set('model', POLLINATIONS_MODEL)
  url.searchParams.set('private', 'true')

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'text/plain' },
  })

  if (!response.ok) {
    throw new Error(`Pollinations failed: ${response.status} ${response.statusText}`)
  }

  const text = (await response.text()).trim()
  if (!text) throw new Error('Pollinations returned an empty response')

  return { response: text }
}

function createOfflineResponse({ message, files = [] }, errors = []) {
  const fileSummary = files.length
    ? `\n\n## الملفات المرفقة\n${files.map((file) => `- **${file.name}** (${file.type || 'unknown'})`).join('\n')}`
    : ''

  const hints = [
    'أستطيع ترتيب النصوص، تلخيص الملفات النصية، واقتراح كود حتى بدون خادم.',
    'للحصول على ذكاء أقوى اربط التطبيق بخادم عام عبر VITE_API_URL أو شغّل backend مع مفتاح API.',
    'أعد المحاولة بعد ثوانٍ إذا كان مزود الذكاء المجاني مزدحماً.',
  ]

  return {
    response: `## يعمل التطبيق الآن في وضع الطوارئ المحلي\n\nاستلمت رسالتك: **${message || 'بدون نص'}**${fileSummary}\n\n${hints.map((h) => `- ${h}`).join('\n')}${errors.length ? `\n\n<details>\n<summary>تفاصيل الاتصال</summary>\n\n${errors.map((e) => `- ${e}`).join('\n')}\n</details>` : ''}`,
  }
}

/**
 * Send a chat message to the AI agent.
 * Order:
 * 1. Your configured backend, if available.
 * 2. Pollinations text API, a free no-key public AI endpoint.
 * 3. Local offline response so the APK never shows a dead connection.
 */
export async function sendChatMessage({ message, files, history }) {
  const payload = {
    message,
    files: files || [],
    history: (history || [])
      .filter((m) => m.role && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content })),
  }

  const errors = []

  try {
    return await sendToBackend(payload)
  } catch (error) {
    console.warn('Backend unavailable, trying free AI fallback:', error.message)
    errors.push(error.message)
  }

  try {
    return await sendToPollinations(payload)
  } catch (error) {
    console.warn('Free AI fallback unavailable, using offline response:', error.message)
    errors.push(error.message)
  }

  return createOfflineResponse(payload, errors)
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
