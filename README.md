# AI Agent — Claude-like Interface

مساعد ذكي بواجهة مشابهة لـ Claude، يدعم جميع أنواع الملفات.

![AI Agent](https://img.shields.io/badge/AI-Agent-d97757) ![React](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node-20-green)

## ✨ المميزات

- 🎨 **واجهة مشابهة لـ Claude** — تصميم نظيف، وضع ليلي/نهاري، دعم RTL
- 📁 **دعم جميع الملفات** — صور، PDF، Word، Excel، كود، ملفات مضغوطة، صوت، فيديو
- 💬 **محادثات متعددة** — احفظ واسترجع محادثاتك
- 🔄 **ردود متدفقة** — ظهور النص تدريجياً مثل Claude
- 📝 **دعم Markdown** — كود ملوّن، جداول، قوائم، روابط
- 🐳 **Docker Ready** — تشغيل سريع بـ Docker
- 🔌 **OpenAI متكامل** — استخدم GPT-4o أو أي نموذج

## 🚀 التشغيل السريع

### المتطلبات
- Node.js 20+
- npm أو yarn

### 1️⃣ تثبيت الحزم
```bash
npm run install:all
```

### 2️⃣ إعداد مفتاح OpenAI (اختياري)
```bash
cp backend/.env.example backend/.env
# عدّل backend/.env وأضف مفتاحك
```

### 3️⃣ التشغيل
```bash
npm run dev
```

سيفتح:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 🐳 التشغيل بـ Docker
```bash
# أضف مفتاح OpenAI
export OPENAI_API_KEY=your-key-here

# شغّل
docker-compose up --build

# أو بدون OpenAI (وضع تجريبي)
docker-compose up --build
```

## 📂 أنواع الملفات المدعومة

| الفئة | الصيغ |
|-------|-------|
| 🖼️ الصور | PNG, JPG, JPEG, GIF, WebP, SVG, BMP, ICO |
| 📄 المستندات | PDF, DOC, DOCX, TXT, RTF, ODT |
| 📊 الجداول | XLS, XLSX, CSV, ODS |
| 📽️ العروض | PPT, PPTX, ODP |
| 💻 الكود | JS, TS, PY, Java, C++, Go, PHP, HTML, CSS, JSON, YAML, SQL |
| 🗜️ المضغوط | ZIP, RAR, 7Z, TAR, GZ |
| 🎵 الصوت | MP3, WAV, OGG, FLAC, M4A |
| 🎥 الفيديو | MP4, AVI, MKV, MOV, WebM |

## 🏗️ البنية

```
ai-agent-claude-ui/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # قائمة المحادثات
│   │   │   ├── TopBar.jsx        # الشريط العلوي
│   │   │   ├── ChatArea.jsx      # منطقة المحادثة
│   │   │   ├── Message.jsx       # عرض الرسائل + Markdown
│   │   │   └── MessageInput.jsx  # إدخال + رفع ملفات
│   │   ├── utils/
│   │   │   └── api.js            # اتصال بالخادم
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/           # Node.js + Express
│   ├── routes/
│   │   └── chat.js              # معالجة الرسائل + OpenAI
│   ├── utils/
│   │   └── fileProcessor.js     # معالجة الملفات
│   ├── server.js                # الخادم الرئيسي
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔧 الإعدادات

### متغيرات البيئة (backend/.env)
| المتغير | الوصف | الافتراضي |
|---------|-------|-----------|
| `PORT` | منفذ الخادم | 3001 |
| `OPENAI_API_KEY` | مفتح OpenAI API | - |
| `OPENAI_MODEL` | النموذج المستخدم | gpt-4o |
| `MAX_FILE_SIZE` | أقصى حجم ملف | 50MB |
| `CORS_ORIGIN` | النطاق المسموح | * |

## 📝 الترخيص

MIT License — استخدمه بحرية.
