"""Azure OpenAI embeddings client."""

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from src.config import get_openai_config


class EmbeddingsClient:
    """Handles embedding generation via Azure OpenAI."""

    def __init__(self):
        """Initialize the embeddings client with Azure OpenAI configuration."""
        config = get_openai_config()

        if config.use_managed_identity:
            # Use DefaultAzureCredential for managed identity / Azure CLI auth
            credential = DefaultAzureCredential()
            token_provider = get_bearer_token_provider(
                credential, "https://cognitiveservices.azure.com/.default"
            )
            self.client = AzureOpenAI(
                azure_endpoint=config.endpoint,
                azure_ad_token_provider=token_provider,
                api_version=config.api_version,
            )
        else:
            # Fallback to API key if explicitly disabled
            import os
            self.client = AzureOpenAI(
                azure_endpoint=config.endpoint,
                api_key=os.getenv("AZURE_OPENAI_API_KEY", ""),
                api_version=config.api_version,
            )

        self.deployment = config.embedding_deployment

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    def get_embedding(self, text: str) -> list[float]:
        """Generate embedding for a single text.

        Args:
            text: The text to embed.

        Returns:
            List of floats representing the embedding vector.
        """
        response = self.client.embeddings.create(
            input=text,
            model=self.deployment,
        )
        return response.data[0].embedding

    def get_embeddings_batch(
        self,
        texts: list[str],
        batch_size: int = 16,
    ) -> list[list[float]]:
        """Generate embeddings for multiple texts in batches.

        Args:
            texts: List of texts to embed.
            batch_size: Number of texts to process per API call.

        Returns:
            List of embedding vectors, one per input text.
        """
        all_embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            response = self.client.embeddings.create(
                input=batch,
                model=self.deployment,
            )
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)

        return all_embeddings
