# AI Agent — Claude-like Interface

مساعد ذكي بواجهة مشابهة لـ Claude، يدعم جميع أنواع الملفات.

![AI Agent](https://img.shields.io/badge/AI-Agent-d97757) ![React](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node-20-green) ![Android](https://img.shields.io/badge/APK-Android-3DDC84)

## ✨ المميزات

- 🎨 **واجهة مشابهة لـ Claude** — تصميم نظيف، وضع ليلي/نهاري، دعم RTL
- 📁 **دعم جميع الملفات** — صور، PDF، Word، Excel، كود، ملفات مضغوطة، صوت، فيديو
- 💬 **محادثات متعددة** — احفظ واسترجع محادثاتك
- 🔄 **ردود متدفقة** — ظهور النص تدريجياً مثل Claude
- 📝 **دعم Markdown** — كود ملوّن، جداول، قوائم، روابط
- 🐳 **Docker Ready** — تشغيل سريع بـ Docker
- 📱 **Android APK** — تطبيق Android أصلي عبر Capacitor
- 🔌 **OpenAI متكامل** — استخدم GPT-4o أو أي نموذج

## 🚀 التشغيل السريع (Web)

### المتطلبات
- Node.js 20+

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
export OPENAI_API_KEY=your-key-here
docker-compose up --build
```

## 📱 بناء APK (Android)

### الطريقة الأولى: GitHub Actions (تلقائي) ⭐

1. اذهب إلى: https://github.com/f0uri/ai-agent-claude-ui/actions
2. سيُبنى الـ APK تلقائياً مع كل push
3. حمّل الـ APK من Artifacts
4. ثبّته على هاتفك

> **مهم:** قبل البناء، أضف متغير `API_URL` في Settings → Secrets and variables → Actions
> pointing to your deployed backend URL.

### الطريقة الثانية: بناء محلي

```bash
# المتطلبات: Android SDK + Java 17
cd frontend
npm install
npm run build

# إضافة منصة Android
npx cap add android
npx cap sync android

# بناء APK
cd android
./gradlew assembleDebug

# APK سيكون في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### الطريقة الثالثة: Docker + Android
```bash
# بناء الـ backend
docker-compose up -d

# بناء الـ APK
cd frontend
npm run apk:build
```

### تثبيت APK على الهاتف
```bash
# انسخ الـ APK لهاتفك
adb install app/build/outputs/apk/debug/app-debug.apk

# أو انسخه يدوياً وثبّته
```

## 🔧 إعداد الـ Backend للـ APK

يجب أن يكون الـ Backend على خادم عام (وليس localhost) لكي يعمل التطبيق على الهاتف.

### خيارات النشر:
1. **Render.com** — مجاني وسهل
2. **Railway.app** — مجاني للاستخدام الأول
3. **Fly.io** — يدعم Docker
4. **VPS** — استخدم Docker

بعد النشر، حدّث `VITE_API_URL` في:
- `frontend/.env` للبناء المحلي
- GitHub Secrets → `API_URL` للبناء التلقائي

## 📂 أنواع الملفات المدعومة

| الفئة | الصيغ |
|-------|-------|
| 🖼️ الصور | PNG, JPG, JPEG, GIF, WebP, SVG, BMP |
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
├── .github/workflows/
│   └── build-apk.yml            # GitHub Actions لبناء APK تلقائياً
├── frontend/                    # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # مكونات الواجهة
│   │   ├── mobile/               # Capacitor mobile hooks
│   │   ├── utils/                # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                  # أيقونات
│   ├── capacitor.config.ts      # إعدادات Capacitor (Android)
│   ├── vite.config.js
│   └── package.json
├── backend/                     # Node.js + Express
│   ├── routes/
│   │   └── chat.js              # معالجة الرسائل + OpenAI
│   ├── utils/
│   │   └── fileProcessor.js     # معالجة الملفات
│   ├── server.js
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 📝 الترخيص

MIT License — استخدمه بحرية.
