"""Candidate Loader Module.

This module provides the CandidateLoader class to parse and query candidate
profiles from JSON data sources for the AI Interview Agent system.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional, Union


class CandidateLoader:
    """Loads, parses, and provides access to candidate records from a JSON file.

    Attributes:
        json_path (Path): Path object pointing to the candidate JSON file.
        _candidates (Dict[str, Dict[str, Any]]): Internal dictionary mapping candidate IDs to candidate records.
    """

    def __init__(self, json_path: Union[str, Path]) -> None:
        """Initialize CandidateLoader with a path to candidate JSON file.

        Args:
            json_path (str | Path): Path to the candidate JSON file.

        Raises:
            FileNotFoundError: If the candidate file does not exist.
            ValueError: If the JSON file is invalid or missing expected structure.
        """
        self.json_path = Path(json_path)
        self._candidates: Dict[str, Dict[str, Any]] = {}
        self._load_candidates()

    def _load_candidates(self) -> None:
        """Load and parse candidate records from the JSON file.

        Raises:
            FileNotFoundError: If the JSON file is not found.
            ValueError: If JSON cannot be parsed or top-level 'candidates' key is missing/invalid.
        """
        if not self.json_path.exists():
            raise FileNotFoundError(
                f"Candidate data file not found at path: '{self.json_path}'"
            )

        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Failed to parse candidate JSON file '{self.json_path}': {exc}"
            ) from exc

        if not isinstance(data, dict) or "candidates" not in data:
            raise ValueError(
                f"Invalid candidate JSON structure in '{self.json_path}'. "
                "Expected a top-level JSON object containing a 'candidates' list."
            )

        candidates_list = data["candidates"]
        if not isinstance(candidates_list, list):
            raise ValueError(
                f"Invalid 'candidates' field in '{self.json_path}'. Expected a list."
            )

        for candidate in candidates_list:
            if isinstance(candidate, dict):
                member = candidate.get("member")
                if isinstance(member, dict):
                    cand_id = member.get("id")
                    if isinstance(cand_id, str) and cand_id:
                        self._candidates[cand_id] = candidate

    def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Search and retrieve a candidate record by member ID.

        Args:
            candidate_id (str): Candidate member ID (e.g., 'CAND-001').

        Returns:
            Optional[Dict[str, Any]]: Complete candidate dictionary containing
            'member', 'missions', and 'signals' if candidate exists, otherwise None.
        """
        return self._candidates.get(candidate_id)
