"""
UrMail Priority Engine — Scores emails as High/Medium/Low priority.
Considers keywords, sender importance, and urgency signals.
"""
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.models import Priority, PriorityResult
from app.data.mock_data import IMPORTANT_SENDERS, URGENCY_KEYWORDS
import json
import re


def _get_client():
    return genai.Client(api_key=GEMINI_API_KEY)


async def score_priority(
    sender: str,
    sender_email: str,
    subject: str,
    body: str,
    category: str,
) -> PriorityResult:
    """Score email priority using Gemini + heuristics."""
    prompt = f"""You are a priority scoring AI for an email triage system.
Score the priority of this email as High, Medium, or Low.

Consider:
1. Urgency keywords (deadline, ASAP, critical, etc.)
2. Sender importance (executive titles, known clients, VIP domains)
3. Business impact (revenue mentions, production issues, contract deadlines)
4. Time sensitivity (deadlines mentioned, expiring offers)

Email:
From: {sender} <{sender_email}>
Subject: {subject}
Category: {category}
Body: {body}

Respond with ONLY a JSON object (no markdown):
{{"priority": "high|medium|low", "explanation": "<brief reason>", "score": <0.0-1.0>}}
"""
    try:
        client = _get_client()
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        result = json.loads(text)
        return PriorityResult(
            priority=Priority(result["priority"]),
            explanation=result["explanation"],
            score=float(result.get("score", 0.5)),
        )
    except Exception as e:
        print(f"Priority scoring error: {e}")
        return _fallback_priority(sender_email, subject, body)


def _fallback_priority(sender_email: str, subject: str, body: str) -> PriorityResult:
    """Heuristic fallback for priority scoring."""
    text = f"{subject} {body}".lower()
    score = 0.3  # base score
    reasons = []

    # Check sender importance
    domain = sender_email.split("@")[-1] if "@" in sender_email else ""
    if domain in IMPORTANT_SENDERS:
        score += 0.3
        reasons.append("VIP sender domain")

    # Check urgency keywords
    urgency_hits = [kw for kw in URGENCY_KEYWORDS if kw in text]
    if urgency_hits:
        score += min(len(urgency_hits) * 0.1, 0.4)
        reasons.append(f"urgency keywords: {', '.join(urgency_hits[:3])}")

    # Check for financial mentions
    if any(word in text for word in ["$", "revenue", "contract", "deal", "budget"]):
        score += 0.15
        reasons.append("financial context detected")

    score = min(score, 1.0)

    if score >= 0.7:
        priority = Priority.HIGH
    elif score >= 0.4:
        priority = Priority.MEDIUM
    else:
        priority = Priority.LOW

    explanation = f"{priority.value.capitalize()} priority: {'; '.join(reasons)}" if reasons else f"{priority.value.capitalize()} priority: standard email"

    return PriorityResult(priority=priority, explanation=explanation, score=round(score, 2))
