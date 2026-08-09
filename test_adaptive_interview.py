import urllib.request
import json
import time

def run_adaptive_test():
  print("=== 1. TESTING BACKEND HEALTH ===")
  req_be = urllib.request.urlopen("http://127.0.0.1:8000/health")
  print("Backend Health:", req_be.read().decode())

  session_id = f"adaptive-demo-{int(time.time())}"
  candidate_id = "person-3" # Aayush Malhotra

  print(f"\n=== 2. STARTING INTERVIEW ({candidate_id}: Aayush Malhotra) ===")
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
      print(f"Turn {i+1} -> Status: {last_resp['status']}, Q#: {q_num}, Topics: {top_cnt}")
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
