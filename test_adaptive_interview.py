import urllib.request
import json
import time
import sys
import os

# Ensure project root & backend are in sys.path
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


def run_adaptive_test():
    print("=== 1. TESTING BACKEND INTEGRATION ===")
    
    # Try HTTP server first, fallback to FastAPI TestClient if server not running
    use_http = False
    try:
        req_be = urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=1)
        print("Live HTTP Server Health:", req_be.read().decode())
        use_http = True
    except Exception:
        print("Live HTTP server on port 8000 not running — using FastAPI TestClient.")
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)

    session_id = f"adaptive-demo-{int(time.time())}"
    candidate_id = "person-3"  # Aayush Malhotra

    print(f"\n=== 2. STARTING INTERVIEW ({candidate_id}: Aayush Malhotra) ===")
    payload1 = {
        "sessionId": session_id,
        "candidateId": candidate_id,
        "answer": ""
    }
    
    if use_http:
        req1 = urllib.request.Request(
            "http://127.0.0.1:8000/api/interview",
            data=json.dumps(payload1).encode(),
            headers={"Content-Type": "application/json"}
        )
        resp1 = json.loads(urllib.request.urlopen(req1).read().decode())
    else:
        resp1 = client.post("/api/interview", json=payload1).json()

    print(f"Status: {resp1['status']}")
    print(f"Question 1: {resp1['question']}")
    print(f"Question Number: {resp1['questionNumber']}")

    print("\n=== 3. ADAPTIVE TURNS WITH ANSWERS ===")
    answers = [
        "I built a RAG architecture using OpenAI embeddings and ChromaDB vector store for semantic document retrieval.",
        "We chose ChromaDB with HNSW indexing to enable O(log N) similarity search and low retrieval latency.",
        "To handle conflicting documents, I implemented a cross-encoder reranker to score relevance before LLM context injection.",
        "Prompt engineering used system instructions with strict JSON schema constraints and zero-shot examples.",
        "We deployed custom Agentic AI workflows using LangGraph with stateful memory and Tool Calling capabilities.",
        "For Model Context Protocol (MCP), we exposed database tools via SSE protocol to let agents query backend models safely.",
        "Docker containers and Kubernetes deployment handles horizontal autoscaling and health probes.",
        "Prometheus metrics and Jaeger distributed tracing monitor LLM latency, token counts, and error rates."
    ]

    last_resp = resp1
    for i, ans in enumerate(answers, start=1):
        payload = {
            "sessionId": session_id,
            "candidateId": candidate_id,
            "answer": ans
        }

        if use_http:
            req = urllib.request.Request(
                "http://127.0.0.1:8000/api/interview",
                data=json.dumps(payload).encode(),
                headers={"Content-Type": "application/json"}
            )
            last_resp = json.loads(urllib.request.urlopen(req).read().decode())
        else:
            last_resp = client.post("/api/interview", json=payload).json()

        q_num = last_resp.get("questionNumber", "N/A")
        top_cnt = last_resp.get("topicsCovered", "N/A")
        signal = last_resp.get("adaptiveSignal", {})
        signal_action = signal.get("action", "N/A") if isinstance(signal, dict) else "N/A"
        
        print(f"Turn {i+1} -> Status: {last_resp['status']}, Q#: {q_num}, Topics: {top_cnt}, Signal: {signal_action}")
        if last_resp.get("question"):
            print(f"  Next Q: {last_resp['question'][:120]}...")

        if last_resp["status"] == "completed":
            break

    if last_resp["status"] == "completed":
        print("\n================ 4. FINAL STRUCTURED ASSESSMENT ================")
        fb = last_resp.get("feedback", {})
        print("Summary:", fb.get("summary"))
        print("Strengths:", fb.get("strengths"))
        print("Gaps:", fb.get("gaps"))
        print("Next Steps:", fb.get("next"))
        print("\nSUCCESS! Adaptive Interview test passed completely.")
    else:
        print(f"\nInterview status is still {last_resp['status']}.")

if __name__ == "__main__":
    run_adaptive_test()
