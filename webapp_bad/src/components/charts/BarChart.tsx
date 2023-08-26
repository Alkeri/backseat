import dynamic from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/shared/lib/dynamic";
import React from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import { isWindowAvailable } from "utils/navigation";
import { ChartProps, ChartState } from "./LineAreaChart";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

class ColumnChart extends React.Component<ChartProps, ChartState> {
  constructor(props: ChartState) {
    super(props);
    this.state = {
      chartData: [],
      chartOptions: {},
    };
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
        type="bar"
        width="100%"
        height="100%"
      />
    );
  }
}

export default ColumnChart;
