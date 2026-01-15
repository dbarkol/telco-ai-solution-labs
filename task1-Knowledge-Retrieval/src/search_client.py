"""Azure AI Search client operations."""

from datetime import datetime, timezone

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    HnswAlgorithmConfiguration,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SimpleField,
    VectorSearch,
    VectorSearchProfile,
)
from azure.search.documents.models import VectorizedQuery

from src.config import get_search_config
from src.pdf_processor import DocumentChunk


def get_index_schema(index_name: str) -> SearchIndex:
    """Create the search index schema.

    Args:
        index_name: Name for the search index.

    Returns:
        SearchIndex configuration object.
    """
    return SearchIndex(
        name=index_name,
        fields=[
            # Primary key
            SimpleField(
                name="chunk_id",
                type=SearchFieldDataType.String,
                key=True,
                filterable=True,
            ),
            # Main content for full-text search
            SearchableField(
                name="content",
                type=SearchFieldDataType.String,
                analyzer_name="en.microsoft",
            ),
            # Vector embedding field (1536 dimensions for text-embedding-ada-002)
            SearchField(
                name="content_vector",
                type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                searchable=True,
                vector_search_dimensions=1536,
                vector_search_profile_name="vector-profile",
            ),
            # Metadata fields
            SimpleField(
                name="page_numbers",
                type=SearchFieldDataType.Collection(SearchFieldDataType.Int32),
                filterable=True,
                facetable=True,
            ),
            SearchableField(
                name="section_title",
                type=SearchFieldDataType.String,
                filterable=True,
                facetable=True,
            ),
            SimpleField(
                name="chunk_index",
                type=SearchFieldDataType.Int32,
                sortable=True,
            ),
            SimpleField(
                name="document_name",
                type=SearchFieldDataType.String,
                filterable=True,
            ),
            # Timestamp for versioning
            SimpleField(
                name="indexed_at",
                type=SearchFieldDataType.DateTimeOffset,
                filterable=True,
                sortable=True,
            ),
        ],
        vector_search=VectorSearch(
            algorithms=[
                HnswAlgorithmConfiguration(
                    name="hnsw-config",
                    parameters={
                        "m": 4,
                        "efConstruction": 400,
                        "efSearch": 500,
                        "metric": "cosine",
                    },
                ),
            ],
            profiles=[
                VectorSearchProfile(
                    name="vector-profile",
                    algorithm_configuration_name="hnsw-config",
                ),
            ],
        ),
    )


class SearchService:
    """Handles Azure AI Search operations."""

    def __init__(self):
        """Initialize the search service with Azure AI Search configuration."""
        config = get_search_config()
        credential = AzureKeyCredential(config.api_key)

        self.index_client = SearchIndexClient(
            endpoint=config.endpoint,
            credential=credential,
        )
        self.search_client = SearchClient(
            endpoint=config.endpoint,
            index_name=config.index_name,
            credential=credential,
        )
        self.index_name = config.index_name

    def create_or_update_index(self) -> None:
        """Create or update the search index with the defined schema."""
        index_schema = get_index_schema(self.index_name)
        self.index_client.create_or_update_index(index_schema)

    def index_chunks(
        self,
        chunks: list[DocumentChunk],
        embeddings: list[list[float]],
        document_name: str,
    ) -> None:
        """Index document chunks with their embeddings.

        Args:
            chunks: List of document chunks to index.
            embeddings: List of embedding vectors corresponding to chunks.
            document_name: Name of the source document.
        """
        documents = []
        timestamp = datetime.now(timezone.utc)

        for chunk, embedding in zip(chunks, embeddings):
            doc = {
                "chunk_id": chunk.chunk_id,
                "content": chunk.content,
                "content_vector": embedding,
                "page_numbers": chunk.page_numbers,
                "section_title": chunk.section_title or "",
                "chunk_index": chunk.chunk_index,
                "document_name": document_name,
                "indexed_at": timestamp.isoformat(),
            }
            documents.append(doc)

        # Upload in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            self.search_client.upload_documents(batch)

    def hybrid_search(
        self,
        query: str,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict]:
        """Perform hybrid search combining vector and keyword search.

        Args:
            query: The search query text.
            query_embedding: The embedding vector for the query.
            top_k: Number of results to return.

        Returns:
            List of search results with content and metadata.
        """
        vector_query = VectorizedQuery(
            vector=query_embedding,
            k_nearest_neighbors=top_k,
            fields="content_vector",
        )

        results = self.search_client.search(
            search_text=query,
            vector_queries=[vector_query],
            select=["chunk_id", "content", "page_numbers", "section_title"],
            top=top_k,
        )

        return [
            {
                "chunk_id": r["chunk_id"],
                "content": r["content"],
                "page_numbers": r["page_numbers"],
                "section_title": r.get("section_title", ""),
                "score": r["@search.score"],
            }
            for r in results
        ]

    def delete_index(self) -> None:
        """Delete the search index."""
        self.index_client.delete_index(self.index_name)
