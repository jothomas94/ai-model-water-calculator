export type PredictPayload = {
  year: number; // >= 2025
  demand_growth_cagr?: number;
  wue_efficiency_improve?: number;
  token_growth_cagr?: number;
  compute_doubling_years?: number;
};

export type PredictResponse = {
  year: number;
  assumptions: {
    demand_growth_cagr: number;
    wue_efficiency_improve: number;
    token_growth_cagr: number;
    compute_doubling_years: number;
    baseline_per_400_tokens_ml_2025: number;
    notes: string;
  };
  models: Record<
    string,
    {
      per_inference_water_ml: number;
      compute_index: number;
    }
  >;
  sources?: Array<{ title: string; url: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchPrediction(payload: PredictPayload): Promise<PredictResponse> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
