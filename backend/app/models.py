"""
UrMail Data Models — Pydantic schemas for the entire system.
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────

class EmailCategory(str, Enum):
    SUPPORT = "support"
    SALES = "sales"
    PERSONAL = "personal"
    SPAM = "spam"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ActionDecision(str, Enum):
    AUTO_REPLY = "auto_reply"
    SUGGEST_REPLY = "suggest_reply"
    ESCALATE = "escalate"


class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    ELITE = "elite"


# ─── Email Models ─────────────────────────────────────────────────

class Email(BaseModel):
    id: str
    sender: str
    sender_email: str
    subject: str
    body: str
    timestamp: datetime
    is_read: bool = False
    category: Optional[EmailCategory] = None
    priority: Optional[Priority] = None
    priority_explanation: Optional[str] = None
    confidence: Optional[float] = None
    action: Optional[ActionDecision] = None
    summary: Optional[str] = None
    action_items: list[str] = Field(default_factory=list)
    suggested_reply: Optional[str] = None
    final_reply: Optional[str] = None
    status: str = "pending"  # pending, auto_sent, draft, escalated


class EmailProcessResult(BaseModel):
    email_id: str
    category: EmailCategory
    priority: Priority
    priority_explanation: str
    summary: str
    action_items: list[str]
    suggested_reply: str
    confidence: float
    confidence_reasoning: str
    action: ActionDecision
    rag_context_used: bool = False
    kb_sources: list[str] = Field(default_factory=list)


class ClassificationResult(BaseModel):
    category: EmailCategory
    confidence: float


class PriorityResult(BaseModel):
    priority: Priority
    explanation: str
    score: float


class ConversationIntelligence(BaseModel):
    summary: str
    action_items: list[str]
    suggested_reply: str


# ─── Knowledge Base Models ────────────────────────────────────────

class KnowledgeBase(BaseModel):
    id: str
    user_id: str
    name: str
    document_count: int = 0
    chunk_count: int = 0
    created_at: datetime
    expiry_date: datetime
    is_active: bool = True
    last_updated: datetime


class DocumentInfo(BaseModel):
    id: str
    kb_id: str
    filename: str
    chunk_count: int = 0
    uploaded_at: datetime


class KBCreateRequest(BaseModel):
    name: str
    user_id: str = "demo_user"


class KBCreateResponse(BaseModel):
    kb: KnowledgeBase
    message: str


# ─── User / Subscription Models ──────────────────────────────────

class User(BaseModel):
    id: str
    email: str
    name: str
    tier: SubscriptionTier = SubscriptionTier.FREE
    kbs_created_this_month: int = 0
    month_reset_date: datetime


class UsageLimitCheck(BaseModel):
    allowed: bool
    current_count: int
    max_allowed: int
    tier: SubscriptionTier
    message: str


# ─── Dashboard Models ────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_emails: int
    auto_handled: int
    auto_handled_percent: float
    pending_review: int
    escalated: int
    categories: dict[str, int]
    priorities: dict[str, int]


# ─── Decision Engine Models ──────────────────────────────────────

class DecisionResult(BaseModel):
    action: ActionDecision
    confidence: float
    reasoning: str


# ─── Correction / Learning Models ────────────────────────────────

class CorrectionRequest(BaseModel):
    email_id: str
    corrected_reply: str


class CorrectionEntry(BaseModel):
    email_id: str
    original_reply: str
    corrected_reply: str
    category: EmailCategory
    timestamp: datetime
