from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any

# ---- SOURCED BASELINES (2025) ----
# Mistral Large 2 audited numbers:
# - ~45 mL water per ~400-token prompt (inference)
# - ~281,000 m^3 total water for training/18 months window
# Sources: see app.py SOURCES array.

# OECD / WUE context:
# - Data center water-use efficiency (WUE) commonly ~1.8 L/kWh (avg),
#   with location-dependent range ~1.8–12 L/kWh.

@dataclass
class ModelBaseline:
    display: str
    # per-inference water at ~400 tokens in milliliters (ml) for 2025
    per_400tok_water_ml_2025: float
    # optional multiplier to represent relative scale vs Mistral for *other* models (assumption)
    scale: float = 1.0

# Baseline set:
BASELINES: Dict[str, ModelBaseline] = {
    # Audited reference
    "mistral-large-2": ModelBaseline("Mistral Large 2", per_400tok_water_ml_2025=45.0, scale=1.0),

    # Popular peers (assumptions: relative scale vs audited baseline)
    # NOTE: These are *assumptions* to let the app compare models. They’re clearly labeled to users.
    "gpt-4-class":     ModelBaseline("GPT-4-class model",  per_400tok_water_ml_2025=45.0, scale=1.0),
    "claude-class":    ModelBaseline("Claude-class model",  per_400tok_water_ml_2025=45.0, scale=0.85),
    "gemini-class":    ModelBaseline("Gemini-class model",  per_400tok_water_ml_2025=45.0, scale=1.1),
    "llama-class":     ModelBaseline("Llama-class model",   per_400tok_water_ml_2025=45.0, scale=0.65),
}

# Trend assumptions guided by sources:
# We expose them as parameters so the frontend (or query) can pick a scenario.
DEFAULTS = {
    # Inference demand growth: more users & context → more inferences/tokens.
    # (Global studies project sharp growth in AI water withdrawal by 2027.)
    "demand_growth_cagr": 0.20,        # 20%/yr growth (configurable)

    # Efficiency improvement: better cooling / siting / model efficiency.
    # OECD/WUE shows wide spread; assume gradual *improvement* (negative rate).
    "wue_efficiency_improve": 0.05,    # 5%/yr less water per kWh (configurable)

    # Token length users send in future (relative to 400-token baseline)
    "token_growth_cagr": 0.10,         # 10%/yr longer prompts on average

    # For completeness we keep a "compute index" (heuristic), not source-anchored.
    "compute_doubling_years": 2.0,     # ~doubling each 2 years (index only)
}

def project_per_inference_water_ml(year: int, scale: float,
                                   demand_growth_cagr: float,
                                   wue_efficiency_improve: float,
                                   token_growth_cagr: float) -> float:
    base_year = 2025
    if year < base_year:
        raise ValueError("Year must be >= 2025")

    years = year - base_year
    # Start from audited Mistral per-400-token value and model scale.
    w_ml = 45.0 * scale

    # More tokens per request over time:
    token_factor = (1 + token_growth_cagr) ** years

    # Net water per inference changes with two opposing forces:
    #  + demand/token growth (↑ tokens → ↑ water per inference)
    #  – efficiency improvements (↓ water per kWh / better cooling)
    # We model per-inference water ≈ baseline * token_factor * (1 - wue_improve)^years
    eff_factor = (1 - wue_efficiency_improve) ** years

    return float(round(w_ml * token_factor * eff_factor, 2))

def compute_index(year: int, doubling_years: float) -> float:
    base_year = 2025
    years = year - base_year
    return round(1.0 * (2 ** (years / doubling_years)), 2)

def predict(year: int,
            demand_growth_cagr: float = DEFAULTS["demand_growth_cagr"],
            wue_efficiency_improve: float = DEFAULTS["wue_efficiency_improve"],
            token_growth_cagr: float = DEFAULTS["token_growth_cagr"],
            doubling_years: float = DEFAULTS["compute_doubling_years"]) -> Dict[str, Any]:
    results = {}
    for key, b in BASELINES.items():
        per_inf_ml = project_per_inference_water_ml(
            year, b.scale, demand_growth_cagr, wue_efficiency_improve, token_growth_cagr
        )
        results[b.display] = {
            "per_inference_water_ml": per_inf_ml,    # per ~400 tokens *evolving* with token growth
            "compute_index": compute_index(year, doubling_years)  # heuristic index
        }

    return {
        "year": year,
        "assumptions": {
            "demand_growth_cagr": demand_growth_cagr,
            "wue_efficiency_improve": wue_efficiency_improve,
            "token_growth_cagr": token_growth_cagr,
            "compute_doubling_years": doubling_years,
            "baseline_per_400_tokens_ml_2025": 45.0,
            "notes": "Mistral Large 2 audited baseline used; other model scales are assumptions for comparison."
        },
        "models": results
    }
