# AI Blog Generator

An SEO-focused blog outline and post generator. Enter a topic and keywords, review and edit an AI-generated outline, then generate the full draft section by section and check it with an on-page SEO audit.

> Micro Project, Honours in Foundation of AI and Prompt Engineering (Semester V, AY 2026-27)
> Shah & Anchor Kutchhi Engineering College, UG Program in Computer Engineering

## Features

- **4-step workflow:** Topic & Keywords, Outline Editor, Section Drafting, SEO & Export
- **Human review gate:** the outline is generated first and you edit it before any prose is written
- **Section-by-section drafting** with a live Markdown preview and progress bar
- **SEO scoring (plain code, not LLM):** Flesch-Kincaid grade, keyword density, heading hierarchy check, title tag and meta description checks
- **Export** to Markdown (.md) and plain text (.txt)
- **Mock | Live toggle:** switch between canned demo responses and the real Gemini API without changing code
- **3 demo presets** to fill the form quickly

> All output is a draft and needs human review before publishing.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, marked |
| Backend | Node.js 20+, Express 4 |
| LLM | Google Gemini API (`@google/genai`), model set in `.env` |
| Readability | text-readability |

## Prerequisites

- Node.js 20 or newer
- A Gemini API key from [Google AI Studio](https://aistudio.google.com) (only needed for Live mode; Mock mode works without one)

## Setup

```bash
# 1. Install dependencies (from the project root)
npm install

# 2. Create your environment file
cp .env.example .env        # on Windows PowerShell: copy .env.example .env

# 3. Edit .env and add your key
```

`.env` settings:

```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
MOCK_MODE=true
```

Never commit `.env`. It is listed in `.gitignore`.

## Run

```bash
npm run dev
```

- Client: http://localhost:5173
- Server API: http://localhost:3001

If a port is already in use, stop the old process first, or the app will start on a different port.

## Mock and Live mode

Use the **Mock | Live Gemini** switch in the header.

- **Mock:** returns realistic canned outlines and section text. No API key or internet connection needed. Good for demos and UI testing.
- **Live Gemini:** calls the Gemini API. Requires `GEMINI_API_KEY` in `.env`. The free tier has rate limits, so keep demo drafts short (600-800 words).

`MOCK_MODE` in `.env` sets the default when the app starts.

## API endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Server status and active model |
| `POST /api/keywords` | Normalise and tag keywords, suggest related terms |
| `POST /api/outline` | Generate the H2/H3 outline as JSON |
| `POST /api/draft/section` | Generate Markdown for one section |
| `POST /api/score` | Run the SEO audit on a finished draft |

## Project structure

```
Blog-Generator/
├── client/              # React + Vite + Tailwind frontend
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── server/              # Express API
│   └── src/
├── .env.example         # placeholder environment variables
├── package.json         # root scripts (dev, build, start)
└── README.md
```

## Design notes

The outline and the draft are generated in two separate steps. Early testing showed that single-pass generation produced inconsistent heading hierarchies and topic drift in longer drafts. A fixed, user-approved outline acts as the contract for every drafting call.

## Author

Amey Nagotkar, TYCM2, Roll No. 44
Guide: Ms. Priyanka Kharatmol
