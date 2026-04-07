# ITC x LoversAI - Complete Project Memory

> **Last Updated**: April 2026  
> **Purpose**: Comprehensive reference for understanding the project requirements, user flow, data processing, and current implementation state.

---

## 1. Project Overview

### Core Identity
- **Name**: ITC x LoversAI
- **Type**: Ultra-Luxury Wedding & Event Design Platform
- **Partnership**: ITC Aurangabad × LoversAI
- **Theme**: Dark, Cinematic, Mood-driven
- **Design Philosophy**: STRICT GLASSMORPHISM ONLY (no solid flat colors)

### Primary Use Case
AI-powered platform enabling wedding planners and couples to visualize dream venue designs through text prompts + reference images, then export moodboards as PDF/PPT presentations.

### Target Users
1. **Wedding Planners** - Professional designers creating moodboards for clients
2. **Couples** - Direct end-users visualizing their wedding venues

---

## 2. User Flow (Input → Output)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY MAP                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   LANDING    │───▶│   STUDIO     │───▶│  GENERATION  │───▶│  MOODBOARD   │  │
│  │    PAGE      │    │    PAGE      │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                                                  │
│         │                   │                    │                   │          │
│         ▼                   ▼                    ▼                   ▼          │
│  • Fairmont Logo    • Sidebar Filters    • API Request       • Save Images    │
│  • LoversAI Logo    • Image Upload       • FLUX AI Call       • View Grid      │
│  • CTA Button       • Space Selection    • Display Result    • Export PDF     │
│  • About Section    • Event Type         • Download Image    • Export PPT     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

#### Step 1: Landing Page (Entry Point)
- User lands on `/`
- Sees Fairmont × LoversAI branding with logos
- Reads "Where luxury meets imagination"
- Clicks "Design Your Vision" CTA → navigates to `/studio`

#### Step 2: Studio Page - Configuration
- **Sidebar (Left Panel)**:
  - Upload Design Reference (from computer OR select template)
  - Select Venue Space (6 options: Grand Terminus 1, Infinity Ballroom, etc.)
  - Select Event Type (7 options: Ultra-Luxury Wedding, Indian Destination Wedding, etc.)
  - Hover on items shows thumbnail preview tooltip
- **Canvas (Right Panel)**:
  - Prompt input field
  - Active filters display (selected space, event type, reference)
  - Generate button

#### Step 3: Studio Page - Generation
1. User enters text prompt describing desired venue design
2. User optionally selects:
   - Venue space from sidebar (triggers AngleModal to pick view angle)
   - Event type filter
   - Reference image upload
3. User clicks "Generate"
4. Frontend sends POST to `/api/generate` with payload:
   ```json
   {
     "prompt": "...",
     "function_type": "Indian Destination Wedding",
     "space": "Grand Terminus 1",
     "reference_image": "base64_encoded_image_data"
   }
   ```
5. Backend:
   - Builds combined prompt using SYSTEM_PROMPT (DecorVision AI persona)
   - Calls FLUX API (currently TODO - returns placeholder)
   - Returns image_data (base64)
6. Generated image displayed on canvas
7. User can download image or add to moodboard

#### Step 4: Moodboard Management
1. User clicks "Add to Moodboard" on generated image
2. Image saved to local state (array of objects)
3. User can open MoodboardModal to view all saved images
4. In MoodboardModal:
   - View images in grid layout
   - Remove individual images
   - Export all as PDF
   - Export all as PPT

---

## 3. Data Processing Pipeline

### Input Data Flow

```
USER INPUT                          FRONTEND PROCESSING                  BACKEND RECEIVES
─────────────────────────────────────────────────────────────────────────────────────

User's Text Prompt        ──────►    Direct string              ──────►    req.prompt (str)
                                    No transformation                    "Create a grand floral arch..."

Event Type Selection     ──────►    Selected from list         ──────►    req.function_type (str|null)
                                    (e.g., "Indian Destination              "Indian Destination Wedding"
                                    Wedding")

Venue Space Selection    ──────►    Click triggers modal       ──────►    req.space (str|null)
                                    AngleModal for angle                   "Grand Terminus 1"

Venue Image (Angle)       ──────►    Convert URL to base64      ──────►    req.venue_image (base64|null)
                                    via urlToBase64()                     Base64 encoded venue photo

Design Reference Image   ──────►    FileReader or URL to       ──────►    req.design_image (base64|null)
                                    base64                               Base64 encoded design inspiration
```

### Backend Processing Pipeline

```
1. REQUEST RECEIVED (GenerateRequest)
   {
     prompt: "Create a grand floral arch...",
     function_type: "Indian Destination Wedding",
     space: "Grand Terminus 1",
     venue_image: "base64_venue_image",
     design_image: "base64_design_image"
   }
          │
          ▼
2. BUILD USER PROMPT (build_prompt function)
   - Take user.prompt
   - Add function_type if exists: "Event type: Indian Destination Wedding"
   - Add space context: "Venue space: Grand Terminus 1 at Fairmont Mumbai"
   Result: "Create a grand floral arch. Event type: Indian Destination Wedding. Venue space: Grand Terminus 1 at Fairmont Mumbai"
          │
          ▼
3. BUILD FLUX PROMPT (Complete payload)
   - Prepend SYSTEM_PROMPT (DecorVision AI persona - lines 63-168)
   - Append user request + transformation instructions
   
   Result structure:
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ SYSTEM_PROMPT (DecorVision AI - spatial reasoning, decor integration)       │
   │                                                                             │
   │ USER REQUEST:                                                               │
   │ Create a grand floral arch. Event type: Indian Destination Wedding.       │
   │ Venue space: Grand Terminus 1 at Fairmont Mumbai.                          │
   │                                                                             │
   │ IMPORTANT INSTRUCTIONS:                                                    │
   │ - The first image (input_image) is the venue space to transform            │
   │ - The second image (image_prompt) is the design style reference           │
   │ - Do not change walls, floor, ceiling, windows, pillars...                 │
   │ - Apply design elements (florals, drapery, lighting, furniture)           │
   │ - Maintain photorealistic, professional event photography                 │
   └─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
4. PREPARE FLUX API PAYLOAD
   {
     "prompt": "SYSTEM_PROMPT + USER REQUEST + INSTRUCTIONS",
     "input_image": "base64_venue_image",
     "image_prompt": "base64_design_image",
     "width": 1024,
     "height": 768
   }
          │
          ▼
5. FLUX API CALL (Async Polling)
   - Submit request → Get task_id + polling_url
   - Poll every 3 seconds (max 100 attempts = 5 min)
   - Status: "Ready" → Download result
          │
          ▼
6. RESPONSE
   {
     "success": true,
     "image_data": "base64_generated_image",
     "input_mode": "dual_image",
     "task_id": "task_xxx"
   }
```

### SYSTEM_PROMPT Role

The SYSTEM_PROMPT (defined at `server.py:63-168`) provides the **DecorVision AI** persona with:

1. **Spatial Reasoning**: How to analyze venue dimensions, lighting, focal zones
2. **Decor Integration**: How to map design elements to appropriate zones
3. **Feasibility Check**: How to flag conflicts, suggest alternatives
4. **Output Deliverables**: What to generate (visualizations, documentation)
5. **Constraints**: Safety, cultural sensitivity, sustainability notes

This ensures FLUX model understands:
- What the venue looks like (input_image)
- What design to apply (image_prompt)
- How to merge them while maintaining structural integrity
USER INPUT                          FRONTEND PROCESSING                  BACKEND RECEIVES
─────────────────────────────────────────────────────────────────────────────────────

Text Prompt              ──────►    Direct string              ──────►    req.prompt (str)
                                    No transformation

Event Type Selection     ──────►    Selected from list         ──────►    req.function_type (str|null)
                                    (e.g., "Indian Destination Wedding")

Venue Space Selection    ──────►    Click triggers modal       ──────►    req.space (str|null)
                                    AngleModal for angle

Reference Image          ──────►    FileReader reads as        ──────►    req.reference_image (base64|null)
                                    base64, strips prefix

Session ID               ──────►    crypto.randomUUID()         ──────►    Generated in backend
                                    Stored in component state         (not in request)
```

### Backend Processing

```
1. REQUEST RECEIVED (GenerateRequest)
         │
         ▼
2. BUILD PROMPT
   - Take user.prompt
   - Add function_type if exists
   - Add space context "at Fairmont Mumbai"
   - Prepend SYSTEM_PROMPT (DecorVision AI persona)
         │
         ▼
3. FLUX API CALL (TODO - not implemented)
   - Has reference_image flag
   - Sends combined prompt to external AI
   - Currently returns placeholder error
         │
         ▼
4. RESPONSE
   - If success: { success: true, image_data: base64, description: str }
   - If failed: { success: false, error: str }
```

### Data Models

#### GenerateRequest (Frontend → Backend)
```python
class GenerateRequest(BaseModel):
    prompt: str                              # User's design description
    function_type: Optional[str] = None     # Event type (e.g., "Indian Destination Wedding")
    space: Optional[str] = None              # Venue space (e.g., "Grand Terminus 1")
    venue_image: Optional[str] = None       # Base64 - Venue to transform (from angle)
    design_image: Optional[str] = None       # Base64 - Design inspiration (from upload/template)
    reference_image: Optional[str] = None    # Base64 - Legacy support (treated as design_image)
```

#### FLUX API Payload (Backend → FLUX)
```python
# Full payload sent to FLUX API
{
    "prompt": "SYSTEM_PROMPT + USER_REQUEST + INSTRUCTIONS",
    "input_image": "base64_venue_image",      # The venue to transform
    "image_prompt": "base64_design_image",    # The design style to apply
    "width": 1024,
    "height": 768
}
```

#### API Response (Backend → Frontend)
```python
{
    "success": True,
    "image_data": "base64_generated_image",
    "mime_type": "image/png",
    "description": "Design generated based on venue and design references",
    "input_mode": "dual_image" | "venue_only" | "design_only" | "text_only",
    "task_id": "task_xxx"
}
```

---

## 4. API Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/` | Health check | ✅ Working |
| POST | `/api/generate` | AI image generation (FLUX Kontext Pro) | ✅ Working |
| POST | `/api/moodboard/save` | Save image to DB | ✅ Working (optional MongoDB) |
| GET | `/api/moodboard/{session_id}` | Get saved images | ✅ Working (optional MongoDB) |
| POST | `/api/moodboard/download-pdf` | Export to PDF | ✅ Working |
| POST | `/api/moodboard/download-ppt` | Export to PPTX | ✅ Working |
| GET | `/api/templates` | List templates | ✅ Working |
| GET | `/api/templates/download/{filename}` | Download template | ✅ Working |

---

## 5. Feature Implementation Status

### Completed (P0)
- [x] Landing page with Fairmont + LoversAI branding
- [x] Glassmorphism design system throughout
- [x] Studio page with sidebar + canvas layout
- [x] Venue space selection (6 spaces)
- [x] Event type selection (7 types)
- [x] Reference image upload (file + template)
- [x] Angle selection modal for venue spaces
- [x] AI image generation flow (FLUX API)
- [x] Dual image-to-image support (venue + design)
- [x] Add to moodboard functionality
- [x] Moodboard modal with grid view
- [x] PDF export
- [x] PPTX export
- [x] Templates page and download

### Pending (P1)
- [ ] Save moodboards to MongoDB (persistence)
- [ ] Generation history
- [ ] Image quality/resolution options

### Future (P2)
- [ ] User accounts/auth
- [ ] Share moodboard via link
- [ ] Multiple moodboard collections
- [ ] Cost estimation integration

---

## 6. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Tailwind CSS | Styling |
| Radix UI | UI primitives (dialogs, dropdowns, etc.) |
| Lucide React | Icons |
| Axios | HTTP client |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.x | Runtime |
| FastAPI | Web framework |
| Motor | Async MongoDB |
| httpx | HTTP client |
| reportlab | PDF generation |
| python-pptx | PPTX generation |

### External Services
| Service | Purpose |
|---------|---------|
| FLUX API (Black Forest Labs) | AI image generation with dual image-to-image support |
| MongoDB | Data persistence |
| Google Fonts | Typography (Cormorant Garamond, Manrope) |

---

## 7. Design System Rules

### Glassmorphism Mandates
- **NEVER** use solid flat colors for backgrounds, cards, or buttons
- **ALWAYS** use: `backdrop-blur-*`, `bg-white/5`, `bg-black/40`, `border-white/20`
- Backgrounds must have transparency: `bg-white/5` to `bg-white/15`
- Borders: `border-white/10` to `border-white/30`

### Typography
- **Headings**: Cormorant Garamond (serif) - elegant, luxury feel
- **Body/UI**: Manrope (sans-serif) - clean, modern

### Color Palette (Forbidden)
- ❌ Solid gold
- ❌ Flat opaque colors (teal, purple gradients)
- ❌ Solid primary buttons
- ✅ Use white with opacity: `text-white`, `text-white/70`, `text-white/40`

### CSS Classes (Custom)
| Class | Purpose |
|-------|---------|
| `.glass-panel` | Standard glassmorphism card |
| `.glass-panel-heavy` | Heavy blur modal card |
| `.glass-button` | Glassmorphism button |
| `.glass-input` | Glassmorphism input field |
| `.glass-pill` | Inactive filter pill |
| `.glass-pill-active` | Active filter pill |
| `.glass-scroll` | Custom scrollbar |

---

## 8. File Structure Reference

```
Fairmount-x-Loversai/
├── backend/
│   ├── server.py              # API entry point (543 lines)
│   │   ├── Line 36-43: GenerateRequest model (venue_image, design_image, reference_image)
│   │   ├── Line 63-168: SYSTEM_PROMPT (DecorVision AI persona)
│   │   ├── Line 170-178: build_prompt() helper function
│   │   ├── Line 184-369: POST /generate (FLUX Kontext Pro integration)
│   │   │   - Line 188: Combine user input
│   │   │   - Lines 193-210: Build flux_prompt with SYSTEM_PROMPT
│   │   │   - Lines 224-246: Prepare FLUX payload
│   │   │   - Lines 248-294: Submit + Poll for result
│   │   │   - Lines 342-362: Download and return
│   │   ├── Line 371-384: POST /moodboard/save
│   │   ├── Line 386-393: GET /moodboard/{session_id}
│   │   ├── Line 395-441: POST /moodboard/download-pdf
│   │   ├── Line 443-492: POST /moodboard/download-ppt
│   │   ├── Line 500-513: GET /templates
│   │   ├── Line 515-524: GET /templates/download/{filename}
│   │   └── Line 23: MongoDB connection (optional)
│   ├── requirements.txt       # 127 dependencies
│   ├── .env                   # MongoDB, FLUX_API_KEY, FLUX_API_URL, CORS_ORIGINS
│   └── data/
│       ├── templates.json     # Template metadata
│       └── templates/         # Downloadable PPTX files
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Routes: /, /studio, /templates
│   │   ├── index.css          # Glassmorphism CSS classes
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Hero + About + Footer
│   │   │   ├── StudioPage.jsx     # Main workspace
│   │   │   └── TemplatesPage.jsx  # Template gallery
│   │   ├── components/
│   │   │   ├── studio/
│   │   │   │   ├── Sidebar.jsx        # Filters + upload
│   │   │   │   ├── Canvas.jsx         # Prompt + generate
│   │   │   │   ├── AngleModal.jsx     # Venue angle carousel
│   │   │   │   ├── TemplateRefModal.jsx # Template picker
│   │   │   │   └── MoodboardModal.jsx # Saved images grid
│   │   │   └── ui/             # Radix UI components (30+)
│   │   ├── lib/utils.js
│   │   └── hooks/use-toast.js
│   └── package.json           # 58 dependencies
│
├── design_guidelines.json     # Strict glassmorphism rules
├── project_overview.md        # AI system context
├── memory/PRD.md              # Product requirements
└── test_reports/              # Test results
```

---

## 9. Key Constants

### Venue Spaces (Sidebar.jsx)
```javascript
SPACE_OPTIONS = [
  { name: "Grand Terminus 1", type: "TERMINUS", angles: ["Front", "Right", "Left"] },
  { name: "Infinity Ballroom", type: "BALLROOM", angles: ["Front", "Right", "Left"] },
  { name: "Entrance+Foyer", type: "FOYER", angles: ["Front", "Right", "Left"] },
  { name: "Madeleine de Proust", type: "LOUNGE", angles: ["Panoramic", "Right", "Left"] },
  { name: "Aeon Ballroom", type: "BALLROOM", angles: ["Panoramic", "Right"] },
  { name: "Sky Terrace", type: "TERRACE", angles: ["Panoramic", "Right", "Left"] },
]
```

### Event Types (Sidebar.jsx)
```javascript
EVENT_OPTIONS = [
  "Ultra-Luxury Wedding",
  "Indian Destination Wedding",
  "Corporate Conference",
  "Global Exhibition",
  "Fashion Show",
  "Product Launch",
  "Cultural Festival"
]
```

---

## 10. FLUX API Integration (Black Forest Labs)

### Overview
The system uses FLUX Kontext Pro API (`flux-kontext-pro`) for image-to-image generation with dual image support. The model receives a comprehensive prompt that includes:

1. **SYSTEM_PROMPT** - DecorVision AI persona with spatial reasoning instructions
2. **USER_REQUEST** - User's prompt + event type + venue space
3. **TRANSFORMATION_INSTRUCTIONS** - How to merge venue + design images

### API Endpoint
- **URL**: Configured in `.env` as `FLUX_API_URL`
- **Default**: `https://api.bfl.ai/v1/flux-kontext-pro`
- **Model**: `flux-kontext-pro` (image editing model)
- **Authentication**: Header `x-key` (lowercase) with API key from `FLUX_API_KEY`

### Complete Prompt Structure

```python
# The prompt sent to FLUX contains 3 parts:
prompt = f"""{SYSTEM_PROMPT}

USER REQUEST:
{user_prompt}

IMPORTANT INSTRUCTIONS:
- The first image (input_image) is the venue space to transform - keep its structural elements intact
- The second image (image_prompt) is the design style reference - apply its aesthetic to the venue
- Do not change walls, floor, ceiling, windows, pillars, or room layout
- Apply the design elements (florals, drapery, lighting, furniture) onto the venue
- Maintain photorealistic, professional event photography quality
- Consider lighting, shadows, and perspective consistency
- Output a single transformed venue image showing the designed event space"""
```

### Request Payload

```python
{
  "prompt": "SYSTEM_PROMPT + USER REQUEST + INSTRUCTIONS (full text)",
  "input_image": "base64_encoded_venue_image",
  "image_prompt": "base64_encoded_design_image",
  "width": 1024,
  "height": 768,
}
```

### Workflow
1. **Submit Request** → Get task_id and polling_url
2. **Poll for Result** → Every 3 seconds, max 5 minutes
3. **Download Image** → Convert to base64 and return

### Error Handling
| Status | Meaning | Action |
|--------|---------|--------|
| 401 | Invalid API key | Return error |
| 402 | Insufficient credits | Return error |
| 422 | image_prompt rejected | Retry without image_prompt (fallback) |
| 429 | Rate limited | Return error |
| Timeout | >5 minutes | Return timeout error |

### Input Modes
| Mode | Description | Payload |
|------|-------------|---------|
| `dual_image` | Both venue + design images | input_image + image_prompt |
| `venue_only` | Only venue image | input_image only |
| `design_only` | Only design image | input_image only (as design) |
| `text_only` | No images | No images in payload |

### Environment Variables
```
FLUX_API_KEY=your_api_key_here
FLUX_API_URL=https://api.bfl.ai/v1/flux-kontext-pro
```

### Backend Implementation
- File: `backend/server.py`
- Line 188: `user_prompt = build_prompt(req)` - Combines user input
- Lines 193-210: `flux_prompt` - Full prompt with SYSTEM_PROMPT
- Lines 224-246: FLUX API payload preparation
- Lines 248-294: Submit + Poll for result
- Lines 342-362: Download and return result

### Background Assets
- Landing page background: `https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/prqxmpyt_b354_ho_00_p_1024x768.jpg`
- Studio page: Same image with heavy blur overlay (`backdrop-blur-3xl`)

---

## 11. Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fairmont_loversai
CORS_ORIGINS=http://localhost:3000
FLUX_API_KEY=your_flux_api_key_here
FLUX_API_URL=https://api.bfl.ai/v1/flux-kontext-pro
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 12. Running the Application

### Frontend
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn server:app --reload
# Runs on http://localhost:8000
```

---

## 12. Critical Notes for Development

1. **FLUX API Integration**: The `/api/generate` endpoint now uses FLUX Kontext Pro with:
   - Dual image support (venue + design reference)
   - SYSTEM_PROMPT included in every request
   - Async polling for image generation (max 5 min)
   - Requires valid `FLUX_API_KEY` in `.env`

2. **MongoDB Optional**: App works without MongoDB (moodboard features disabled). Add `MONGO_URL` in `.env` for persistence.

3. **Glassmorphism Override**: When using Radix UI components, you MUST override their default styling to match glassmorphism. Check design_guidelines.json for exact classes.

4. **Testing**: All interactive elements must have `data-testid` attributes in kebab-case.

5. **Prompt Flow**:
   - User input → `build_prompt()` → combines prompt + function_type + space
   - Full prompt = SYSTEM_PROMPT + USER_REQUEST + TRANSFORMATION_INSTRUCTIONS
   - Sent to FLUX as `prompt` field with `input_image` + `image_prompt`

6. **SYSTEM_PROMPT Location**: Defined at `server.py:63-168` as DecorVision AI persona with spatial reasoning and decor integration instructions.

---

## 13. Quick Reference Commands

| Action | Command |
|--------|---------|
| Start frontend | `cd frontend && npm start` |
| Start backend | `cd backend && source venv/bin/activate && uvicorn server:app --reload` |
| Add new component | Use glassmorphism classes from index.css |
| Add new API endpoint | Add to server.py following existing pattern |
| Test API endpoint | `curl -X POST http://localhost:8000/api/generate -H "Content-Type: application/json" -d '{"prompt":"test"}'` |

---

*End of Project Memory*
