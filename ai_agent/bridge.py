"""
Persistent Flask bridge server.
Models are loaded ONCE on startup and stay in memory.
The Next.js API route calls http://localhost:5001/analyze.
"""
import os, sys, warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from app import system
import io

# Fix encoding issue for some environments
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


import hashlib
import json

CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inference_cache.json")

def get_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f)
    except: pass

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    user_input = data.get("input", "").strip()

    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    # Cache logic
    input_hash = hashlib.md5(user_input.encode('utf-8')).hexdigest()
    cache = get_cache()
    if input_hash in cache:
        print(f"🚀 Cache HIT for input: {user_input[:40]}...")
        return jsonify(cache[input_hash])

    print(f"📥 Received analysis request for: {user_input[:50]}...")
    try:
        import time
        start_time = time.time()
        result = system.analyze(user_input)
        duration = time.time() - start_time
        print(f"✅ Analysis complete in {duration:.2f}s")

        # Map to the schema expected by the Next.js frontend
        risk_map = {"MINIMAL": "Safe", "LOW": "Low", "MEDIUM": "Medium", "HIGH": "High"}
        risk_level = risk_map.get(result["risk_level"], "Medium")

        response_data = {
            "riskLevel": risk_level,
            "threatType": ", ".join(result["threat_types"]),
            "confidenceScore": round(result["confidence"] * 100, 1),
            "riskScore": round(result["risk_score"], 4),
            "explanation": " ".join(result["explanation"]["reasons"]),
            "indicators": result["explanation"]["reasons"],
            "recommendations": result["explanation"]["actions"],
            "detailedScores": {
                "phishingProb": round(result["detailed_results"]["agent2"].get("phishing_probability", 0), 3),
                "spamProb": round(max(
                    result["detailed_results"]["agent2"].get("spam_probability", 0),
                    result["detailed_results"]["agent2"].get("spam_ml_score", 0)
                ), 3),
                "urlRisk": round(max(
                    result["detailed_results"]["agent1"].get("url_risk", 0),
                    result["detailed_results"]["agent1"].get("url_ml_risk", 0)
                ), 3),
                "sentimentLabel": result["detailed_results"]["agent2"].get("sentiment_label", "UNKNOWN"),
                "sentimentScore": round(result["detailed_results"]["agent2"].get("sentiment_score", 0), 3),
                "promptInjectionScore": round(result["detailed_results"]["agent4"].get("confidence", 0), 3),
                "promptInjectionDetected": result["detailed_results"]["agent4"].get("prompt_injection_detected", False),
                "attackCategories": result["detailed_results"]["agent4"].get("attack_categories", []),
            },
        }
        
        # Save to cache
        cache[input_hash] = response_data
        save_cache(cache)
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 AegisAI Python bridge running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
