"""
UrMail KB Service — Knowledge Base management with subscription limits.
"""
from datetime import datetime, timedelta
from typing import Optional
from app.models import (
    KnowledgeBase, DocumentInfo, User, UsageLimitCheck, SubscriptionTier,
)
from app.config import SUBSCRIPTION_TIERS
from app.knowledge_base.document_processor import process_document
from app.knowledge_base.vector_store import get_vector_store
import uuid


# In-memory stores for MVP
_knowledge_bases: dict[str, KnowledgeBase] = {}
_documents: dict[str, DocumentInfo] = {}
_users: dict[str, User] = {
    "demo_user": User(
        id="demo_user",
        email="demo@urmail.ai",
        name="Demo User",
        tier=SubscriptionTier.PRO,
        kbs_created_this_month=0,
        month_reset_date=datetime.now().replace(day=1) + timedelta(days=32),
    ),
}


def check_user_limit(user_id: str) -> UsageLimitCheck:
    """Check if user can create a new knowledge base."""
    user = _users.get(user_id)
    if not user:
        return UsageLimitCheck(
            allowed=False,
            current_count=0,
            max_allowed=0,
            tier=SubscriptionTier.FREE,
            message="User not found",
        )

    # Check if monthly reset is needed
    if datetime.now() >= user.month_reset_date:
        user.kbs_created_this_month = 0
        user.month_reset_date = datetime.now().replace(day=1) + timedelta(days=32)

    tier_config = SUBSCRIPTION_TIERS[user.tier.value]
    max_allowed = tier_config["max_kbs_per_month"]
    allowed = user.kbs_created_this_month < max_allowed

    return UsageLimitCheck(
        allowed=allowed,
        current_count=user.kbs_created_this_month,
        max_allowed=max_allowed,
        tier=user.tier,
        message=f"{'Can create' if allowed else 'Limit reached'}: {user.kbs_created_this_month}/{max_allowed} KBs this month ({user.tier.value} tier)",
    )


def create_knowledge_base(user_id: str, name: str) -> KnowledgeBase | str:
    """Create a new knowledge base, respecting subscription limits."""
    limit = check_user_limit(user_id)
    if not limit.allowed:
        return f"KB limit reached: {limit.message}"

    user = _users.get(user_id)
    if not user:
        return "User not found"

    tier_config = SUBSCRIPTION_TIERS[user.tier.value]
    kb_id = str(uuid.uuid4())[:8]

    kb = KnowledgeBase(
        id=kb_id,
        user_id=user_id,
        name=name,
        created_at=datetime.now(),
        expiry_date=datetime.now() + timedelta(days=tier_config["kb_active_days"]),
        is_active=True,
        last_updated=datetime.now(),
    )

    _knowledge_bases[kb_id] = kb
    user.kbs_created_this_month += 1

    return kb


async def upload_document(kb_id: str, filename: str, content: bytes, user_id: str = "demo_user") -> DocumentInfo | str:
    """Upload and process a document into a knowledge base."""
    kb = _knowledge_bases.get(kb_id)
    if not kb:
        return "Knowledge base not found"
    if not kb.is_active:
        return "Knowledge base has expired"
    if kb.user_id != user_id:
        return "Access denied"

    # Process document
    chunks = process_document(content, filename)
    if not chunks:
        return "No text could be extracted from the document"

    # Store in vector DB
    store = get_vector_store()
    texts = [c["text"] for c in chunks]
    metadatas = [
        {
            "kb_id": kb_id,
            "document_name": filename,
            "chunk_index": c["index"],
            "user_id": user_id,
        }
        for c in chunks
    ]
    ids = [f"{kb_id}_{filename}_{c['index']}" for c in chunks]

    added = store.add_documents(
        texts=texts,
        metadatas=metadatas,
        ids=ids,
        user_id=user_id,
    )

    # Create document record
    doc_id = str(uuid.uuid4())[:8]
    doc = DocumentInfo(
        id=doc_id,
        kb_id=kb_id,
        filename=filename,
        chunk_count=added,
        uploaded_at=datetime.now(),
    )
    _documents[doc_id] = doc

    # Update KB stats
    kb.document_count += 1
    kb.chunk_count += added
    kb.last_updated = datetime.now()

    return doc


def get_active_kbs(user_id: str) -> list[KnowledgeBase]:
    """Get all active knowledge bases for a user."""
    expire_old_kbs()
    return [
        kb for kb in _knowledge_bases.values()
        if kb.user_id == user_id
    ]


def expire_old_kbs():
    """Mark expired KBs as inactive."""
    now = datetime.now()
    for kb in _knowledge_bases.values():
        if kb.is_active and now >= kb.expiry_date:
            kb.is_active = False


def delete_knowledge_base(kb_id: str, user_id: str = "demo_user") -> bool:
    """Delete a knowledge base and its vector data."""
    kb = _knowledge_bases.get(kb_id)
    if not kb or kb.user_id != user_id:
        return False

    # Delete from vector store
    store = get_vector_store()
    store.delete_knowledge_base(kb_id, user_id)

    # Remove document records
    _documents_to_remove = [
        doc_id for doc_id, doc in _documents.items()
        if doc.kb_id == kb_id
    ]
    for doc_id in _documents_to_remove:
        del _documents[doc_id]

    del _knowledge_bases[kb_id]
    return True


def get_user(user_id: str) -> Optional[User]:
    """Get user info."""
    return _users.get(user_id)


def update_user_tier(user_id: str, tier: SubscriptionTier) -> bool:
    """Update user subscription tier."""
    user = _users.get(user_id)
    if not user:
        return False
    user.tier = tier
    return True


async def seed_sample_kb(user_id: str = "demo_user"):
    """Seed the knowledge base with sample FAQ data for demos."""
    from app.data.mock_data import SAMPLE_FAQ_CONTENT, SAMPLE_POLICIES_CONTENT

    # Check if already seeded
    existing = get_active_kbs(user_id)
    if existing:
        return existing[0]

    # Create sample KB
    kb = create_knowledge_base(user_id, "Customer Support KB")
    if isinstance(kb, str):
        return None

    # Upload FAQ
    faq_result = await upload_document(
        kb_id=kb.id,
        filename="faq.txt",
        content=SAMPLE_FAQ_CONTENT.encode("utf-8"),
        user_id=user_id,
    )

    # Upload policies
    policies_result = await upload_document(
        kb_id=kb.id,
        filename="company_policies.txt",
        content=SAMPLE_POLICIES_CONTENT.encode("utf-8"),
        user_id=user_id,
    )

    return kb
