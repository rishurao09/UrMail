"""
UrMail Agent Executor — Orchestrates the complete email processing pipeline.
This is the main coordinator that runs all modules in sequence.
"""
from datetime import datetime
from app.models import (
    Email, EmailProcessResult, ActionDecision,
    EmailCategory, CorrectionEntry,
)
from app.modules.classifier import classify_email
from app.modules.priority_engine import score_priority
from app.modules.rag_engine import retrieve_context, generate_rag_reply, generate_summary_and_actions
from app.modules.decision_engine import make_decision


# In-memory stores for MVP
processed_emails: dict[str, Email] = {}
corrections_store: list[CorrectionEntry] = []
actions_log: list[dict] = []


async def process_email(email: Email) -> EmailProcessResult:
    """
    Full AI pipeline for processing a single email:
    1. Classify email
    2. Score priority
    3. Generate summary & action items
    4. Retrieve KB context (RAG)
    5. Generate reply
    6. Make decision (auto/suggest/escalate)
    7. Execute action
    """
    # Step 1: Classification
    classification = await classify_email(
        sender=email.sender,
        subject=email.subject,
        body=email.body,
    )

    # Step 2: Priority Scoring
    priority_result = await score_priority(
        sender=email.sender,
        sender_email=email.sender_email,
        subject=email.subject,
        body=email.body,
        category=classification.category.value,
    )

    # Step 3: Summary & Action Items
    intelligence = await generate_summary_and_actions(
        subject=email.subject,
        body=email.body,
    )

    # Step 4: RAG — Retrieve KB Context
    rag_context = await retrieve_context(
        email_text=f"{email.subject}\n{email.body}",
    )

    # Step 5: Generate Reply with RAG
    reply_result = await generate_rag_reply(
        email_subject=email.subject,
        email_body=email.body,
        category=classification.category.value,
        context=rag_context["context"],
        has_context=rag_context["has_context"],
    )

    # Check for prior corrections to improve reply
    improved_reply = _check_corrections(
        email.subject, email.body, classification.category, reply_result["reply"]
    )
    if improved_reply:
        reply_result["reply"] = improved_reply
        reply_result["confidence"] = min(reply_result["confidence"] + 0.05, 1.0)

    # Step 6: Decision Engine
    decision = await make_decision(
        category=classification.category,
        confidence=reply_result["confidence"],
        has_kb_match=rag_context["has_context"],
        priority=priority_result.priority.value,
    )

    # Step 7: Execute Action
    status = _execute_action(decision.action, email.id)

    # Update email object
    email.category = classification.category
    email.priority = priority_result.priority
    email.priority_explanation = priority_result.explanation
    email.confidence = reply_result["confidence"]
    email.action = decision.action
    email.summary = intelligence["summary"]
    email.action_items = intelligence["action_items"]
    email.suggested_reply = reply_result["reply"]
    email.status = status
    email.is_read = True

    # Store processed email
    processed_emails[email.id] = email

    # Log action
    actions_log.append({
        "email_id": email.id,
        "action": decision.action.value,
        "confidence": reply_result["confidence"],
        "timestamp": datetime.now().isoformat(),
        "category": classification.category.value,
        "priority": priority_result.priority.value,
    })

    return EmailProcessResult(
        email_id=email.id,
        category=classification.category,
        priority=priority_result.priority,
        priority_explanation=priority_result.explanation,
        summary=intelligence["summary"],
        action_items=intelligence["action_items"],
        suggested_reply=reply_result["reply"],
        confidence=reply_result["confidence"],
        confidence_reasoning=reply_result["confidence_reasoning"],
        action=decision.action,
        rag_context_used=rag_context["has_context"],
        kb_sources=rag_context.get("sources", []),
    )


def _execute_action(action: ActionDecision, email_id: str) -> str:
    """Simulate action execution."""
    if action == ActionDecision.AUTO_REPLY:
        print(f"[AUTO] Sending auto-reply for email {email_id}")
        return "auto_sent"
    elif action == ActionDecision.SUGGEST_REPLY:
        print(f"[SUGGEST] Draft created for email {email_id}")
        return "draft"
    else:
        print(f"[ESCALATE] Escalating email {email_id} to human agent")
        return "escalated"


def store_correction(email_id: str, corrected_reply: str) -> bool:
    """Store a human correction for learning."""
    email = processed_emails.get(email_id)
    if not email:
        return False

    correction = CorrectionEntry(
        email_id=email_id,
        original_reply=email.suggested_reply or "",
        corrected_reply=corrected_reply,
        category=email.category or EmailCategory.SUPPORT,
        timestamp=datetime.now(),
    )
    corrections_store.append(correction)

    # Update the email with the corrected reply
    email.final_reply = corrected_reply
    email.status = "corrected_sent"
    processed_emails[email_id] = email

    return True


def _check_corrections(subject: str, body: str, category: EmailCategory, current_reply: str) -> str | None:
    """Check if similar corrections exist and use them as templates."""
    if not corrections_store:
        return None

    # Simple similarity: check if category matches and keywords overlap
    for correction in reversed(corrections_store[-10:]):  # Check last 10
        if correction.category == category:
            # Basic keyword overlap check
            correction_words = set(correction.corrected_reply.lower().split())
            current_words = set(body.lower().split())
            overlap = len(correction_words & current_words)
            if overlap > 3:
                return correction.corrected_reply
    return None


def get_dashboard_stats() -> dict:
    """Compute dashboard statistics from processed emails."""
    total = len(processed_emails)
    if total == 0:
        return {
            "total_emails": 0,
            "auto_handled": 0,
            "auto_handled_percent": 0.0,
            "pending_review": 0,
            "escalated": 0,
            "categories": {},
            "priorities": {},
        }

    auto = sum(1 for e in processed_emails.values() if e.status in ("auto_sent",))
    pending = sum(1 for e in processed_emails.values() if e.status in ("draft", "pending"))
    escalated = sum(1 for e in processed_emails.values() if e.status == "escalated")

    categories = {}
    priorities = {}
    for e in processed_emails.values():
        cat = e.category.value if e.category else "unknown"
        pri = e.priority.value if e.priority else "unknown"
        categories[cat] = categories.get(cat, 0) + 1
        priorities[pri] = priorities.get(pri, 0) + 1

    return {
        "total_emails": total,
        "auto_handled": auto,
        "auto_handled_percent": round((auto / total) * 100, 1) if total > 0 else 0,
        "pending_review": pending,
        "escalated": escalated,
        "categories": categories,
        "priorities": priorities,
    }
