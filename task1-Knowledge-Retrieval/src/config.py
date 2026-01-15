"""Configuration management for RAG pipeline."""

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AzureOpenAIConfig:
    """Azure OpenAI service configuration."""

    endpoint: str
    api_version: str
    embedding_deployment: str
    chat_deployment: str
    use_managed_identity: bool = True


@dataclass
class AzureSearchConfig:
    """Azure AI Search service configuration."""

    endpoint: str
    api_key: str
    index_name: str


@dataclass
class ChunkingConfig:
    """Document chunking configuration."""

    chunk_size: int
    chunk_overlap: int
    top_k: int


def get_openai_config() -> AzureOpenAIConfig:
    """Get Azure OpenAI configuration from environment variables."""
    return AzureOpenAIConfig(
        endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", ""),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        embedding_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", ""),
        chat_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", ""),
        use_managed_identity=os.getenv("USE_MANAGED_IDENTITY", "true").lower() == "true",
    )


def get_search_config() -> AzureSearchConfig:
    """Get Azure AI Search configuration from environment variables."""
    return AzureSearchConfig(
        endpoint=os.getenv("AZURE_SEARCH_ENDPOINT", ""),
        api_key=os.getenv("AZURE_SEARCH_API_KEY", ""),
        index_name=os.getenv("AZURE_SEARCH_INDEX_NAME", "tmobile-gateway-docs"),
    )


def get_chunking_config() -> ChunkingConfig:
    """Get chunking configuration from environment variables."""
    return ChunkingConfig(
        chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "200")),
        top_k=int(os.getenv("TOP_K_RESULTS", "5")),
    )


def validate_config() -> list[str]:
    """Validate all required environment variables are set.

    Returns:
        List of error messages for missing configuration.
    """
    errors = []

    # Always required
    required_vars = [
        ("AZURE_OPENAI_ENDPOINT", "Azure OpenAI endpoint URL"),
        ("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "Azure OpenAI embedding model deployment name"),
        ("AZURE_OPENAI_CHAT_DEPLOYMENT", "Azure OpenAI chat model deployment name"),
        ("AZURE_SEARCH_ENDPOINT", "Azure AI Search endpoint URL"),
        ("AZURE_SEARCH_API_KEY", "Azure AI Search API key"),
    ]

    for var_name, description in required_vars:
        if not os.getenv(var_name):
            errors.append(f"Missing {var_name}: {description}")

    return errors
