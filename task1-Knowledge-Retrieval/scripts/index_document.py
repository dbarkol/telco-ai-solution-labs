"""One-time document indexing script."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import get_search_config, validate_config
from src.embeddings import EmbeddingsClient
from src.pdf_processor import PDFProcessor
from src.search_client import SearchService


def main():
    """Index the PDF document into Azure AI Search."""
    # Validate configuration
    print("Validating configuration...")
    errors = validate_config()
    if errors:
        print("Configuration errors:")
        for error in errors:
            print(f"  - {error}")
        print("\nPlease set the required environment variables in your .env file.")
        sys.exit(1)

    # Define paths
    pdf_path = Path(__file__).parent.parent / "data" / "CvUYJmmeNQwM9W6XY24h3g95.pdf"

    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}")
        sys.exit(1)

    print(f"Processing: {pdf_path.name}")

    # Initialize components
    processor = PDFProcessor(chunk_size=1000, chunk_overlap=200)
    embeddings_client = EmbeddingsClient()
    search_service = SearchService()

    # Step 1: Create/update index
    print("\n[1/4] Creating search index...")
    search_service.create_or_update_index()
    config = get_search_config()
    print(f"  Index '{config.index_name}' ready")

    # Step 2: Extract and chunk PDF
    print("\n[2/4] Extracting and chunking PDF...")
    chunks = list(processor.chunk_document(pdf_path))
    print(f"  Created {len(chunks)} chunks")

    # Show sample chunks
    if chunks:
        print(f"  First chunk preview: {chunks[0].content[:100]}...")
        print(f"  Pages covered: {set(p for c in chunks for p in c.page_numbers)}")

    # Step 3: Generate embeddings
    print("\n[3/4] Generating embeddings...")
    texts = [chunk.content for chunk in chunks]
    embeddings = embeddings_client.get_embeddings_batch(texts)
    print(f"  Generated {len(embeddings)} embeddings")
    print(f"  Embedding dimension: {len(embeddings[0]) if embeddings else 'N/A'}")

    # Step 4: Index documents
    print("\n[4/4] Indexing documents...")
    search_service.index_chunks(
        chunks=chunks,
        embeddings=embeddings,
        document_name="T-Mobile 5G Gateway User Guide",
    )
    print("  Indexing complete!")

    # Summary
    print("\n" + "=" * 50)
    print("SUCCESS!")
    print("=" * 50)
    print(f"Index name: {config.index_name}")
    print(f"Total chunks indexed: {len(chunks)}")
    print(f"Source document: {pdf_path.name}")
    print("\nYou can now run the Streamlit app with: streamlit run app.py")


if __name__ == "__main__":
    main()
