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
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return generateOfflineResponse(message, fileContents)
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

    // Fallback to offline response
    return generateOfflineResponse(message, fileContents, error.message)
  }
}

/**
 * Generate a response when OpenAI API is not available
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
    response += `> ⚠️ خطأ في الاتصال بـ API: ${errorMsg}\n\n`
  }

  response += `## رد تجريبي\n\n`
  response += `استلمت رسالتك: "${message?.slice(0, 100) || ''}"\n\n`

  if (fileContents && fileContents.length > 0) {
    response += `واستلمت ${fileContents.length} ملف مرفق.\n\n`
  }

  response += `### للتشغيل الكامل:\n\n`
  response += `1. أضف مفتاح OpenAI API في \`backend/.env\`:\n`
  response += '```bash\n'
  response += 'OPENAI_API_KEY=sk-your-key-here\n'
  response += '```\n\n'
  response += `2. أعد تشغيل الخادم:\n`
  response += '```bash\n'
  response += 'npm run dev\n'
  response += '```\n\n'
  response += `أنا أعمل الآن في الوضع التجريبي — أقدر أستقبل الرسائل والملفات لكن ردودي محدودة.`

  return response
}
