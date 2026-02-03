# ⚖️ NyayaSetu - Bridge to Justice

**NyayaSetu** is an AI-Powered Legal Incident Analysis System built to assist Indian Citizens and Police Officials. It interprets incident descriptions and maps them to the correct sections of the **Bharatiya Nyaya Sanhita (BNS)** and **Indian Penal Code (IPC)**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-blue)
![Tech](https://img.shields.io/badge/Tech-Next.js%2015%20%7C%20TypeScript%20%7C%20CSS%20Modules-black)

## 🌟 Key Features

### 👥 Public Portal
- **Incident Narration**: Simple text interface or **Voice Input** (English/Hindi).
- **Multi-modal Evidence**: Upload images for "Visual Analysis" (Gemini Vision simulation).
- **AI Analysis**: Instantly provides:
  - Applicable Legal Sections (BNS & IPC).
  - Cognizable / Non-Cognizable Classification.
  - Required procedural steps (FIR, Medical Exam, etc.).
- **Multilingual UI**: Deep support for English and Hindi.

### 👮 Police Panel
- **Secure Access**: Protected by Authentication (`officer` / `jaihind`).
- **Dashboard**: Overview of pending and processed cases.
- **FIR Drafting Assistant**:
  - Auto-generated FIR drafts based on incident facts.
  - **Editable Sections**: Officers can add/remove sections.
  - **PDF Export**: Download professional FIR drafts.
- **Evidence Checklist**: AI flags missing critical information.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nyayasetu.git
   cd nyayasetu
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or port 3001) in your browser.

## 🛠️ Configuration

### AI Engine
By default, the application runs on a **High-Fidelity Mock Engine** in `src/app/api/analyze/route.ts` to demonstrate capabilities without costs.

To enable **Real AI (LLM)**:
1. Rename `.env.example` to `.env.local`.
2. Add your API Key (e.g., `OPENAI_API_KEY`).
3. Uncomment the fetch logic in `src/app/api/analyze/route.ts`.

## 📦 Deployment

### Vercel (Recommended)
This Next.js app is optimized for Vercel.
1. Push your code to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. It will auto-detect the build settings.
4. Click **Deploy**.

## 🛡️ Legal Disclaimer
*NyayaSetu is an assistive tool. It provides information based on the BNS/IPC but does not replace professional legal counsel or the final authority of the Police and Courts.*
