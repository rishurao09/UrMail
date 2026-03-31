"""
UrMail Configuration — Central config for the entire backend.
"""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
EMBEDDING_MODEL = "text-embedding-004"

# Decision Engine Thresholds
AUTO_REPLY_THRESHOLD = 0.9
SUGGEST_THRESHOLD = 0.6

# RAG Settings
RAG_TOP_K = 5
CHUNK_SIZE = 400  # tokens approx
CHUNK_OVERLAP = 50

# Subscription Tiers
SUBSCRIPTION_TIERS = {
    "free": {
        "max_kbs_per_month": 1,
        "kb_active_days": 7,
    },
    "pro": {
        "max_kbs_per_month": 5,
        "kb_active_days": 30,
    },
    "elite": {
        "max_kbs_per_month": 10,
        "kb_active_days": 30,
    },
}

# ChromaDB
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_data")
