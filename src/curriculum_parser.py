"""Curriculum Parser and Ingestion Module.

This module provides the CurriculumParser class to parse curriculum data from JSON,
generate retrieval-friendly text documents and metadata, and ingest them into
a ChromaDB collection using the VectorStore abstraction.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from chromadb.api import Collection

from src.vector_store import VectorStore

DEFAULT_CURRICULUM_PATH = Path("data/curriculum.json")
DEFAULT_COLLECTION_NAME = "curriculum"


class CurriculumParser:
    """Parses curriculum JSON records and ingests daily documents into ChromaDB.

    Attributes:
        json_path (Path): Path to curriculum.json file.
        vector_store (VectorStore): VectorStore instance for ChromaDB and embedding function.
    """

    def __init__(
        self,
        json_path: Union[str, Path] = DEFAULT_CURRICULUM_PATH,
        vector_store: Optional[VectorStore] = None,
    ) -> None:
        """Initialize CurriculumParser with curriculum JSON path and VectorStore instance.

        Args:
            json_path (str | Path): Path to curriculum JSON file.
            vector_store (Optional[VectorStore]): Optional VectorStore instance.
        """
        self.json_path = Path(json_path)
        self.vector_store = vector_store or VectorStore()

    def load_curriculum(self) -> List[Dict[str, Any]]:
        """Load and validate the curriculum JSON data.

        Returns:
            List[Dict[str, Any]]: List of daily curriculum records.

        Raises:
            FileNotFoundError: If the curriculum JSON file does not exist.
            ValueError: If JSON is invalid or missing required structure.
        """
        if not self.json_path.exists():
            raise FileNotFoundError(
                f"Curriculum data file not found at path: '{self.json_path}'"
            )

        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Failed to parse curriculum JSON file '{self.json_path}': {exc}"
            ) from exc

        if not isinstance(data, dict) or "days" not in data:
            raise ValueError(
                f"Invalid curriculum structure in '{self.json_path}'. "
                "Expected top-level object containing a 'days' key."
            )

        days_list = data["days"]
        if not isinstance(days_list, list):
            raise ValueError(
                f"Invalid 'days' field in '{self.json_path}'. Expected a list."
            )

        required_fields = {"day", "title", "type", "tools", "objectives"}
        validated_days: List[Dict[str, Any]] = []

        for idx, day_record in enumerate(days_list):
            if not isinstance(day_record, dict):
                raise ValueError(
                    f"Invalid record at index {idx} in 'days'. Expected dictionary."
                )

            missing = required_fields - set(day_record.keys())
            if missing:
                raise ValueError(
                    f"Curriculum record at index {idx} missing required fields: {missing}"
                )

            validated_days.append(day_record)

        return validated_days

    @staticmethod
    def format_document(day_record: Dict[str, Any]) -> str:
        """Construct a single retrieval-friendly text document for a daily record.

        Args:
            day_record (Dict[str, Any]): Daily curriculum record dictionary.

        Returns:
            str: Coherent formatted text representing the daily curriculum.
        """
        day_num = day_record["day"]
        title = day_record["title"]
        day_type = day_record["type"]
        tools = day_record.get("tools", [])
        objectives = day_record.get("objectives", [])

        tools_formatted = (
            "\n".join(f"- {tool}" for tool in tools)
            if isinstance(tools, list)
            else str(tools)
        )
        objectives_formatted = (
            "\n".join(f"- {obj}" for obj in objectives)
            if isinstance(objectives, list)
            else str(objectives)
        )

        return (
            f"Day {day_num}: {title}\n\n"
            f"Type: {day_type}\n\n"
            f"Tools:\n{tools_formatted}\n\n"
            f"Objectives:\n{objectives_formatted}"
        )

    @staticmethod
    def format_metadata(day_record: Dict[str, Any]) -> Dict[str, Union[str, int]]:
        """Construct ChromaDB-compatible metadata dictionary for a daily record.

        Args:
            day_record (Dict[str, Any]): Daily curriculum record dictionary.

        Returns:
            Dict[str, Union[str, int]]: Metadata dictionary.
        """
        tools = day_record.get("tools", [])
        tools_str = ", ".join(tools) if isinstance(tools, list) else str(tools)

        return {
            "day": int(day_record["day"]),
            "title": str(day_record["title"]),
            "type": str(day_record["type"]),
            "tools": tools_str,
        }

    @staticmethod
    def format_id(day_num: int) -> str:
        """Generate deterministic document ID for a given day number.

        Args:
            day_num (int): Day number.

        Returns:
            str: Deterministic ID (e.g. 'day-01', 'day-07', 'day-31').
        """
        return f"day-{day_num:02d}"

    def ingest(self, collection_name: str = DEFAULT_COLLECTION_NAME) -> Collection:
        """Load curriculum data and upsert daily documents into ChromaDB collection.

        Args:
            collection_name (str): Name of the ChromaDB collection.

        Returns:
            Collection: Updated ChromaDB collection instance.
        """
        days_records = self.load_curriculum()

        client = self.vector_store.get_client()
        embedding_fn = self.vector_store.get_embedding_function()

        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_fn,
        )

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for record in days_records:
            day_num = int(record["day"])
            doc_id = self.format_id(day_num)
            doc_text = self.format_document(record)
            doc_meta = self.format_metadata(record)

            ids.append(doc_id)
            documents.append(doc_text)
            metadatas.append(doc_meta)

        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
        )

        return collection
