"""
UrMail Decision Engine — Decides whether to auto-reply, suggest, or escalate.
Core logic for autonomous email handling.
"""
from app.config import AUTO_REPLY_THRESHOLD, SUGGEST_THRESHOLD
from app.models import ActionDecision, DecisionResult, EmailCategory


async def make_decision(
    category: EmailCategory,
    confidence: float,
    has_kb_match: bool,
    priority: str,
) -> DecisionResult:
    """
    Decision Engine Logic:
    - confidence > 0.9 AND has KB match → AUTO_REPLY
    - 0.6 <= confidence <= 0.9 → SUGGEST_REPLY
    - confidence < 0.6 → ESCALATE
    
    Override rules:
    - Spam → always auto-handle (mark as spam)
    - Category is personal → always suggest (never auto-reply)
    - High priority + no KB match → escalate
    """
    reasoning_parts = []

    # Rule 1: Spam is always auto-handled
    if category == EmailCategory.SPAM:
        return DecisionResult(
            action=ActionDecision.AUTO_REPLY,
            confidence=0.98,
            reasoning="Spam detected — auto-flagging and archiving. No human review needed.",
        )

    # Rule 2: Personal emails always get suggestions
    if category == EmailCategory.PERSONAL:
        return DecisionResult(
            action=ActionDecision.SUGGEST_REPLY,
            confidence=confidence,
            reasoning="Personal email detected — providing suggested reply for human review.",
        )

    # Rule 3: High priority without KB match → escalate
    if priority == "high" and not has_kb_match:
        return DecisionResult(
            action=ActionDecision.ESCALATE,
            confidence=confidence,
            reasoning="High priority email with no knowledge base match — escalating to human agent.",
        )

    # Rule 4: Confidence-based decision
    if confidence >= AUTO_REPLY_THRESHOLD and has_kb_match:
        reasoning_parts.append(f"Confidence {confidence:.2f} exceeds auto-reply threshold ({AUTO_REPLY_THRESHOLD})")
        reasoning_parts.append("Knowledge base match found")
        return DecisionResult(
            action=ActionDecision.AUTO_REPLY,
            confidence=confidence,
            reasoning=" | ".join(reasoning_parts),
        )

    if confidence >= SUGGEST_THRESHOLD:
        reasoning_parts.append(f"Confidence {confidence:.2f} in suggest range ({SUGGEST_THRESHOLD}–{AUTO_REPLY_THRESHOLD})")
        if not has_kb_match:
            reasoning_parts.append("No KB match — reply needs human verification")
        return DecisionResult(
            action=ActionDecision.SUGGEST_REPLY,
            confidence=confidence,
            reasoning=" | ".join(reasoning_parts),
        )

    # Rule 5: Low confidence → escalate
    reasoning_parts.append(f"Confidence {confidence:.2f} below suggest threshold ({SUGGEST_THRESHOLD})")
    reasoning_parts.append("Escalating to human agent for manual handling")
    return DecisionResult(
        action=ActionDecision.ESCALATE,
        confidence=confidence,
        reasoning=" | ".join(reasoning_parts),
    )
