"""
UrMail Document Processor — Extract, clean, and chunk documents for the KB.
Supports .txt, .pdf, .docx formats.
"""
import re
from typing import Optional


def extract_text(content: bytes, filename: str) -> str:
    """Extract text from uploaded document based on file extension."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext == "txt":
        return content.decode("utf-8", errors="ignore")
    elif ext == "pdf":
        return _extract_pdf(content)
    elif ext == "docx":
        return _extract_docx(content)
    else:
        # Try to decode as text
        return content.decode("utf-8", errors="ignore")


def _extract_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    try:
        from PyPDF2 import PdfReader
        import io

        reader = PdfReader(io.BytesIO(content))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""


def _extract_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    try:
        from docx import Document
        import io

        doc = Document(io.BytesIO(content))
        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""


def clean_text(text: str) -> str:
    """Clean extracted text — remove noise, normalize whitespace."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)

    # Remove common noise patterns
    text = re.sub(r'Page \d+ of \d+', '', text)
    text = re.sub(r'©.*?\d{4}', '', text)

    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n\r\t]', '', text)

    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 400,
    chunk_overlap: int = 50,
) -> list[dict]:
    """
    Split text into overlapping chunks for embedding.
    Tries to split on paragraph/sentence boundaries.
    Returns list of {text, index, char_start, char_end}.
    """
    if not text.strip():
        return []

    # Split on paragraphs first
    paragraphs = re.split(r'\n\n+', text)

    chunks = []
    current_chunk = ""
    current_start = 0
    char_pos = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Estimate token count (~4 chars per token)
        estimated_tokens = len(current_chunk + " " + para) // 4

        if estimated_tokens > chunk_size and current_chunk:
            # Save current chunk
            chunks.append({
                "text": current_chunk.strip(),
                "index": len(chunks),
                "char_start": current_start,
                "char_end": char_pos,
            })

            # Start new chunk with overlap
            overlap_text = current_chunk.strip()[-chunk_overlap * 4:]  # Approximate overlap
            current_chunk = overlap_text + " " + para
            current_start = char_pos - len(overlap_text)
        else:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
                current_start = char_pos

        char_pos += len(para) + 2  # +2 for \n\n

    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append({
            "text": current_chunk.strip(),
            "index": len(chunks),
            "char_start": current_start,
            "char_end": char_pos,
        })

    return chunks


def process_document(content: bytes, filename: str) -> list[dict]:
    """
    Full document processing pipeline:
    1. Extract text
    2. Clean text
    3. Chunk text
    """
    raw_text = extract_text(content, filename)
    if not raw_text:
        return []

    cleaned = clean_text(raw_text)
    if not cleaned:
        return []

    chunks = chunk_text(cleaned)
    return chunks
