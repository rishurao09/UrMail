<div align="center">
  <img src="frontend/public/logo.png" alt="UrMail Logo" width="120" />
  <h1>UrMail — Autonomous Email Operations System (AEOS)</h1>
  <p><em>AI-powered intelligent email operations, triage, and automated response platform.</em></p>
</div>
Built with **FastAPI** · **Gemini AI** · **ChromaDB** · **React** · **Vite**

---

## ✨ What is UrMail?

UrMail is an autonomous email operations agent that leverages AI to:

- **Classify** incoming emails (Support / Sales / Personal / Spam)
- **Prioritize** based on urgency, sender importance, and context
- **Generate summaries** and extract action items
- **Retrieve knowledge** from uploaded documents (RAG/vector search)
- **Auto-reply** with grounded, accurate responses
- **Decide** whether to auto-send, suggest edits, or escalate to humans
- **Learn** from human corrections over time

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                │
│  Dashboard │ Inbox │ Email Detail │ Knowledge Base      │
└─────────────────────────────────────────────────────────┘
                          │ REST API
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI / Python)               │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │Classifier│→ │Priority Engine│→ │Summary Generator │  │
│  └──────────┘  └──────────────┘  └─────────────────┘  │
│       │                                    │            │
│       ▼                                    ▼            │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │RAG Engine│← │ Vector Store  │← │Document Processor│  │
│  │(Gemini)  │  │ (ChromaDB)   │  │(PDF/DOCX/TXT)   │  │
│  └──────────┘  └──────────────┘  └─────────────────┘  │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────────┐  ┌────────────────┐              │
│  │ Decision Engine   │→ │ Agent Executor  │              │
│  │(auto/suggest/esc) │  │(action runner)  │              │
│  └──────────────────┘  └────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features

### 1. Email Processing Pipeline
- **Classification** → Support / Sales / Personal / Spam (Gemini + heuristic fallback)
- **Priority Scoring** → High / Medium / Low with explanations
- **Conversation Intelligence** → Summary + action items

### 2. Knowledge Base (RAG System)
- Upload documents (.txt, .pdf, .docx)
- Automatic text extraction, cleaning, and chunking
- Vector embeddings via Gemini `text-embedding-004`
- Similarity search with ChromaDB
- Grounded response generation — no hallucinations

### 3. Decision Engine
| Confidence | KB Match | Action |
|---|---|---|
| > 0.9 | ✅ Yes | **AUTO_REPLY** |
| 0.6 – 0.9 | Any | **SUGGEST_REPLY** |
| < 0.6 | Any | **ESCALATE** |

Special rules:
- **Spam** → always auto-handled
- **Personal** → always suggested
- **High priority + no KB** → escalated

### 4. Subscription Tiers
| Tier | KBs/Month | Active Days |
|---|---|---|
| Free | 1 | 7 days |
| Pro | 5 | 30 days |
| Elite | 10 | 30 days |

### 5. Learning from Corrections
When users edit a suggested reply:
- Original + corrected version stored
- Used as improved templates for similar future emails

---

## 🚀 Getting Started

### 1. Start the Intelligent Backend

We recommend using a virtual environment (`conda` or `venv`):

```bash
cd backend
pip install -r requirements.txt

# Ensure document extraction tools are available
pip install python-docx 
```

Create a `.env` file based on the provided `.env.example` and add your Gemini API Key:
```env
GEMINI_API_KEY="your-google-ai-studio-key"
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --port 8000
```
*(The API will be available at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to view the self-documenting Swagger UI).*

### 2. Start the Executive Interface (Frontend)

```bash
cd frontend
npm install
npm run dev
```

Upon launching, the web UI will safely attach to `http://localhost:5173` (or the next open port like `5174/5175`). 

---

## 🧪 Running the Interactive Demo

UrMail ships with a built-in zero-setup demo suite:
1. Open the UI to the **Executive Dashboard**.
2. Click **"Run AI Demo"**.
3. The system will pre-seed the database with mock emails and a theoretical set of company Knowledge Base policies.
4. The Python intelligence routines will trigger, processing each email individually and streaming the categorized results, RAG context, and autonomous replies straight into the visual interface.

## 🛡️ License
Developed for experimental and advanced agentic AI operations.
