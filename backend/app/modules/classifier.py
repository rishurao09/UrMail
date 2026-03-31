"""
UrMail Classifier — LLM-powered email classification module.
Uses Gemini to classify emails into Support, Sales, Personal, or Spam.
"""
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.models import EmailCategory, ClassificationResult
import json
import re


def _get_client():
    return genai.Client(api_key=GEMINI_API_KEY)


async def classify_email(sender: str, subject: str, body: str) -> ClassificationResult:
    """Classify an email using Gemini LLM."""
    prompt = f"""You are an email classification AI. Classify the following email into exactly ONE category.

Categories:
- "support": Customer support requests, technical issues, account problems, complaints
- "sales": Business inquiries, partnership proposals, pricing questions, demos requests
- "personal": Personal messages, social invitations, non-business communications
- "spam": Scam emails, unsolicited offers, phishing attempts, chain letters

Email:
From: {sender}
Subject: {subject}
Body: {body}

Respond with ONLY a JSON object (no markdown, no code blocks):
{{"category": "<category>", "confidence": <0.0-1.0>}}
"""
    try:
        client = _get_client()
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()
        # Strip markdown code blocks if present
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        result = json.loads(text)
        return ClassificationResult(
            category=EmailCategory(result["category"]),
            confidence=float(result.get("confidence", 0.85)),
        )
    except Exception as e:
        print(f"Classification error: {e}")
        # Fallback heuristic classification
        return _fallback_classify(sender, subject, body)


def _fallback_classify(sender: str, subject: str, body: str) -> ClassificationResult:
    """Heuristic fallback if LLM is unavailable."""
    text = f"{subject} {body}".lower()

    spam_signals = ["won", "lottery", "click here", "act now", "free", "scam", "!!!", "🎉", "massive sale"]
    support_signals = ["help", "issue", "problem", "can't", "error", "broken", "not working", "support", "reset", "urgent"]
    sales_signals = ["pricing", "partnership", "demo", "quote", "proposal", "license", "contract", "bulk", "discount"]

    spam_score = sum(1 for s in spam_signals if s in text)
    support_score = sum(1 for s in support_signals if s in text)
    sales_score = sum(1 for s in sales_signals if s in text)

    scores = {
        EmailCategory.SPAM: spam_score,
        EmailCategory.SUPPORT: support_score,
        EmailCategory.SALES: sales_score,
        EmailCategory.PERSONAL: 0.5,
    }

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]
    total = sum(scores.values()) or 1

    return ClassificationResult(
        category=best_category,
        confidence=round(min(best_score / total + 0.3, 0.95), 2),
    )
