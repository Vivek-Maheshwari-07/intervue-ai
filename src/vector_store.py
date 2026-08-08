"""Vector Store Module.

This module provides the VectorStore class to initialize and manage a local,
persistent ChromaDB client and a Sentence Transformers embedding function for
the AI Interview Agent system.
"""

from pathlib import Path
from typing import Optional, Union

import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from chromadb.api import ClientAPI
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

DEFAULT_PERSISTENCE_PATH = Path("data/chroma_db")
DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class VectorStore:
    """Manages local persistent ChromaDB client and embedding function configuration.

    Attributes:
        persistence_path (Path): Path to the local ChromaDB persistence directory.
        model_name (str): Sentence Transformers model identifier.
    """

    def __init__(
        self,
        persistence_path: Union[str, Path] = DEFAULT_PERSISTENCE_PATH,
        model_name: str = DEFAULT_MODEL_NAME,
    ) -> None:
        """Initialize VectorStore with persistence path and embedding model name.

        Args:
            persistence_path (str | Path): Directory path for local ChromaDB storage.
            model_name (str): Sentence Transformers embedding model name.
        """
        self.persistence_path = Path(persistence_path)
        self.model_name = model_name
        self._client: Optional[ClientAPI] = None
        self._embedding_function: Optional[SentenceTransformerEmbeddingFunction] = None

    def get_client(self) -> ClientAPI:
        """Retrieve or initialize the persistent ChromaDB client.

        Returns:
            ClientAPI: Initialized local persistent ChromaDB client.
        """
        if self._client is None:
            self.persistence_path.mkdir(parents=True, exist_ok=True)
            self._client = chromadb.PersistentClient(path=str(self.persistence_path))
        return self._client

    def get_embedding_function(self) -> SentenceTransformerEmbeddingFunction:
        """Retrieve or initialize the Sentence Transformers embedding function.

        Returns:
            SentenceTransformerEmbeddingFunction: Configured embedding function instance.
        """
        if self._embedding_function is None:
            self._embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=self.model_name
            )
        return self._embedding_function
