"""Independent Retrieval Test Suite.

This module provides unit and integration tests for the CurriculumRetriever class
to verify semantic retrieval against the ChromaDB curriculum collection.
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.retriever import CurriculumRetriever


class TestCurriculumRetriever(unittest.TestCase):
    """Test suite for CurriculumRetriever semantic search functionality."""

    @classmethod
    def setUpClass(cls) -> None:
        """Initialize CurriculumRetriever instance before tests."""
        cls.retriever = CurriculumRetriever()

    def test_vector_database_query(self) -> None:
        """Verify vector database query returns relevant vector DB curriculum days."""
        query = "What did we learn about vector databases?"
        results = self.retriever.search_curriculum(query, top_k=3)

        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)

        # Expected vector database curriculum days: Day 8, Day 9, Day 10
        relevant_days = {8, 9, 10}
        returned_days = {res["metadata"].get("day") for res in results}

        self.assertTrue(
            any(day in relevant_days for day in returned_days),
            f"Expected at least one of {relevant_days} in returned days, got {returned_days}",
        )

    def test_embeddings_query(self) -> None:
        """Verify embeddings query returns Day 7 (Embeddings Explained)."""
        query = "How do embeddings convert text into vectors?"
        results = self.retriever.search_curriculum(query, top_k=3)

        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)

        # Expected curriculum day: Day 7 (Embeddings Explained)
        returned_days = [res["metadata"].get("day") for res in results]
        self.assertIn(
            7,
            returned_days,
            f"Expected Day 7 in returned days, got {returned_days}",
        )

    def test_result_structure(self) -> None:
        """Verify returned results contain all required top-level and metadata fields."""
        query = "Vector Databases Overview"
        results = self.retriever.search_curriculum(query, top_k=3)

        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)

        for res in results:
            self.assertIn("id", res)
            self.assertIn("document", res)
            self.assertIn("metadata", res)
            self.assertIn("distance", res)

            metadata = res["metadata"]
            self.assertIn("day", metadata)
            self.assertIn("title", metadata)
            self.assertIn("type", metadata)
            self.assertIn("tools", metadata)

            self.assertIsInstance(metadata["day"], int)
            self.assertIsInstance(metadata["title"], str)
            self.assertIsInstance(metadata["type"], str)
            self.assertIsInstance(metadata["tools"], str)

            if res["distance"] is not None:
                self.assertIsInstance(res["distance"], (float, int))

    def test_top_k_behavior(self) -> None:
        """Verify top_k parameter limits result count and preserves relevance ordering."""
        query = "Embeddings Explained"
        res_k1 = self.retriever.search_curriculum(query, top_k=1)
        res_k3 = self.retriever.search_curriculum(query, top_k=3)

        self.assertEqual(len(res_k1), 1)
        self.assertEqual(len(res_k3), 3)

        # Relevance order check: top item of top_k=3 should match top_k=1
        self.assertEqual(res_k1[0]["id"], res_k3[0]["id"])

    def test_invalid_queries(self) -> None:
        """Verify invalid query strings and non-string inputs raise ValueError."""
        invalid_queries = ["", "   ", None, 123, ["invalid"]]
        for idx, iq in enumerate(invalid_queries):
            with self.subTest(query_index=idx, invalid_query=iq):
                with self.assertRaises(ValueError):
                    self.retriever.search_curriculum(iq)  # type: ignore

    def test_invalid_top_k(self) -> None:
        """Verify non-positive or non-integer top_k values raise ValueError."""
        invalid_top_ks = [0, -1, "3", 1.5]
        for idx, itk in enumerate(invalid_top_ks):
            with self.subTest(top_k_index=idx, invalid_top_k=itk):
                with self.assertRaises(ValueError):
                    self.retriever.search_curriculum("test query", top_k=itk)  # type: ignore


if __name__ == "__main__":
    unittest.main()
