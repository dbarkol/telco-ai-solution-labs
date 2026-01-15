"""RAG pipeline orchestration."""

import os
from dataclasses import dataclass

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

from src.config import get_chunking_config, get_openai_config
from src.embeddings import EmbeddingsClient
from src.search_client import SearchService

SYSTEM_PROMPT = """You are a helpful T-Mobile 5G Gateway support assistant.
Your role is to answer troubleshooting questions about the KVD21 5G Gateway device
using ONLY the information provided in the context below.

IMPORTANT GUIDELINES:
1. Only answer based on the provided context. If the answer is not in the context, say so clearly.
2. Be specific and provide step-by-step instructions when applicable.
3. Always cite the page number(s) where you found the information (e.g., "According to page 12...").
4. If the question is unclear, ask for clarification.
5. Format your response clearly with numbered steps for procedures.
6. If multiple solutions exist, present them in order of likelihood to resolve the issue.

CONTEXT FROM DOCUMENTATION:
{context}

Remember: Only use information from the context above. Do not make up information or provide general advice not grounded in the documentation."""


@dataclass
class RAGResponse:
    """Structured response from RAG pipeline."""

    answer: str
    sources: list[dict]
    confidence: str


class RAGPipeline:
    """Orchestrates the RAG retrieval and generation flow."""

    def __init__(self):
        """Initialize the RAG pipeline with all required clients."""
        self.embeddings_client = EmbeddingsClient()
        self.search_service = SearchService()

        config = get_openai_config()

        if config.use_managed_identity:
            # Use DefaultAzureCredential for managed identity / Azure CLI auth
            credential = DefaultAzureCredential()
            token_provider = get_bearer_token_provider(
                credential, "https://cognitiveservices.azure.com/.default"
            )
            self.llm_client = AzureOpenAI(
                azure_endpoint=config.endpoint,
                azure_ad_token_provider=token_provider,
                api_version=config.api_version,
            )
        else:
            # Fallback to API key if explicitly disabled
            self.llm_client = AzureOpenAI(
                azure_endpoint=config.endpoint,
                api_key=os.getenv("AZURE_OPENAI_API_KEY", ""),
                api_version=config.api_version,
            )

        self.chat_deployment = config.chat_deployment
        self.chunking_config = get_chunking_config()

    def retrieve(self, query: str) -> list[dict]:
        """Retrieve relevant chunks for a query.

        Args:
            query: The user's question.

        Returns:
            List of relevant document chunks with metadata.
        """
        query_embedding = self.embeddings_client.get_embedding(query)
        results = self.search_service.hybrid_search(
            query=query,
            query_embedding=query_embedding,
            top_k=self.chunking_config.top_k,
        )
        return results

    def format_context(self, chunks: list[dict]) -> str:
        """Format retrieved chunks into a context string.

        Args:
            chunks: List of retrieved document chunks.

        Returns:
            Formatted context string for the LLM prompt.
        """
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            pages = ", ".join(str(p) for p in chunk["page_numbers"])
            section = chunk.get("section_title", "")
            section_str = f" ({section})" if section else ""

            context_parts.append(
                f"[Source {i} - Page {pages}{section_str}]\n{chunk['content']}\n"
            )
        return "\n---\n".join(context_parts)

    def generate(self, query: str, context: str) -> str:
        """Generate a response using Azure OpenAI.

        Args:
            query: The user's question.
            context: The formatted context from retrieved chunks.

        Returns:
            The generated response text.
        """
        response = self.llm_client.chat.completions.create(
            model=self.chat_deployment,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT.format(context=context)},
                {"role": "user", "content": query},
            ],
            temperature=0.3,  # Lower temperature for factual responses
            max_completion_tokens=1000,
        )
        return response.choices[0].message.content or ""

    def query(self, user_query: str) -> RAGResponse:
        """Execute full RAG pipeline: retrieve -> augment -> generate.

        Args:
            user_query: The user's question.

        Returns:
            RAGResponse with answer, sources, and confidence level.
        """
        # Step 1: Retrieve relevant chunks
        chunks = self.retrieve(user_query)

        if not chunks:
            return RAGResponse(
                answer="I couldn't find relevant information in the documentation to answer your question. Please try rephrasing or ask about a different topic related to the T-Mobile 5G Gateway.",
                sources=[],
                confidence="low",
            )

        # Step 2: Format context
        context = self.format_context(chunks)

        # Step 3: Generate response
        answer = self.generate(user_query, context)

        # Step 4: Format sources for citation
        sources = [
            {
                "pages": chunk["page_numbers"],
                "section": chunk.get("section_title", ""),
                "relevance_score": chunk["score"],
            }
            for chunk in chunks
        ]

        # Confidence heuristic based on top score
        # Note: Azure AI Search hybrid scores use RRF (Reciprocal Rank Fusion)
        # which produces lower absolute values (typically 0.01-0.05 range)
        top_score = chunks[0]["score"] if chunks else 0
        if top_score > 0.03:
            confidence = "high"
        elif top_score > 0.02:
            confidence = "medium"
        else:
            confidence = "low"

        return RAGResponse(
            answer=answer,
            sources=sources,
            confidence=confidence,
        )
