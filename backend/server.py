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
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Models
class GenerateRequest(BaseModel):
    prompt: str
    function_type: Optional[str] = None
    theme: Optional[str] = None
    space: Optional[str] = None
    reference_image: Optional[str] = None  # base64

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

# Helper: build prompt
def build_prompt(req: GenerateRequest) -> str:
    parts = [req.prompt]
    if req.function_type:
        parts.append(f"This is for a {req.function_type} ceremony")
    if req.theme:
        parts.append(f"Style: {req.theme}")
    if req.space:
        parts.append(f"Venue type: {req.space}")
    base = ". ".join(parts)
    return f"Generate a photorealistic, ultra-luxury Indian wedding venue design. {base}. The design should be elegant, grand, and feature beautiful lighting, floral arrangements, and premium decor. High quality architectural visualization, 4K detail."

@api_router.get("/")
async def root():
    return {"message": "Fairmont x LoversAI API"}

@api_router.post("/generate")
async def generate_image(req: GenerateRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return {"error": "API key not configured"}

        session_id = str(uuid.uuid4())
        chat = LlmChat(api_key=api_key, session_id=session_id, system_message="You are an expert luxury wedding venue designer. Generate stunning, photorealistic venue design images.")
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

        full_prompt = build_prompt(req)
        logger.info(f"Generating with prompt: {full_prompt[:100]}...")

        if req.reference_image:
            msg = UserMessage(
                text=f"Use this reference image as inspiration for the design. {full_prompt}",
                file_contents=[ImageContent(req.reference_image)]
            )
        else:
            msg = UserMessage(text=full_prompt)

        text, images = await chat.send_message_multimodal_response(msg)

        if images and len(images) > 0:
            return {
                "success": True,
                "image_data": images[0]['data'],
                "mime_type": images[0].get('mime_type', 'image/png'),
                "description": text or ""
            }
        else:
            return {"success": False, "error": "No image generated", "description": text or ""}

    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.post("/moodboard/save")
async def save_to_moodboard(req: MoodboardSaveRequest):
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
    client.close()
