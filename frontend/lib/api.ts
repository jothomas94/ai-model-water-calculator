export interface PredictPayload {
  year: number;
  demand_growth_cagr?: number;
  wue_efficiency_improve?: number;
  token_growth_cagr?: number;
  compute_doubling_years?: number;
}

export interface PredictResponse {
  year: number;
  assumptions: any;
  models: Record<string, { per_inference_water_ml: number; compute_index: number }>;
  sources: { title: string; url: string }[];
}

export async function fetchPrediction(payload: PredictPayload): Promise<PredictResponse> {
  const res = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }
  return res.json();
}
