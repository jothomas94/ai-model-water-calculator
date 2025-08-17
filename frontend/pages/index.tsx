import { useState } from "react";
import { fetchPrediction } from "../lib/api";

// Narrow local types: we ignore compute_index on purpose.
type ModelRow = {
  per_inference_water_ml: number;
  compute_index?: number; // backend may send it; we just don't render it
};

type PredictResponse = {
  year: number;
  assumptions: Record<string, any>;
  models: Record<string, ModelRow>;
  sources?: Array<{ title: string; url: string }>;
};

export default function Home() {
  // Inputs (include computeDoublingYears so backend can still compute the index)
  const [year, setYear] = useState<number>(2025);
  const [demandGrowthCAGR, setDemandGrowthCAGR] = useState<number>(0.2);
  const [wueEfficiencyImprove, setWueEfficiencyImprove] = useState<number>(0.05);
  const [tokenGrowthCAGR, setTokenGrowthCAGR] = useState<number>(0.1);
  const [computeDoublingYears, setComputeDoublingYears] = useState<number>(2);

  // Sample text water estimate
  const [sampleText, setSampleText] = useState<string>("Hello World!");

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PredictResponse | null>(null);

  // very rough token estimator (~1 token ≈ 4 chars)
  const estimateTokens = (text: string) => {
    const t = text.trim();
    if (!t) return 0;
    return Math.max(1, Math.ceil(t.length / 4));
  };
  const tokensForSample = estimateTokens(sampleText);
  const fractionOf400 = tokensForSample / 400;

  const handlePredict = async () => {
    setError(null);
    setLoading(true);
    setData(null);

    if (!Number.isInteger(year) || year < 2025) {
      setError("Year must be an integer ≥ 2025.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetchPrediction({
        year,
        demand_growth_cagr: demandGrowthCAGR,
        wue_efficiency_improve: wueEfficiencyImprove,
        token_growth_cagr: tokenGrowthCAGR,
        // keep sending to backend; we won't display the resulting compute index
        compute_doubling_years: computeDoublingYears as unknown as number, // tolerated by most fetchPrediction typings
      } as any); // cast in case your lib/api types don't include compute_doubling_years
      setData(res as PredictResponse);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const models = data?.models ?? {};

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            AI Model Water Usage Calculator
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 space-y-10">
        {/* Parameters */}
        <section className="rounded-xl bg-gray-800 ring-1 ring-gray-700 p-6">
          <h2 className="text-2xl font-semibold mb-6 text-white">Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Year (&gt;= 2025)</label>
              <input
                type="number"
                className="w-full rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                value={year}
                min={2025}
                onChange={(e) => setYear(parseInt(e.target.value || "0", 10))}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Demand Growth CAGR (e.g., 0.2 = 20%)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                value={demandGrowthCAGR}
                onChange={(e) => setDemandGrowthCAGR(parseFloat(e.target.value || "0"))}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Efficiency Improvement (e.g., 0.05 = 5%)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                value={wueEfficiencyImprove}
                onChange={(e) => setWueEfficiencyImprove(parseFloat(e.target.value || "0"))}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Token Growth CAGR (e.g., 0.1 = 10%)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                value={tokenGrowthCAGR}
                onChange={(e) => setTokenGrowthCAGR(parseFloat(e.target.value || "0"))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Compute Doubling Years</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                value={computeDoublingYears}
                onChange={(e) => setComputeDoublingYears(parseFloat(e.target.value || "0"))}
              />
            </div>
          </div>

          {/* Sample text */}
          <div className="mt-6">
            <label className="block mb-2 font-medium">Sample text</label>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-gray-100 placeholder-gray-400 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder='Try "Hello World!"'
            />
            <p className="text-sm text-gray-400 mt-1">
              ~{tokensForSample} tokens (approx), compared to baseline 400 tokens.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </section>

        {/* Results (no compute index column) */}
        <section className="rounded-xl bg-gray-800 ring-1 ring-gray-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Predicted Water Usage per Model
          </h2>

          {data ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 text-gray-300 font-semibold border-b border-gray-700">
                        Model
                      </th>
                      <th className="py-2 text-gray-300 font-semibold border-b border-gray-700">
                        Water per ~400 tokens (mL)
                      </th>
                      <th className="py-2 text-gray-300 font-semibold border-b border-gray-700">
                        For sample text (mL)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(models).map(([name, vals]) => {
                      const per400 = vals.per_inference_water_ml;
                      const sampleMl = Number.isFinite(per400)
                        ? +(per400 * fractionOf400).toFixed(2)
                        : 0;
                      return (
                        <tr key={name}>
                          <td className="py-2 border-b border-gray-800">{name}</td>
                          <td className="py-2 border-b border-gray-800">{per400}</td>
                          <td className="py-2 border-b border-gray-800">{sampleMl}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {data.sources && data.sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-200 mb-2">Sources</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {data.sources.map((s, i) => (
                      <li key={i}>
                        <a
                          className="text-indigo-400 hover:text-indigo-300 underline"
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400">Run a prediction to see results.</p>
          )}
        </section>
      </main>

      <footer className="py-8">
        <div className="mx-auto max-w-4xl px-4 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AI Model Water Usage Calculator · Built by{" "}
          <span className="text-gray-300">Sonia Anne Abraham</span>
        </div>
      </footer>
    </div>
  );
}

