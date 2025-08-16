from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict

app = Flask(__name__)
CORS(app)

SOURCES = [
    {
        "title": "Mistral sustainability audit (Large 2): 45 mL per 400 tokens; 281,000 m³ training",
        "url": "https://www.itpro.com/technology/artificial-intelligence/mistrals-new-sustainability-tracker-tool-shows-the-impact-ai-has-on-the-environment-and-it-makes-for-sober-reading"
    },
    {
        "title": "OECD: AI water varies ~1.8–12 L per kWh across Microsoft data centers",
        "url": "https://oecd.ai/en/wonk/how-much-water-does-ai-consume"
    },
    {
        "title": "Making AI Less 'Thirsty' (Li et al., 2023): methodology & 2027 global projections",
        "url": "https://arxiv.org/abs/2304.03271"
    }
]

@app.get("/")
def health():
    return jsonify({"ok": True, "service": "ai-compute-water-predictor", "sources": SOURCES})

@app.post("/predict")
def predict_endpoint():
    data = request.get_json(force=True)
    year = data.get("year")
    params = {
        "demand_growth_cagr": data.get("demand_growth_cagr"),
        "wue_efficiency_improve": data.get("wue_efficiency_improve"),
        "token_growth_cagr": data.get("token_growth_cagr"),
        "doubling_years": data.get("compute_doubling_years"),
    }
    # Clean defaults
    params = {k: v for k, v in params.items() if isinstance(v, (int, float))}
    if not isinstance(year, int):
        return jsonify({"error": "year must be an integer (>= 2025)"}), 400
    try:
        res = predict(year, **params)
        res["sources"] = SOURCES
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
