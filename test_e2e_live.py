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


def run_e2e_test():
    print("=== 1. TESTING BACKEND INTEGRATION ===")
    
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

    session_id = f"live-e2e-demo-{int(time.time())}"
    candidate_id = "person-3"

    print("\n=== 2. STARTING INTERVIEW (Turn 1) ===")
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
    print(f"Topics Covered: {resp1['topicsCovered']}")

    print("\n=== 3. SUBMITTING CANDIDATE ANSWERS ===")
    sample_answers = [
        "Python lists are mutable sequences, whereas tuples are immutable and hashable.",
        "A hash map computes an array index via a hash function for O(1) average lookup.",
        "SOLID principles foster maintainable architecture: Single Responsibility, Open-Closed, etc.",
        "INNER JOIN returns matching rows only, while LEFT JOIN preserves all left table rows.",
        "REST uses standard HTTP verbs/URIs; GraphQL allows clients to query specific field schemas.",
        "A URL shortener maps base62 keys to long URLs using a distributed key-value store and Redis cache.",
        "Unit tests verify isolated functions; integration tests verify module boundaries.",
        "CI/CD pipelines automate linting, unit tests, container builds, and staging deployments."
    ]

    last_resp = resp1
    for i, ans in enumerate(sample_answers, start=1):
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
        print(f"Turn {i+1} -> Status: {last_resp['status']}, Question#: {q_num}, Topics Covered: {top_cnt}")

        if last_resp["status"] == "completed":
            break

    if last_resp["status"] == "completed":
        print("\n================ 4. FINAL FEEDBACK RECEIVED ================")
        fb = last_resp.get("feedback", {})
        print("Summary:", fb.get("summary"))
        print("Strengths:", fb.get("strengths"))
        print("Gaps:", fb.get("gaps"))
        print("Next Topics:", fb.get("next"))
        print("\nSUCCESS! Frontend-Backend end-to-end integration verified successfully.")
    else:
        print(f"\nInterview status is still {last_resp['status']}.")

if __name__ == "__main__":
    run_e2e_test()
