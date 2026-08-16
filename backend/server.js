import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { processChat } from './routes/chat.js'
import { processFile } from './utils/fileProcessor.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static files for uploaded files
app.use('/uploads', express.static(uploadDir))

// Multer configuration - supports ALL file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept ALL file types
    cb(null, true)
  },
})

// ===== Routes =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Agent API is running',
    features: [
      'chat',
      'file-upload',
      'file-processing',
      'image-analysis',
      'pdf-reading',
      'code-analysis',
    ],
  })
})

// File upload endpoint - accepts ALL file types
app.post('/api/upload', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const files = req.files.map((file) => ({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      path: file.path,
      filename: file.filename,
    }))

    res.json({ files })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload files' })
  }
})

// Chat endpoint - AI agent with file context
app.post('/api/chat', async (req, res) => {
  try {
    const { message, files, history } = req.body

    if (!message && (!files || files.length === 0)) {
      return res.status(400).json({ error: 'Message or files required' })
    }

    // Process any attached files to extract content
    let fileContents = []
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const content = await processFile(file)
          if (content) {
            fileContents.push({ name: file.name, type: file.type, content })
          }
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err.message)
          fileContents.push({
            name: file.name,
            type: file.type,
            content: `[Could not process file: ${file.name}]`,
          })
        }
      }
    }

    // Generate AI response
    const response = await processChat({
      message,
      fileContents,
      history: history || [],
    })

    res.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message,
    })
  }
})

// Supported file types info
app.get('/api/file-types', (req, res) => {
  res.json({
    types: [
      { category: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'] },
      { category: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'] },
      { category: 'Spreadsheets', extensions: ['xls', 'xlsx', 'csv', 'ods'] },
      { category: 'Presentations', extensions: ['ppt', 'pptx', 'odp'] },
      { category: 'Code', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'sql'] },
      { category: 'Archives', extensions: ['zip', 'rar', '7z', 'tar', 'gz'] },
      { category: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'] },
      { category: 'Video', extensions: ['mp4', 'avi', 'mkv', 'mov', 'webm'] },
      { category: 'Other', extensions: ['*'] },
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 50MB.' })
    }
  }
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Agent API running on http://localhost:${PORT}`)
  console.log(`📁 Upload directory: ${uploadDir}`)
  console.log(`🤖 AI Model: ${process.env.OPENAI_MODEL || 'gpt-4o'}`)
})
