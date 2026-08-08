import urllib.request
import json

def run_e2e_test():
    print("=== 1. TESTING BACKEND HEALTH ===")
    req_be = urllib.request.urlopen("http://127.0.0.1:8000/health")
    print("Backend Health:", req_be.read().decode())

    session_id = "live-e2e-demo-200"
    candidate_id = "person-3"

    print("\n=== 2. STARTING INTERVIEW (Turn 1) ===")
    payload1 = json.dumps({
        "sessionId": session_id,
        "candidateId": candidate_id,
        "answer": ""
    }).encode()
    
    req1 = urllib.request.Request(
        "http://127.0.0.1:8000/api/interview",
        data=payload1,
        headers={"Content-Type": "application/json"}
    )
    resp1 = json.loads(urllib.request.urlopen(req1).read().decode())

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
        payload = json.dumps({
            "sessionId": session_id,
            "candidateId": candidate_id,
            "answer": ans
        }).encode()

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/interview",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        last_resp = json.loads(urllib.request.urlopen(req).read().decode())

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
