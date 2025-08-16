import { Line } from "react-chartjs-2";
import 'chart.js/auto';

interface ChartProps {
  labels: number[];
  data: number[];
}

const Chart = ({ labels, data }: ChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Projected Water Usage (L)',
        data,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.3)',
        tension: 0.2,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default Chart;
