from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import io
import uuid
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import httpx  # For calling external APIs like Flux
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging FIRST (before any logging calls)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI and APIRouter
app = FastAPI()
api_router = APIRouter(prefix="/api")

# MongoDB connection
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'fairmount_loversai')]
    logger.info("MongoDB connected successfully")
except Exception as e:
    logger.warning(f"MongoDB connection failed: {e}. Moodboard features will be disabled.")
    client = None
    db = None

# Models
class GenerateRequest(BaseModel):
    prompt: str
    function_type: Optional[str] = None
    theme: Optional[str] = None
    space: Optional[str] = None
    venue_image: Optional[str] = None  # base64 - The actual venue (from angle/upload)
    design_image: Optional[str] = None  # base64 - Design inspiration (from template/upload)
    reference_image: Optional[str] = None  # base64 - Legacy support (treated as design_image)

class MoodboardImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    image_data: str  # base64
    prompt: str
    filters: dict = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MoodboardSaveRequest(BaseModel):
    session_id: str
    image_data: str
    prompt: str
    filters: dict = {}

class DownloadRequest(BaseModel):
    images: List[dict]  # [{image_data: base64, prompt: str}]

SYSTEM_PROMPT = """\
### SYSTEM ROLE
You are "DecorVision AI" — an expert wedding design assistant specializing in spatial reasoning, decor integration, and photorealistic visualization. You help wedding designers merge client-chosen decor concepts with real venue photography while ensuring dimensional accuracy, aesthetic harmony, and practical feasibility.

### CORE OBJECTIVE
Analyze user-provided venue images + decor references → Generate dimensionally-aware, photorealistic visualizations showing how the decor integrates into the venue → Provide feasibility notes, placement guidance, and optimization suggestions.

### INPUT SPECIFICATION (Require from User)
┌─ Venue Data ───────────────────────────────┐
│ • Photos: 3+ angles (wide, mid, detail)    │
│ • Dimensions: L×W×H (ft/m) + ceiling height│
│ • Scale refs: door height, tile size, etc. │
│ • Fixed elements: pillars, stage, outlets  │
│ • Lighting: natural/artificial, color temp │
└────────────────────────────────────────────┘

┌─ Decor Design Data ────────────────────────┐
│ • Inspiration: mood boards, product links  │
│ • Items list: florals, drapery, lighting, │
│   furniture, centerpieces, signage         │
│ • Style keywords: "rustic", "glam", etc.   │
│ • Color palette: HEX/RGB + material prefs  │
│ • Budget tier: low/mid/high (affects density)│
└────────────────────────────────────────────┘

┌─ Client Context ───────────────────────────┐
│ • Guest count + seating layout needs       │
│ • Cultural requirements: mandap/chuppah   │
│ • Must-have vs. flexible elements          │
│ • Accessibility/safety constraints         │
└────────────────────────────────────────────┘

### PROCESSING WORKFLOW
1️⃣ SPATIAL ANALYSIS
   • Estimate scale using architectural cues or provided dims
   • Map focal zones: entrance, ceremony, reception, photo areas
   • Analyze lighting direction, intensity, color temperature
   • Identify traffic flow & sightline constraints

2️⃣ DECOR MAPPING & ADAPTATION
   • Match decor items to appropriate venue zones
   • Scale elements proportionally (e.g., arch height vs ceiling)
   • Adjust colors to complement venue palette + ambient light
   • Apply style-consistent textures/materials

3️⃣ FEASIBILITY CHECK & OPTIMIZATION
   • Flag conflicts: oversized items, crowded layouts, view blocks
   • Suggest alternatives if decor doesn't fit dims/budget
   • Recommend placement tweaks for visual balance + guest flow
   • Validate structural safety (weight limits, mounting points)

4️⃣ VISUALIZATION GENERATION
   • Create 3-5 photorealistic composite images:
     - Wide establishing shot
     - Detail close-ups (centerpiece, backdrop)
     - Guest-eye perspective (seated view)
   • Optional: 2D layout diagram with measurements
   • Maintain consistent shadows, perspective, lighting

### OUTPUT DELIVERABLES
✅ Visualizations:
   • 3-5 high-res rendered images (JPG/PNG)
   • Optional: 360° interactive view or short animation

✅ Documentation:
   • Annotated placement guide with dimensions
   • Itemized decor list with quantities + estimated costs
   • Feasibility report: what works, trade-offs, alternatives

✅ Communication:
   • Client-friendly explanation of design choices
   • Highlight "wow factor" elements + practical notes
   • Invite feedback for iterative refinement

### CONSTRAINTS & ETHICS
⚠️ Never invent dimensions — state assumptions clearly
⚠️ Avoid unsafe suggestions (heavy decor on weak structures)
⚠️ Respect cultural sensitivities + accessibility needs
⚠️ Disclose: AI visualizations are conceptual, not construction plans
⚠️ Prioritize sustainability: suggest reusable/rentable options

### STYLE & TONE GUIDELINES
•  Professional yet warm — you're collaborating with a designer
•  Use simple language for client-facing notes
•  Be specific: "Place 8ft floral arch 2ft left of entrance pillar"
•  Proactively suggest: "Consider uplighting here to enhance texture"

### ERROR HANDLING
If input is insufficient:
→ Request missing data politely with examples
→ Offer to proceed with estimated assumptions (flagged clearly)
→ Provide low-fidelity mockup first if high-res isn't feasible

### EXAMPLE USER PROMPT TEMPLATE
"I'm designing a wedding for [150 guests] at [outdoor garden venue].
Venue dims: [40ft x 60ft, 12ft ceiling clearance].
Style: ['enchanted forest' with gold accents].
Must-haves: [floral arch, hanging lanterns, round tables with greenery].
Budget: [mid-tier].
Attached: [venue_photos.zip], [decor_inspiration.pdf].
Please show me how this decor integrates into my space with sizing notes."
"""

# Helper: build prompt
def build_prompt(req: GenerateRequest) -> str:
    parts = [req.prompt]
    if req.function_type:
        parts.append(f"Event type: {req.function_type}")
    if req.space:
        parts.append(f"Venue space: {req.space} at Fairmont Mumbai")
    base = ". ".join(parts)
    return base

@api_router.get("/")
async def root():
    return {"message": "Fairmont x LoversAI API"}

@api_router.post("/generate")
async def generate_image(req: GenerateRequest):
    try:
        session_id = str(uuid.uuid4())
        user_prompt = build_prompt(req)
        
        logger.info(f"Generating with prompt: {user_prompt[:100]}...")
        
        # Build comprehensive prompt for FLUX - includes SYSTEM_PROMPT + user request + event context
        # The SYSTEM_PROMPT provides the "DecorVision AI" persona with spatial reasoning instructions
        flux_prompt = f"""{SYSTEM_PROMPT}

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
        
        # Handle image inputs - support both new dual-image format and legacy reference_image
        venue_image = req.venue_image
        design_image = req.design_image
        
        # Legacy support: if reference_image exists, treat it as design_image
        if req.reference_image and not design_image:
            design_image = req.reference_image
            logger.info("Using legacy reference_image as design_image")
        
        has_venue = bool(venue_image)
        has_design = bool(design_image)
        
        logger.info(f"=== API RECEIVED ===")
        logger.info(f"prompt: {user_prompt[:50]}...")
        logger.info(f"function_type: {req.function_type}")
        logger.info(f"space: {req.space}")
        logger.info(f"venue_image provided: {bool(venue_image)}, length: {len(venue_image) if venue_image else 0}")
        logger.info(f"design_image provided: {bool(design_image)}, length: {len(design_image) if design_image else 0}")
        logger.info(f"reference_image provided: {bool(req.reference_image)}, length: {len(req.reference_image) if req.reference_image else 0}")
        
        # =========================================================
        # FLUX API INTEGRATION - Black Forest Labs
        
        # =========================================================
        # FLUX API INTEGRATION - Black Forest Labs
        # Model: flux-kontext-pro (image editing model)
        # =========================================================
        
        flux_api_key = os.environ.get('FLUX_API_KEY', '')
        flux_api_url = os.environ.get('FLUX_API_URL', 'https://api.bfl.ai/v1/flux-kontext-pro')
        
        if not flux_api_key:
            return {
                "success": False,
                "error": "FLUX_API_KEY not configured. Please set FLUX_API_KEY in .env file.",
                "description": "API key missing"
            }
        
        # Prepare the API request payload
        # input_image = venue (primary - space to edit)
        # image_prompt = template (style reference)
        api_payload = {
            "prompt": flux_prompt,
            "width": 1024,
            "height": 768,
        }
        
        # Add images based on availability
        if has_venue and has_design:
            # Dual image input - venue + design inspiration
            api_payload["input_image"] = venue_image
            api_payload["image_prompt"] = design_image
            logger.info("Using dual image-to-image mode (venue + design)")
        elif has_venue:
            # Single venue image only
            api_payload["input_image"] = venue_image
            logger.info("Using single image mode (venue only)")
        elif has_design:
            # Single design image only
            api_payload["input_image"] = design_image
            logger.info("Using single image mode (design only)")
        
        # Submit request to FLUX API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                flux_api_url,
                json=api_payload,
                headers={
                    "x-key": flux_api_key,  # Note: lowercase 'x-key'
                    "Content-Type": "application/json"
                }
            )
            
            logger.info(f"FLUX API status: {response.status_code}")
            
            # Handle error responses
            if response.status_code == 401:
                return {"success": False, "error": "Invalid API key", "description": "Check FLUX_API_KEY in .env"}
            elif response.status_code == 402:
                return {"success": False, "error": "Insufficient credits", "description": "Top up your BFL account"}
            elif response.status_code == 422:
                # Fallback: retry without image_prompt
                logger.warning("422 error - retrying without image_prompt...")
                fallback_payload = {
                    "prompt": flux_prompt,
                    "input_image": venue_image if has_venue else design_image,
                    "width": 1024,
                    "height": 768,
                }
                response = await client.post(
                    flux_api_url,
                    json=fallback_payload,
                    headers={
                        "x-key": flux_api_key,
                        "Content-Type": "application/json"
                    }
                )
                logger.info(f"Fallback status: {response.status_code}")
            elif response.status_code == 429:
                return {"success": False, "error": "Rate limited", "description": "Wait and try again"}
            elif response.status_code not in [200, 201, 202]:
                return {"success": False, "error": f"API error: {response.status_code}", "description": response.text[:200]}
            
            # Get task ID and polling URL from response
            data = response.json()
            task_id = data.get("id", "")
            polling_url = data.get("polling_url", f"https://api.bfl.ai/v1/get_result?id={task_id}")
            
            logger.info(f"Task ID: {task_id}, Polling for result...")
        
        # =========================================================
        # POLL FOR RESULT (async polling)
        # =========================================================
        
        max_attempts = 100  # Max 5 minutes (100 * 3s)
        result_url = None
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            for attempt in range(1, max_attempts + 1):
                await asyncio.sleep(3)  # Poll every 3 seconds
                
                poll_response = await client.get(
                    polling_url,
                    headers={"x-key": flux_api_key, "Content-Type": "application/json"}
                )
                
                if poll_response.status_code != 200:
                    logger.warning(f"Poll attempt {attempt}: status {poll_response.status_code}")
                    continue
                
                poll_data = poll_response.json()
                status = poll_data.get("status", "unknown")
                
                logger.info(f"Poll {attempt}: status = {status}")
                
                if status == "Ready":
                    result = poll_data.get("result", {})
                    # Try multiple possible keys for the image URL
                    result_url = (
                        result.get("sample") or
                        result.get("url") or
                        result.get("image_url") or
                        result.get("output")
                    )
                    if result_url:
                        logger.info(f"Result ready after {attempt * 3}s")
                        break
                    else:
                        return {"success": False, "error": "No image in result", "description": str(poll_data)[:200]}
                
                elif status in ["Error", "Failed", "FAILED", "error"]:
                    return {"success": False, "error": "Generation failed", "description": str(poll_data)[:200]}
            
            if not result_url:
                return {"success": False, "error": "Timeout", "description": "Generation timed out after 5 minutes"}
        
        # =========================================================
        # DOWNLOAD OUTPUT IMAGE
        # =========================================================
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            img_response = await client.get(result_url)
            
            if img_response.status_code != 200:
                return {"success": False, "error": "Failed to download image", "description": f"Status: {img_response.status_code}"}
            
            # Convert to base64
            img_base64 = base64.b64encode(img_response.content).decode("utf-8")
            
            return {
                "success": True,
                "image_data": img_base64,
                "mime_type": "image/png",
                "description": f"Design generated based on venue and design references",
                "input_mode": "dual_image" if (has_venue and has_design) else ("venue_only" if has_venue else "design_only" if has_design else "text_only"),
                "task_id": task_id
            }
        
    except httpx.TimeoutException:
        logger.error("FLUX API timeout")
        return {"success": False, "error": "Request timed out", "description": "Try again later"}
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.post("/moodboard/save")
async def save_to_moodboard(req: MoodboardSaveRequest):
    if db is None:
        return {"success": False, "error": "Database not available", "id": None}
    doc = {
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "image_data": req.image_data,
        "prompt": req.prompt,
        "filters": req.filters,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.moodboard_images.insert_one(doc)
    return {"success": True, "id": doc["id"]}

@api_router.get("/moodboard/{session_id}")
async def get_moodboard(session_id: str):
    if db is None:
        return {"images": [], "error": "Database not available"}
    images = await db.moodboard_images.find(
        {"session_id": session_id}, {"_id": 0}
    ).to_list(100)
    return {"images": images}

@api_router.post("/moodboard/download-pdf")
async def download_pdf(req: DownloadRequest):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas as pdf_canvas
    from reportlab.lib.utils import ImageReader

    buffer = io.BytesIO()
    c = pdf_canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Title page
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 2 * inch, "Fairmont x LoversAI")
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 2.6 * inch, "Moodboard Collection")
    c.setFont("Helvetica-Oblique", 11)
    c.drawCentredString(width / 2, height - 3.2 * inch, datetime.now(timezone.utc).strftime("%B %d, %Y"))
    c.showPage()

    for i, img_item in enumerate(req.images):
        try:
            img_bytes = base64.b64decode(img_item["image_data"])
            img_reader = ImageReader(io.BytesIO(img_bytes))

            img_w = width - 2 * inch
            img_h = img_w * 0.65
            x = inch
            y = height - img_h - 1.5 * inch

            c.drawImage(img_reader, x, y, width=img_w, height=img_h, preserveAspectRatio=True)

            c.setFont("Helvetica", 10)
            prompt_text = img_item.get("prompt", "")[:80]
            c.drawString(inch, y - 0.3 * inch, f"Design {i + 1}: {prompt_text}")
            c.showPage()
        except Exception as e:
            logger.error(f"PDF image error: {e}")
            continue

    c.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=moodboard.pdf"}
    )

@api_router.post("/moodboard/download-ppt")
async def download_ppt(req: DownloadRequest):
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Title slide
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    txBox = slide.shapes.add_textbox(Inches(2), Inches(2.5), Inches(9), Inches(2))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = "Fairmont x LoversAI"
    p.font.size = Pt(44)
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = "Moodboard Collection"
    p2.font.size = Pt(24)
    p2.alignment = PP_ALIGN.CENTER

    for i, img_item in enumerate(req.images):
        try:
            img_bytes = base64.b64decode(img_item["image_data"])
            img_stream = io.BytesIO(img_bytes)

            slide = prs.slides.add_slide(prs.slide_layouts[6])
            slide.shapes.add_picture(img_stream, Inches(1), Inches(0.5), Inches(11.333), Inches(6))

            txBox = slide.shapes.add_textbox(Inches(1), Inches(6.7), Inches(11), Inches(0.6))
            tf = txBox.text_frame
            p = tf.paragraphs[0]
            p.text = f"Design {i + 1}: {img_item.get('prompt', '')[:60]}"
            p.font.size = Pt(14)
            p.alignment = PP_ALIGN.LEFT
        except Exception as e:
            logger.error(f"PPT image error: {e}")
            continue

    buffer = io.BytesIO()
    prs.save(buffer)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": "attachment; filename=moodboard.pptx"}
    )

import json

# Templates endpoints
TEMPLATES_DIR = ROOT_DIR / "data" / "templates"
TEMPLATES_CONFIG = ROOT_DIR / "data" / "templates.json"

@api_router.get("/templates")
async def list_templates():
    try:
        if TEMPLATES_CONFIG.exists():
            with open(TEMPLATES_CONFIG, "r") as f:
                templates = json.load(f)
            # Check which files actually exist
            for t in templates:
                t["available"] = (TEMPLATES_DIR / t["filename"]).exists()
            return {"templates": templates}
        return {"templates": []}
    except Exception as e:
        logger.error(f"Templates error: {e}")
        return {"templates": []}

@api_router.get("/templates/download/{filename}")
async def download_template(filename: str):
    filepath = TEMPLATES_DIR / filename
    if not filepath.exists():
        return {"error": "Template file not found"}
    return StreamingResponse(
        open(filepath, "rb"),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()
