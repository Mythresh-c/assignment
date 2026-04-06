"""
main.py — FastAPI application with inline orchestrator logic.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents import GeneratorAgent, ReviewerAgent

app = FastAPI(title="Educational Content Generator", version="1.0.0")

# ── CORS for React dev server ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request schema ───────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    grade: int = Field(..., ge=1, le=10, description="Student grade (1-10)")
    topic: str = Field(..., min_length=1, description="Topic to generate content for")


# ── Orchestrator endpoint ────────────────────────────────────────────────

@app.post("/generate")
def generate(req: GenerateRequest):
    """
    Orchestrator pipeline:
      1. GeneratorAgent  → draft
      2. ReviewerAgent   → review
      3. If fail → GeneratorAgent with feedback (one pass) → refined
    """
    generator = GeneratorAgent()
    reviewer = ReviewerAgent()

    # ── Stage 1: Generate draft ──────────────────────────────────────
    try:
        draft = generator.run(grade=req.grade, topic=req.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GeneratorAgent failed: {str(e)}")

    # ── Stage 2: Review draft ────────────────────────────────────────
    try:
        review = reviewer.run(content=draft, grade=req.grade)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ReviewerAgent failed: {str(e)}")

    # ── Stage 3: Refine if review failed ─────────────────────────────
    refined = None
    if review.get("status") == "fail":
        feedback = review.get("feedback", [])
        try:
            refined = generator.run(
                grade=req.grade, topic=req.topic, feedback=feedback
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Refinement failed: {str(e)}"
            )

    return {
        "draft": draft,
        "review": review,
        "refined": refined,
    }
