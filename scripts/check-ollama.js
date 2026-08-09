const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function checkOllama() {
  console.log('[OLLAMA] Checking local Ollama service availability...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map((m) => m.name);
      const hasQwen = models.some((m) => m.includes('qwen3'));

      if (hasQwen) {
        console.log('[OLLAMA] Ollama service is active and qwen3 model is available.');
      } else {
        console.log('[OLLAMA] Ollama service is active.');
        console.log(`[OLLAMA] Available models: ${models.join(', ') || 'none'}.`);
        console.log('[OLLAMA] Warning: qwen3 model not found in "ollama list". Run "ollama run qwen3" to pull if needed.');
      }
      return;
    }
  } catch (_err) {
    // Service unreachable
  }

  console.log('[OLLAMA] Warning: Local Ollama service is not running on port 11434.');
  console.log('[OLLAMA] Intervue-AI backend will run seamlessly using deterministic fallback evaluation and question planning.');
  console.log('[OLLAMA] (Optional: To enable live local LLM, install Ollama and run: ollama run qwen3)');
}

checkOllama();
