import { ApexOptions } from "apexcharts";
import dynamic from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/shared/lib/dynamic";
import React from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import { isWindowAvailable } from "utils/navigation";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ChartState = {
  chartData: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chartOptions: ApexOptions;
};

export type ChartProps = ChartState & {
  [x: string]: any;
};

class LineChart extends React.Component<ChartProps, ChartState> {
  state: ChartState = {
    chartData: [],
    chartOptions: {},
  };

  constructor(props: ChartProps) {
    super(props);
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  render() {
    if (!isWindowAvailable()) return <></>;
    return (
      <Chart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type="area"
        width="100%"
        height="100%"
      />
    );
  }
}

export default LineChart;
