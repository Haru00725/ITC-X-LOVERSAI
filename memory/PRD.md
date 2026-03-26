# Fairmont x LoversAI - PRD

## Problem Statement
Ultra-luxury wedding venue design platform with strict glassmorphism UI. AI-powered venue visualization tool built in partnership with Fairmont Mumbai.

## Architecture
- **Backend**: FastAPI + MongoDB + Gemini Nano Banana (emergentintegrations)
- **Frontend**: React + Tailwind CSS + Shadcn/UI with custom glassmorphism theme
- **Fonts**: Cormorant Garamond (headings) + Manrope (body)
- **AI**: Gemini 3.1 Flash Image Preview via EMERGENT_LLM_KEY

## User Personas
1. Wedding Planners - Professional event designers creating moodboards for clients
2. Couples - Direct users visualizing their dream wedding venues

## Core Requirements
- Landing page with Fairmont branding + LoversAI
- Studio page with AI image generation from text prompts
- Filter system (Function, Theme, Space)
- Design reference upload (image-to-image)
- Moodboard collection and export (PDF/PPT)
- Strict glassmorphism design throughout

## What's Been Implemented (Feb 2026)
- [x] Landing page: Hero with Fairmont logo + "x LoversAI", CTA, About section, Footer
- [x] Studio page: Two-column layout with sidebar + main canvas
- [x] AI image generation via Gemini Nano Banana
- [x] Image-to-image reference upload
- [x] Filter pills for Function/Theme/Space
- [x] Add to Moodboard workflow
- [x] Moodboard modal with collage grid
- [x] PDF download
- [x] PPT download
- [x] Full glassmorphism design system
- [x] Responsive layout

## Prioritized Backlog
### P0 (Done)
- Core generation flow, Moodboard, Download

### P1
- Save moodboards to MongoDB for persistence across sessions
- Image quality/resolution options
- Generation history

### P2
- User accounts for saved moodboards
- Share moodboard via link
- Multiple moodboard collections
- Cost estimation integration
