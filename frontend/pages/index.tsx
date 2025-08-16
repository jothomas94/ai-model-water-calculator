import { useState } from "react";
import { fetchPrediction, PredictPayload } from "../lib/api";

export default function Home() {
  const [year, setYear] = useState(2025);
  const [demandGrowth, setDemandGrowth] = useState(0.2);
  const [efficiencyImprove, setEfficiencyImprove] = useState(0.05);
  const [tokenGrowth, setTokenGrowth] = useState(0.1);
  const [computeDoubling, setComputeDoubling] = useState(2);

  const [models, setModels] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    try {
      const payload: PredictPayload = {
        year,
        demand_growth_cagr: demandGrowth,
        wue_efficiency_improve: efficiencyImprove,
        token_growth_cagr: tokenGrowth,
        compute_doubling_years: computeDoubling,
      };
      const data = await fetchPrediction(payload);
      setModels(data.models);
      setSources(data.sources);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">
        AI Model Water Usage Calculator
      </h1>

      {/* Input Card */}
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-white">Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Year (>=2025)</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Demand Growth CAGR (e.g., 0.2 = 20%)
            </label>
            <input
              type="number"
              step="0.01"
              value={demandGrowth}
              onChange={(e) => setDemandGrowth(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Efficiency Improvement (e.g., 0.05 = 5%)
            </label>
            <input
              type="number"
              step="0.01"
              value={efficiencyImprove}
              onChange={(e) => setEfficiencyImprove(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Token Growth CAGR (e.g., 0.1 = 10%)
            </label>
            <input
              type="number"
              step="0.01"
              value={tokenGrowth}
              onChange={(e) => setTokenGrowth(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Compute Doubling Years</label>
            <input
              type="number"
              step="0.1"
              value={computeDoubling}
              onChange={(e) => setComputeDoubling(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handlePredict}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Predict"}
        </button>

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>

      {/* Results Card */}
      {models && (
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Predicted Water Usage per Model
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-600 px-4 py-2">Model</th>
                  <th className="border-b border-gray-600 px-4 py-2">
                    Water per ~400 tokens (mL)
                  </th>
                  <th className="border-b border-gray-600 px-4 py-2">Compute Index</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(models).map(([name, vals]: any) => (
                  <tr key={name} className="hover:bg-gray-700">
                    <td className="border-b border-gray-700 px-4 py-2">{name}</td>
                    <td className="border-b border-gray-700 px-4 py-2">{vals.per_inference_water_ml}</td>
                    <td className="border-b border-gray-700 px-4 py-2">{vals.compute_index}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sources Card */}
      {sources.length > 0 && (
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-white">Sources</h3>
          <ul className="list-disc pl-5 space-y-1">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  className="text-blue-400 hover:underline"
                  rel="noreferrer"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
