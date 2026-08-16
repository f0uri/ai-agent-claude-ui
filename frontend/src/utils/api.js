// API configuration - works on both web and mobile (APK)
import { Capacitor } from '@capacitor/core'

// Auto-detect API URL:
// 1. VITE_API_URL env var (set at build time)
// 2. Relative URL (same origin - for Docker/Render deployment)
// 3. localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 
  (Capacitor.isNativePlatform() 
    ? 'https://ai-agent-claude-ui.onrender.com/api'  // Default Render URL for mobile
    : '/api')  // Relative URL for same-origin deployment

// Detect if running as native app
export const isNative = Capacitor.isNativePlatform()

export { API_BASE }

/**
 * Upload files to the backend
 */
export async function uploadFiles(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.files
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
      history: history || [],
    },
  })

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Get supported file types
 */
export async function getSupportedFileTypes() {
  const response = await fetch(`${API_BASE}/file-types`)
  if (!response.ok) return []
  const data = await response.json()
  return data.types
}
