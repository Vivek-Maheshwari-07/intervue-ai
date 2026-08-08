"""Curriculum Retriever Module.

This module provides the CurriculumRetriever class to perform semantic similarity
search queries against the ChromaDB curriculum collection for the AI Interview Agent system.
"""

from typing import Any, Dict, List, Optional, Union

from src.vector_store import VectorStore

DEFAULT_COLLECTION_NAME = "curriculum"
DEFAULT_TOP_K = 3


class CurriculumRetriever:
    """Performs semantic retrieval against the ChromaDB curriculum collection.

    Attributes:
        vector_store (VectorStore): VectorStore instance for ChromaDB client and embedding function.
        collection_name (str): Name of the ChromaDB curriculum collection.
        top_k (int): Default number of top results to return.
    """

    def __init__(
        self,
        vector_store: Optional[VectorStore] = None,
        collection_name: str = DEFAULT_COLLECTION_NAME,
        top_k: int = DEFAULT_TOP_K,
    ) -> None:
        """Initialize CurriculumRetriever.

        Args:
            vector_store (Optional[VectorStore]): Optional VectorStore instance.
            collection_name (str): Target ChromaDB collection name.
            top_k (int): Default top-k result count.
        """
        self.vector_store = vector_store or VectorStore()
        self.collection_name = collection_name
        self.top_k = top_k

    def search_curriculum(
        self,
        query: str,
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Search the curriculum collection for documents relevant to the query.

        Args:
            query (str): Natural language search query string.
            top_k (Optional[int]): Optional override for number of results to return.

        Returns:
            List[Dict[str, Any]]: Relevance-ordered list of result dictionaries containing
            'id', 'document', 'metadata', and 'distance'.

        Raises:
            ValueError: If query is invalid or empty, or top_k is invalid.
            RuntimeError: If ChromaDB collection access fails.
        """
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Query must be a non-empty string.")

        n_results = top_k if top_k is not None else self.top_k
        if not isinstance(n_results, int) or n_results <= 0:
            raise ValueError("top_k must be a positive integer.")

        client = self.vector_store.get_client()
        embedding_fn = self.vector_store.get_embedding_function()

        try:
            collection = client.get_collection(
                name=self.collection_name,
                embedding_function=embedding_fn,
            )
        except Exception as exc:
            raise RuntimeError(
                f"Failed to access ChromaDB collection '{self.collection_name}': {exc}"
            ) from exc

        raw_results = collection.query(
            query_texts=[query],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        ids_list = raw_results.get("ids", [[]])[0] if raw_results.get("ids") else []
        documents_list = (
            raw_results.get("documents", [[]])[0] if raw_results.get("documents") else []
        )
        metadatas_list = (
            raw_results.get("metadatas", [[]])[0] if raw_results.get("metadatas") else []
        )
        distances_list = (
            raw_results.get("distances", [[]])[0] if raw_results.get("distances") else []
        )

        results: List[Dict[str, Any]] = []
        for i in range(len(ids_list)):
            item: Dict[str, Any] = {
                "id": ids_list[i],
                "document": documents_list[i] if i < len(documents_list) else "",
                "metadata": metadatas_list[i] if i < len(metadatas_list) else {},
                "distance": distances_list[i] if i < len(distances_list) else None,
            }
            results.append(item)

        return results
