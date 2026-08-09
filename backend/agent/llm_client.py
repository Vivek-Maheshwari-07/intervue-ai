"""
LLM Client Module for Intervue AI
Provides abstract LLMClient interface, OllamaLLMClient implementation for Qwen3,
and MockLLMClient for offline testing without network/Ollama requirements.
"""

import os
import json
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

DEFAULT_OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:8b")
DEFAULT_OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")


class OllamaConnectionError(Exception):
    """Raised when the local Ollama server is unreachable or fails to respond."""
    pass


class LLMClient:
    """Abstract interface for LLM operations."""

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate text from prompt."""
        raise NotImplementedError

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generate structured JSON response from prompt."""
        raise NotImplementedError


class OllamaLLMClient(LLMClient):
    """
    Ollama-backed client targeting Qwen3 or configured model.
    Uses Python standard library urllib to avoid extra dependencies.
    """

    _connection_failed: bool = False

    def __init__(self, model: Optional[str] = None, base_url: Optional[str] = None, timeout: int = 60):
        self.model = model or DEFAULT_OLLAMA_MODEL
        self.base_url = (base_url or DEFAULT_OLLAMA_BASE_URL).rstrip('/')
        self.timeout = timeout

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Send completion request to Ollama /api/generate endpoint.
        """
        if OllamaLLMClient._connection_failed:
            raise OllamaConnectionError(
                f"Could not connect to Ollama at {self.base_url} (cached offline)."
            )

        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                raw_response = result.get("response", "")
                return self._clean_text(raw_response)
        except (urllib.error.URLError, Exception) as e:
            OllamaLLMClient._connection_failed = True
            raise OllamaConnectionError(
                f"Could not connect to Ollama at {self.base_url}. "
                f"Ensure Ollama is running and model '{self.model}' is available. Details: {e}"
            )

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate text response and safely parse structured JSON.
        Handles thinking blocks, markdown code fences, and text preambles.
        """
        raw_text = self.generate(prompt, system_prompt)
        parsed = self._extract_json(raw_text)
        if parsed is not None:
            return parsed

        raise ValueError(f"Failed to parse valid JSON from LLM response: {raw_text[:200]}")

    def _clean_text(self, text: str) -> str:
        """Strip thinking blocks, preambles, and surrounding formatting."""
        if not text:
            return ""

        # Strip <think>...</think> blocks
        cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)

        # Strip preamble lines like "...done thinking."
        cleaned = re.sub(r'^.*?\.\.\.done thinking\.\s*', '', cleaned, flags=re.DOTALL | re.IGNORECASE)

        # Remove "Interview Question:" or "**Question:**" prefixes
        cleaned = re.sub(r'^(?:\*\*)?(?:Interview\s+)?Question:\s*(?:\*\*)?\s*', '', cleaned.strip(), flags=re.IGNORECASE)

        # Remove follow-up sections if model accidentally outputs multiple parts
        cleaned = re.split(r'\n\s*(?:\*\*)?Follow-up', cleaned, flags=re.IGNORECASE)[0]

        # Clean trailing and leading quotes/whitespace
        cleaned = cleaned.strip().strip('"').strip("'")
        return cleaned

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON dict from text, supporting markdown blocks."""
        if not text:
            return None

        # Try direct JSON parse
        try:
            val = json.loads(text)
            if isinstance(val, dict):
                return val
        except Exception:
            pass

        # Try parsing from markdown code block ```json ... ```
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            try:
                val = json.loads(match.group(1))
                if isinstance(val, dict):
                    return val
            except Exception:
                pass

        # Try finding raw JSON object between { and }
        match_raw = re.search(r'(\{.*\})', text, re.DOTALL)
        if match_raw:
            try:
                val = json.loads(match_raw.group(1))
                if isinstance(val, dict):
                    return val
            except Exception:
                pass

        return None


class MockLLMClient(LLMClient):
    """
    Mock LLM client for offline unit testing.
    Responds deterministically without making network calls to Ollama.
    """

    def __init__(
        self,
        default_response: Optional[str] = None,
        default_json: Optional[Dict[str, Any]] = None
    ):
        self.default_response = default_response or "How do you architect a zero-downtime microservice migration?"
        self.default_json = default_json or {
            "score": 8.0,
            "quality": "strong",
            "strengths": ["Solid technical grasp"],
            "gaps": ["Could mention edge case recovery"],
            "reasoning": "Good architectural explanation."
        }
        self.call_history = []

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        self.call_history.append({"prompt": prompt, "system_prompt": system_prompt, "type": "generate"})
        return self.default_response

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        self.call_history.append({"prompt": prompt, "system_prompt": system_prompt, "type": "generate_json"})
        if self.default_response and self.default_response != "How do you architect a zero-downtime microservice migration?":
            parsed = OllamaLLMClient._extract_json(self, self.default_response)
            if parsed is not None:
                return parsed
            raise ValueError(f"Failed to parse valid JSON from LLM response: {self.default_response[:100]}")
        return self.default_json
