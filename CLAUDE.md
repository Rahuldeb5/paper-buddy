# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

paper-buddy is a research paper reader app. Users can upload or link to academic papers and interact with them (read, summarize, ask questions) powered by the Gemini API.

**Stack:** React frontend · FastAPI (Python) backend · Google Gemini API

## Architecture

The app is split into two top-level parts:

- **`backend/`** — FastAPI Python server. Handles PDF parsing, Gemini API calls, and exposes REST endpoints to the frontend.
- **`frontend/`** — React app. Renders the paper viewer UI and sends requests to the backend.

The frontend never calls the Gemini API directly — all LLM interaction goes through the backend so API keys stay server-side.

## Commands

Commands will be documented here as the project is scaffolded. Expected shape once set up:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # dev server on :8000

# Frontend
cd frontend
npm install
npm run dev                        # dev server on :5173

# Tests (backend)
pytest
```

## Collaboration Style

**This user is a CS freshman learning to code. Adapt every interaction to support learning:**

- Explain the architectural decision and the "why" before writing any code or installing any package.
- Implement one component or function at a time, then wait for the user to confirm before moving on.
- Never run `pip install` or `npm install` without first listing what each package does and why it's needed.
- If the user proposes an approach that has a better alternative, stop and explain the tradeoff — don't just silently do it the right way.
- After completing each major component (e.g., a new API route, a new React component), ask a short quiz question to check the user's understanding of what was just built.
- Explanations should build intuition, not just describe syntax. Prefer analogies and concrete examples over abstract definitions.
