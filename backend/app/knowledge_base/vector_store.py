"""
UrMail Vector Store — ChromaDB interface for knowledge base storage and retrieval.
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import CHROMA_PERSIST_DIR
from app.knowledge_base.embedding_service import generate_embeddings, generate_single_embedding
import os

_vector_store = None


class VectorStore:
    """Wrapper around ChromaDB for knowledge base operations."""

    def __init__(self):
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        self.client = chromadb.Client(ChromaSettings(
            anonymized_telemetry=False,
        ))
        self._collections: dict[str, chromadb.Collection] = {}

    def _get_collection(self, user_id: str = "demo_user") -> chromadb.Collection:
        """Get or create a collection for a user."""
        name = f"urmail_kb_{user_id}"
        if name not in self._collections:
            self._collections[name] = self.client.get_or_create_collection(
                name=name,
                metadata={"hnsw:space": "l2"},
            )
        return self._collections[name]

    def add_documents(
        self,
        texts: list[str],
        metadatas: list[dict],
        ids: list[str],
        user_id: str = "demo_user",
    ) -> int:
        """Add document chunks to the vector store."""
        if not texts:
            return 0

        collection = self._get_collection(user_id)

        # Generate embeddings
        embeddings = generate_embeddings(texts)

        if embeddings:
            collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings,
            )
        else:
            # Let ChromaDB use its default embedding
            collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids,
            )

        return len(texts)

    def similarity_search(
        self,
        query: str,
        user_id: str = "demo_user",
        top_k: int = 5,
    ) -> dict:
        """Search for similar documents."""
        collection = self._get_collection(user_id)

        if collection.count() == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        try:
            query_embedding = generate_single_embedding(query)
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, collection.count()),
                include=["documents", "metadatas", "distances"],
            )
            return results
        except Exception as e:
            print(f"Similarity search error: {e}")
            # Fallback: text-based search
            try:
                results = collection.query(
                    query_texts=[query],
                    n_results=min(top_k, collection.count()),
                    include=["documents", "metadatas", "distances"],
                )
                return results
            except Exception as e2:
                print(f"Fallback search error: {e2}")
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    def delete_knowledge_base(self, kb_id: str, user_id: str = "demo_user") -> bool:
        """Delete all documents belonging to a knowledge base."""
        collection = self._get_collection(user_id)
        try:
            # Get all documents with matching kb_id
            results = collection.get(
                where={"kb_id": kb_id},
                include=["metadatas"],
            )
            if results and results["ids"]:
                collection.delete(ids=results["ids"])
            return True
        except Exception as e:
            print(f"Delete KB error: {e}")
            return False

    def get_kb_chunk_count(self, kb_id: str, user_id: str = "demo_user") -> int:
        """Count chunks for a specific knowledge base."""
        collection = self._get_collection(user_id)
        try:
            results = collection.get(
                where={"kb_id": kb_id},
                include=[],
            )
            return len(results["ids"]) if results else 0
        except Exception:
            return 0


def get_vector_store() -> VectorStore:
    """Singleton accessor for VectorStore."""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
