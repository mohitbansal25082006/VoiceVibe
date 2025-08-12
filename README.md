```markdown
# 🎤 VoiceVibe – AI Interview Coach

**Live Demo:** [https://voicevibe-nine.vercel.app](https://voicevibe-nine.vercel.app)

---

## 📌 What is VoiceVibe?
VoiceVibe is a **full-stack, production-ready web app** that simulates professional job interviews using **OpenAI GPT-4** and **Whisper**.  
Users pick a role, difficulty & type, then receive **instant feedback** on their answers—typed or spoken.  
Everything is **free-tier friendly**, deployed on **Vercel**, and built with **Next.js 14**.

---

## ✨ Key Features
- 🧠 **GPT-4 powered questions** tailored to the chosen role & difficulty  
- 🎙️ **Voice or text answers** via Whisper & Web Speech API  
- 📊 **Visual progress tracking** with Recharts (score per day & distribution)  
- 🔐 **Auth** via Clerk (email, Google, GitHub)  
- 📄 **Resume upload** via Vercel Blob Storage  
- 🌗 **Dark / light toggle**  
- 📈 **Vercel Analytics** & SEO meta tags baked in  
- 🚀 **Zero-cost stack** (only pay-as-you-go OpenAI usage)

---

## 🛠️ Tech Stack
| Layer | Tech |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, ShadCN UI |
| **Auth** | Clerk |
| **Database** | Vercel Postgres (free tier) |
| **File Storage** | Vercel Blob Storage |
| **AI** | OpenAI GPT-4 + Whisper |
| **Charts** | Recharts |
| **Deploy** | Vercel (Turbo + Analytics) |

---

## 📦 Environment Variables
Create `.env.local` with:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
POSTGRES_URL=postgres://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## 🚀 Getting Started (local)

1. **Clone**  
   ```bash
   git clone https://github.com/<you>/voicevibe.git
   cd voicevibe
   ```

2. **Install**  
   ```bash
   npm install
   ```

3. **Run**  
   ```bash
   npm run dev
   ```

4. **Build**  
   ```bash
   npm run build
   ```

---

## 📋 Project Phases (Parts 1-6)

| Part | What We Built |
|---|---|
| **1** | Project setup, Next.js 14, TypeScript, Tailwind, Clerk, ShadCN |
| **2** | Beautiful landing page + auth flows |
| **3** | Protected dashboard, interview creation form, resume upload |
| **4** | Live mock-interview page (text/voice Q&A, instant GPT-4 feedback) |
| **5** | Progress analytics – save every answer & show Recharts graphs |
| **6** | **Production deploy** to Vercel, SEO, analytics, dark-mode polish |

---

## 🎯 User Journey

1. **Sign up / in** (Clerk)  
2. **Create interview** → choose role, difficulty, type, optional resume  
3. **Mock interview** → answer questions (text or voice) → real-time feedback  
4. **Progress page** → track improvement over time  
5. **Repeat** → ace the real interview!

---

## 🧩 API Endpoints (used internally)

| Route | Method | Purpose |
|---|---|---|
| `/api/answer` | `POST` | Save Q-A pair + score |
| `/api/...` | — | Everything else handled via Next.js server actions |

---

## 📄 License
MIT © 2024 VoiceVibe Team

---

## 🙌 Contributing
PRs welcome! Feel free to open issues for bugs or enhancements.

---

**Happy interviewing & good luck landing the job! 🎤**
```
