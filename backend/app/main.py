"""
UrMail — Autonomous Email Operations Agent (AEOS)
Main FastAPI Application

API Endpoints for the complete email processing pipeline,
knowledge base management, and dashboard stats.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from app.models import (
    Email, EmailProcessResult, DashboardStats,
    CorrectionRequest, KBCreateRequest, KBCreateResponse,
    ActionDecision, SubscriptionTier,
)
from app.modules.agent_executor import (
    process_email, processed_emails, get_dashboard_stats,
    store_correction, actions_log,
)
from app.knowledge_base.kb_service import (
    create_knowledge_base, upload_document, get_active_kbs,
    delete_knowledge_base, check_user_limit, get_user,
    update_user_tier, seed_sample_kb,
)
from app.data.mock_data import MOCK_EMAILS


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: seed sample data."""
    print("🚀 UrMail AEOS starting up...")
    # Seed sample knowledge base
    await seed_sample_kb("demo_user")
    print("✅ Sample KB seeded successfully")

    # Pre-load mock emails into store
    for em_data in MOCK_EMAILS:
        email = Email(
            id=em_data["id"],
            sender=em_data["sender"],
            sender_email=em_data["sender_email"],
            subject=em_data["subject"],
            body=em_data["body"],
            timestamp=datetime.fromisoformat(em_data["timestamp"]),
        )
        if email.id not in processed_emails:
            processed_emails[email.id] = email
    print(f"✅ {len(MOCK_EMAILS)} mock emails loaded")

    yield
    print("👋 UrMail AEOS shutting down...")


app = FastAPI(
    title="UrMail — AEOS",
    description="Autonomous Email Operations Agent — AI-powered email triage, classification, and autonomous response system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ──────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "UrMail AEOS", "timestamp": datetime.now().isoformat()}


# ─── Email Endpoints ────────────────────────────────────────────

@app.get("/api/emails")
async def get_emails():
    """List all emails (unprocessed + processed)."""
    emails = sorted(
        processed_emails.values(),
        key=lambda e: e.timestamp,
        reverse=True,
    )
    return {"emails": [e.model_dump() for e in emails], "total": len(emails)}


@app.get("/api/emails/{email_id}")
async def get_email(email_id: str):
    """Get a specific email by ID."""
    email = processed_emails.get(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email.model_dump()


@app.post("/api/emails/{email_id}/process")
async def process_single_email(email_id: str):
    """Process a single email through the full AI pipeline."""
    email = processed_emails.get(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    result = await process_email(email)
    return result.model_dump()


@app.post("/api/emails/process-all")
async def process_all_emails():
    """Process all unprocessed emails."""
    results = []
    for email in processed_emails.values():
        if email.status == "pending":
            result = await process_email(email)
            results.append(result.model_dump())
    return {"processed": len(results), "results": results}


@app.post("/api/emails/{email_id}/correct")
async def correct_email_reply(email_id: str, request: CorrectionRequest):
    """Store a human correction for learning."""
    success = store_correction(email_id, request.corrected_reply)
    if not success:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "Correction stored successfully", "email_id": email_id}


@app.post("/api/emails/{email_id}/send")
async def send_reply(email_id: str):
    """Simulate sending the suggested reply."""
    email = processed_emails.get(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email.status = "auto_sent"
    email.final_reply = email.suggested_reply
    return {"message": "Reply sent (simulated)", "email_id": email_id}


@app.post("/api/emails/{email_id}/escalate")
async def escalate_email(email_id: str):
    """Manually escalate an email to human review."""
    email = processed_emails.get(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email.status = "escalated"
    email.action = ActionDecision.ESCALATE
    return {"message": "Email escalated to human agent", "email_id": email_id}


# ─── Dashboard Endpoints ────────────────────────────────────────

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    """Get dashboard statistics."""
    stats = get_dashboard_stats()
    return stats


@app.get("/api/dashboard/actions-log")
async def get_actions_log():
    """Get recent action log entries."""
    return {"log": actions_log[-50:], "total": len(actions_log)}


# ─── Knowledge Base Endpoints ────────────────────────────────────

@app.post("/api/kb/create")
async def create_kb(request: KBCreateRequest):
    """Create a new knowledge base."""
    result = create_knowledge_base(request.user_id, request.name)
    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)
    return KBCreateResponse(kb=result, message="Knowledge base created successfully").model_dump()


@app.get("/api/kb/list")
async def list_kbs(user_id: str = "demo_user"):
    """List all knowledge bases for a user."""
    kbs = get_active_kbs(user_id)
    return {"knowledge_bases": [kb.model_dump() for kb in kbs], "total": len(kbs)}


@app.post("/api/kb/{kb_id}/upload")
async def upload_kb_document(
    kb_id: str,
    file: UploadFile = File(...),
    user_id: str = Form("demo_user"),
):
    """Upload a document to a knowledge base."""
    if file.filename is None:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed_extensions = {".txt", ".pdf", ".docx"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed_extensions}")

    content = await file.read()
    result = await upload_document(kb_id, file.filename, content, user_id)

    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)

    return {
        "message": "Document uploaded and processed successfully",
        "document": result.model_dump(),
    }


@app.delete("/api/kb/{kb_id}")
async def delete_kb(kb_id: str, user_id: str = "demo_user"):
    """Delete a knowledge base."""
    success = delete_knowledge_base(kb_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return {"message": "Knowledge base deleted successfully"}


@app.get("/api/kb/limit")
async def check_limit(user_id: str = "demo_user"):
    """Check user's KB creation limit."""
    limit = check_user_limit(user_id)
    return limit.model_dump()


# ─── User Endpoints ─────────────────────────────────────────────

@app.get("/api/user/{user_id}")
async def get_user_info(user_id: str):
    """Get user information."""
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.model_dump()


@app.put("/api/user/{user_id}/tier")
async def change_tier(user_id: str, tier: str):
    """Change user subscription tier."""
    try:
        new_tier = SubscriptionTier(tier)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tier. Use: free, pro, elite")

    success = update_user_tier(user_id, new_tier)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Tier updated to {tier}"}


# ─── Demo Endpoints ─────────────────────────────────────────────

@app.post("/api/demo/run")
async def run_demo():
    """
    Run the full demo scenario:
    1. Seed KB (if not seeded)
    2. Process all mock emails
    3. Return results
    """
    # Ensure KB is seeded
    await seed_sample_kb("demo_user")

    # Process all pending emails
    results = []
    for email in processed_emails.values():
        if email.status == "pending":
            result = await process_email(email)
            results.append(result.model_dump())

    stats = get_dashboard_stats()

    return {
        "message": f"Demo complete! Processed {len(results)} emails.",
        "results": results,
        "stats": stats,
    }


@app.post("/api/demo/reset")
async def reset_demo():
    """Reset all data for a fresh demo."""
    processed_emails.clear()
    actions_log.clear()

    # Re-load mock emails
    for em_data in MOCK_EMAILS:
        email = Email(
            id=em_data["id"],
            sender=em_data["sender"],
            sender_email=em_data["sender_email"],
            subject=em_data["subject"],
            body=em_data["body"],
            timestamp=datetime.fromisoformat(em_data["timestamp"]),
        )
        processed_emails[email.id] = email

    return {"message": "Demo reset complete", "email_count": len(processed_emails)}
