import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

/**
 * Process a chat request with optional file content
 */
export async function processChat({ message, fileContents, history }) {
  // Build the system prompt
  const systemPrompt = `أنت مساعد ذكي متطور يدعم جميع أنواع الملفات. مهمتك هي:

1. الإجابة على الأسئلة بشكل شامل ودقيق
2. تحليل ومعالجة الملفات المرفقة (نصوص، صور، كود، PDF، Excel، وأكثر)
3. كتابة وتصحيح الكود
4. شرح المفاهيم المعقدة ببساطة
5. المساعدة في المهام المختلفة

استخدم تنسيق Markdown في إجاباتك لتحسين القراءة. عند كتابة الكود، استخدم كتل الكود المناسبة.

إذا كان هناك محتوى ملف مرفق، استخدمه كسياق لإجابتك.

القواعد:
- كن واضحاً ومباشراً
- استخدم العربية إذا كان السؤال بالعربية، والإنجليزية إذا كان بالإنجليزية
- لا تخترع معلومات - إذا لم تكن متأكداً، قل ذلك
- قدم أمثلة عند الحاجة`

  // Build messages array
  const messages = [{ role: 'system', content: systemPrompt }]

  // Add history (last 10 messages for context)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10)
    for (const msg of recentHistory) {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      }
    }
  }

  // Build user message with file content
  let userContent = message || ''

  if (fileContents && fileContents.length > 0) {
    userContent += '\n\n--- محتوى الملفات المرفقة ---\n'
    for (const file of fileContents) {
      userContent += `\n📂 **${file.name}** (${file.type})\n`
      userContent += '```\n'
      userContent += typeof file.content === 'string'
        ? file.content.slice(0, 5000)
        : JSON.stringify(file.content).slice(0, 5000)
      userContent += '\n```\n'
    }
    userContent += '--- نهاية محتوى الملفات ---\n'
  }

  messages.push({ role: 'user', content: userContent })

  try {
    // Check if API key is configured. If not, use a free no-key AI fallback
    // before returning the local offline response.
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return await generateFreeAIResponse(messages, message, fileContents)
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من توليد رد.'
  } catch (error) {
    console.error('OpenAI API error:', error.message)

    // Fallback to free public AI, then offline response
    return await generateFreeAIResponse(messages, message, fileContents, error.message)
  }
}

/**
 * Try a free/no-key public AI endpoint. This keeps the app useful when no
 * OpenAI key is configured. It is best-effort, so the offline response remains
 * the final fallback when the public service is busy or unreachable.
 */
async function generateFreeAIResponse(messages, message, fileContents, previousError) {
  const model = process.env.POLLINATIONS_MODEL || 'openai'
  const prompt = messages
    .map((msg) => `${msg.role === 'system' ? 'System' : msg.role === 'user' ? 'User' : 'Assistant'}:\n${msg.content}`)
    .join('\n\n')

  try {
    const url = new URL(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
    url.searchParams.set('model', model)
    url.searchParams.set('private', 'true')

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`Pollinations HTTP ${response.status}`)
    }

    const text = (await response.text()).trim()
    if (!text) throw new Error('Pollinations returned empty response')
    return text
  } catch (error) {
    const combinedError = previousError
      ? `${previousError}; free fallback: ${error.message}`
      : `free fallback: ${error.message}`
    return generateOfflineResponse(message, fileContents, combinedError)
  }
}

/**
 * Generate a response when remote AI is not available
 */
function generateOfflineResponse(message, fileContents, errorMsg) {
  let response = ''

  if (!message && fileContents && fileContents.length > 0) {
    response = `## تحليل الملف المرفق\n\n`
    response += `لقد استلمت ${fileContents.length} ملف:\n\n`
    for (const file of fileContents) {
      response += `### 📂 ${file.name}\n`
      response += `- **النوع:** ${file.type}\n`
      if (file.content) {
        const preview = typeof file.content === 'string'
          ? file.content.slice(0, 500)
          : 'محتوى ثنائي'
        response += `- **معاينة المحتوى:**\n\`\`\`\n${preview}\n\`\`\`\n\n`
      }
    }
    response += `\n> ⚠️ **ملاحظة:** الخادم يعمل في الوضع التجريبي. للحصول على ردود ذكية كاملة، أضف مفتاح OpenAI API في ملف \`.env\``
    return response
  }

  if (errorMsg) {
    response += `> ℹ️ تعذر الوصول مؤقتاً إلى مزود الذكاء المجاني: ${errorMsg}\n\n`
  }

  response += `## رد محلي احتياطي\n\n`
  response += `استلمت رسالتك: "${message?.slice(0, 100) || ''}"\n\n`

  if (fileContents && fileContents.length > 0) {
    response += `واستلمت ${fileContents.length} ملف مرفق.\n\n`
  }

  response += `### طريقة العمل الآن:\n\n`
  response += `- أحاول أولاً استخدام خادم التطبيق إن كان متاحاً.\n`
  response += `- إذا لم يوجد مفتاح OpenAI، أحاول استخدام مزود مجاني بدون مفتاح.\n`
  response += `- إذا كان الاتصال الخارجي مزدحماً أو محجوباً، أرجع هذا الرد المحلي حتى لا يتوقف التطبيق.\n\n`
  response += `لأفضل جودة يمكنك لاحقاً إضافة \`OPENAI_API_KEY\` أو ربط \`VITE_API_URL\` بخادم عام، لكن التطبيق لن يتعطل بدونها.`

  return response
}
