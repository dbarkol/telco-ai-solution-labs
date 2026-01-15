"""Streamlit application for RAG-powered support assistant."""

import streamlit as st

from src.config import validate_config
from src.rag_pipeline import RAGPipeline

# Page configuration
st.set_page_config(
    page_title="T-Mobile 5G Gateway Support",
    page_icon="📡",
    layout="wide",
)


def init_session_state():
    """Initialize session state variables."""
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "rag_pipeline" not in st.session_state:
        st.session_state.rag_pipeline = None


def load_pipeline():
    """Load RAG pipeline with error handling."""
    errors = validate_config()
    if errors:
        st.error("Configuration errors:\n" + "\n".join(f"- {e}" for e in errors))
        st.info("Please configure your .env file with the required Azure credentials.")
        return None

    try:
        return RAGPipeline()
    except Exception as e:
        st.error(f"Failed to initialize RAG pipeline: {e}")
        return None


def format_sources(sources: list[dict]) -> str:
    """Format source citations for display."""
    if not sources:
        return ""

    citations = []
    for i, source in enumerate(sources, 1):
        pages = ", ".join(str(p) for p in source["pages"])
        section = f" - {source['section']}" if source.get("section") else ""
        score = source.get("relevance_score", 0)
        citations.append(f"- **Source {i}**: Page {pages}{section} (relevance: {score:.2f})")

    return "\n".join(citations)


def main():
    """Main application entry point."""
    init_session_state()

    # Header
    st.title("�� T-Mobile 5G Gateway Support Assistant")
    st.markdown(
        "Ask questions about your **KVD21 5G Gateway** - setup, troubleshooting, and configuration."
    )

    # Sidebar with example queries
    with st.sidebar:
        st.header("💡 Example Questions")
        st.markdown("Click any question to try it:")

        example_queries = [
            "How do I replace the SIM card?",
            "What do the LED lights mean?",
            "How do I reset the gateway?",
            "How to fix poor internet?",
            "How do I connect to WiFi?",
        ]

        for query in example_queries:
            if st.button(query, key=f"example_{hash(query)}"):
                st.session_state.example_query = query

        st.divider()

        st.header("ℹ️ About")
        st.markdown(
            """
            This assistant uses **RAG (Retrieval-Augmented Generation)**
            to answer questions based on the official T-Mobile 5G Gateway
            User Guide.

            All answers include source citations from the documentation.

            **Tech Stack:**
            - Azure OpenAI (GPT-4o)
            - Azure AI Search
            - Streamlit
            """
        )

        st.divider()

        # Clear chat button
        if st.button("🗑️ Clear Chat History"):
            st.session_state.messages = []
            st.rerun()

    # Initialize pipeline
    if st.session_state.rag_pipeline is None:
        with st.spinner("Loading knowledge base..."):
            st.session_state.rag_pipeline = load_pipeline()

    if st.session_state.rag_pipeline is None:
        st.stop()

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message.get("sources"):
                with st.expander("📚 Sources"):
                    st.markdown(message["sources"])

    # Handle example query selection
    user_input = None
    if "example_query" in st.session_state:
        user_input = st.session_state.example_query
        del st.session_state.example_query

    # Chat input
    if prompt := st.chat_input("Ask a question about your 5G Gateway..."):
        user_input = prompt

    # Process user input
    if user_input:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        # Generate response
        with st.chat_message("assistant"):
            with st.spinner("Searching documentation..."):
                try:
                    response = st.session_state.rag_pipeline.query(user_input)
                except Exception as e:
                    st.error(f"An error occurred: {str(e)}")
                    st.info("Please try rephrasing your question or check your connection.")
                    st.stop()

            st.markdown(response.answer)

            # Show sources
            sources_text = format_sources(response.sources)
            if sources_text:
                with st.expander("📚 Sources", expanded=False):
                    st.markdown(sources_text)

                    # Confidence indicator
                    confidence_colors = {
                        "high": "🟢",
                        "medium": "🟡",
                        "low": "🔴",
                    }
                    st.markdown(
                        f"**Confidence**: {confidence_colors.get(response.confidence, '⚪')} {response.confidence.title()}"
                    )

        # Save assistant message
        st.session_state.messages.append(
            {
                "role": "assistant",
                "content": response.answer,
                "sources": sources_text,
            }
        )


if __name__ == "__main__":
    main()
