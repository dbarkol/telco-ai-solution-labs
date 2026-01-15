"""PDF processing module with extraction and chunking."""

from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

import pdfplumber
import pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter


@dataclass
class DocumentChunk:
    """Represents a chunk of document text with metadata."""

    chunk_id: str
    content: str
    page_numbers: list[int]
    section_title: str | None
    chunk_index: int
    total_chunks: int


class PDFProcessor:
    """Handles PDF extraction and text chunking."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """Initialize the PDF processor.

        Args:
            chunk_size: Target size for each text chunk in characters.
            chunk_overlap: Number of overlapping characters between chunks.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def extract_text_pypdf(self, pdf_path: Path) -> list[tuple[int, str]]:
        """Extract text using pypdf.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            List of (page_number, text) tuples.
        """
        pages = []
        with open(pdf_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages.append((i + 1, text.strip()))
        return pages

    def extract_text_pdfplumber(self, pdf_path: Path) -> list[tuple[int, str]]:
        """Extract text using pdfplumber for better layout handling.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            List of (page_number, text) tuples.
        """
        pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                pages.append((i + 1, text.strip()))
        return pages

    def extract_with_fallback(self, pdf_path: Path) -> list[tuple[int, str]]:
        """Try pypdf first, fall back to pdfplumber if extraction quality is poor.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            List of (page_number, text) tuples.
        """
        pages = self.extract_text_pypdf(pdf_path)

        # Check if extraction quality is acceptable
        total_chars = sum(len(text) for _, text in pages)
        if total_chars < 1000:  # Suspiciously low for a multi-page document
            pages = self.extract_text_pdfplumber(pdf_path)

        return pages

    def chunk_document(self, pdf_path: Path) -> Iterator[DocumentChunk]:
        """Process PDF and yield document chunks with metadata.

        Args:
            pdf_path: Path to the PDF file.

        Yields:
            DocumentChunk objects with content and metadata.
        """
        pages = self.extract_with_fallback(pdf_path)

        # Combine all text while tracking page boundaries
        full_text = ""
        page_boundaries: list[tuple[int, int, int]] = []  # (start_char, end_char, page_num)

        for page_num, text in pages:
            if not text:
                continue
            start = len(full_text)
            full_text += text + "\n\n"
            end = len(full_text)
            page_boundaries.append((start, end, page_num))

        # Split into chunks
        chunks = self.text_splitter.split_text(full_text)
        total_chunks = len(chunks)

        # Map chunks back to page numbers
        char_pos = 0
        for i, chunk_text in enumerate(chunks):
            chunk_start = full_text.find(chunk_text, char_pos)
            if chunk_start == -1:
                chunk_start = char_pos
            chunk_end = chunk_start + len(chunk_text)

            # Find which pages this chunk spans
            chunk_pages = []
            for start, end, page_num in page_boundaries:
                if chunk_start < end and chunk_end > start:
                    chunk_pages.append(page_num)

            yield DocumentChunk(
                chunk_id=f"chunk_{i:04d}",
                content=chunk_text,
                page_numbers=chunk_pages or [1],
                section_title=None,
                chunk_index=i,
                total_chunks=total_chunks,
            )

            char_pos = chunk_start + 1
