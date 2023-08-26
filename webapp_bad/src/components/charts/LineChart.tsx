import dynamic from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/shared/lib/dynamic";
import { ChartProps } from "./LineAreaChart";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface LineChartProps extends ChartProps {}

export default function LineChart({ chartOptions, chartData }: LineChartProps) {
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="line"
      width="100%"
      height="100%"
    />
  );
}
