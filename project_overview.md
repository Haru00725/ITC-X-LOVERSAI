# Fairmont x LoversAI Project Overview

## Core Identity
**Theme & Archetype:** Ultra-Luxury Event & AI Design Studio (Jewel & Luxury archetype). 
**Styling Constraint:** Cinematic, moody. **STRICT GLASSMORPHISM** ONLY. No solid flat colors. Rely on light, shadow, and blur.
**Typography:** *Cormorant Garamond* (Headings) and *Manrope* (Body UI).

## System Architecture

### 1. Frontend Layer
- **Tech Stack:** React 19 (via Create React App), Tailwind CSS, Radix UI primitives.
- **Location:** `frontend/`
- **Key Folders:**
  - `src/components/`: Reusable UI pieces (buttons, glass panels, modals).
  - `src/pages/`: Main application views (Landing, Studio, Moodboard).
  - `src/lib/` & `src/hooks/`: Utilities and context.
- **Styling Config:** `design_guidelines.json` strictly enforces class names (e.g., `backdrop-blur-xl`, `bg-white/5`, `border-white/20`).

### 2. Backend Layer
- **Tech Stack:** Python, FastAPI, Motor (Async MongoDB), httpx, ReportLab (PDF), Python-PPTX.
- **Location:** `backend/`
- **Entry point:** `server.py`
- **Data Store:** MongoDB (`moodboard_images` collection).
- **Core Endpoints:**
  - `POST /api/generate`: Receives prompt, reference images, venue space. Formats a massive `SYSTEM_PROMPT` containing spatial reasoning and decor instructions. Interacts with the FLUX AI API to return generated venue concepts (currently marked as TODO manual integration in `server.py`).
  - `POST /api/moodboard/save`: Saves generated image to MongoDB.
  - `GET /api/moodboard/{session_id}`: Retrieves session generated images.
  - `POST /api/moodboard/download-pdf` & `download-ppt`: Exports the moodboard using ReportLab/PPTX libraries.
  - `GET /api/templates`: Serves default aesthetic templates.

## Operational Flow
1. **Landing:** User hits the main screen featuring a fixed full-screen Fairmont image background and extreme luxurious typography.
2. **Studio / Generation:** User uploads a reference image and selects functions/theme/space. 
3. **API Request:** Frontend calls `POST /api/generate`. The Python backend merges the inputs with a "DecorVision AI" System Persona and invokes FLUX.
4. **Moodboard Construction:** Generated images are displayed in the main canvas. User clicks "Add to Moodboard".
5. **Export:** User opens the Moodboard Modal and can export to high-quality PDF or PPT presentations.

## Development Commands
- **Frontend:** `cd frontend && npm start` (Runs on port 3000)
- **Backend:** `cd backend && source venv/bin/activate && uvicorn server:app --reload` (Runs on port 8000)

> **Note to AI:** When asked to make modifications to the system, strictly follow the `design_guidelines.json` constraints for styling, and ensure API requests mirror the currently established data contracts in `server.py`.
