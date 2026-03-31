"""
UrMail RAG Engine — Retrieval-Augmented Generation pipeline.
Retrieves relevant knowledge base chunks and generates grounded replies.
"""
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_MODEL, RAG_TOP_K
from app.knowledge_base.vector_store import get_vector_store
import json
import re


def _get_client():
    return genai.Client(api_key=GEMINI_API_KEY)


async def retrieve_context(email_text: str, user_id: str = "demo_user") -> dict:
    """
    Retrieve relevant chunks from the knowledge base using similarity search.
    Returns context string and metadata.
    """
    store = get_vector_store()
    results = store.similarity_search(
        query=email_text,
        user_id=user_id,
        top_k=RAG_TOP_K,
    )

    if not results or len(results["documents"][0]) == 0:
        return {
            "context": "",
            "sources": [],
            "has_context": False,
            "avg_similarity": 0.0,
        }

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0] if "distances" in results else [0.5] * len(documents)

    # Build context from retrieved chunks
    context_parts = []
    sources = []
    for i, (doc, meta) in enumerate(zip(documents, metadatas)):
        context_parts.append(f"[Source {i+1}: {meta.get('document_name', 'KB')}]\n{doc}")
        sources.append(meta.get("document_name", "Unknown"))

    # Convert distances to similarity scores (ChromaDB returns L2 distances)
    similarities = [max(0, 1 - d / 2) for d in distances]
    avg_similarity = sum(similarities) / len(similarities) if similarities else 0

    return {
        "context": "\n\n---\n\n".join(context_parts),
        "sources": list(set(sources)),
        "has_context": True,
        "avg_similarity": round(avg_similarity, 3),
        "chunk_count": len(documents),
    }


async def generate_rag_reply(
    email_subject: str,
    email_body: str,
    category: str,
    context: str,
    has_context: bool,
) -> dict:
    """
    Generate a reply using RAG with strict grounding instructions.
    """
    if has_context and context:
        prompt = f"""You are a professional email reply assistant for a company.
Generate a helpful, accurate reply to the following email using ONLY the provided knowledge base context.

STRICT RULES:
1. ONLY use information from the knowledge base context below
2. DO NOT hallucinate or make up information
3. If the context doesn't contain enough information to fully answer, say "I need to check with our team" for those parts
4. Be professional, empathetic, and concise
5. Address the sender's concerns directly

Knowledge Base Context:
{context}

Email Category: {category}
Email Subject: {email_subject}
Email Body: {email_body}

Generate a professional reply. Also rate your confidence that this reply is accurate (0.0-1.0) and explain why.

Respond with ONLY a JSON object (no markdown):
{{"reply": "<professional reply text>", "confidence": <0.0-1.0>, "confidence_reasoning": "<why this confidence level>"}}
"""
    else:
        prompt = f"""You are a professional email reply assistant. 
Generate a helpful reply to this email. Since no knowledge base data is available, provide a general helpful response but indicate that specific details will require follow-up.

Email Category: {category}
Email Subject: {email_subject}
Email Body: {email_body}

RULES:
1. Be professional and empathetic
2. Acknowledge the sender's concern
3. For specific questions you can't answer, say you'll check with the team
4. Keep confidence low since no KB data is available

Respond with ONLY a JSON object (no markdown):
{{"reply": "<professional reply text>", "confidence": <0.0-1.0>, "confidence_reasoning": "<why this confidence level>"}}
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
        return {
            "reply": result["reply"],
            "confidence": float(result.get("confidence", 0.5)),
            "confidence_reasoning": result.get("confidence_reasoning", ""),
        }
    except Exception as e:
        print(f"RAG reply generation error: {e}")
        return {
            "reply": f"Thank you for reaching out. I've received your email regarding \"{email_subject}\" and I'm looking into this for you. A team member will follow up shortly with specific details.",
            "confidence": 0.3,
            "confidence_reasoning": "Fallback response — LLM generation failed",
        }


async def generate_summary_and_actions(subject: str, body: str) -> dict:
    """Generate summary and action items for an email."""
    prompt = f"""Analyze this email and extract key information.

Email Subject: {subject}
Email Body: {body}

Respond with ONLY a JSON object (no markdown):
{{"summary": "<2-3 sentence summary>", "action_items": ["<action 1>", "<action 2>"]}}
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
        return {
            "summary": result.get("summary", "Email received and pending review."),
            "action_items": result.get("action_items", ["Review and respond"]),
        }
    except Exception as e:
        print(f"Summary generation error: {e}")
        return {
            "summary": f"Email from sender regarding: {subject}",
            "action_items": ["Review email", "Respond to sender"],
        }
