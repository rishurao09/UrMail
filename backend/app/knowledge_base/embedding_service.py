"""
UrMail Embedding Service — Generate embeddings using Gemini API.
"""
from google import genai
from app.config import GEMINI_API_KEY, EMBEDDING_MODEL


def _get_client():
    return genai.Client(api_key=GEMINI_API_KEY)


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using Gemini embedding API.
    Falls back to simple hash-based embeddings if API fails.
    """
    if not texts:
        return []

    try:
        client = _get_client()
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=texts,
        )
        return [e.values for e in result.embeddings]
    except Exception as e:
        print(f"Embedding API error: {e}. Using fallback embeddings.")
        return _fallback_embeddings(texts)


def generate_single_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    results = generate_embeddings([text])
    return results[0] if results else _fallback_embedding(text)


def _fallback_embeddings(texts: list[str]) -> list[list[float]]:
    """Simple fallback: character-frequency based embeddings."""
    return [_fallback_embedding(t) for t in texts]


def _fallback_embedding(text: str, dim: int = 768) -> list[float]:
    """Generate a simple hash-based embedding as fallback."""
    import hashlib
    import struct

    text_bytes = text.encode("utf-8")
    embedding = []
    for i in range(dim):
        h = hashlib.md5(text_bytes + str(i).encode()).digest()
        val = struct.unpack("f", h[:4])[0]
        # Normalize to [-1, 1]
        val = (val % 2) - 1
        embedding.append(val)

    # Normalize vector
    norm = sum(v * v for v in embedding) ** 0.5
    if norm > 0:
        embedding = [v / norm for v in embedding]

    return embedding
