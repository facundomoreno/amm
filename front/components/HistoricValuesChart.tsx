"use client";

import React from "react";
import { Chart } from "react-google-charts";

interface HistoricValuesChartProps {
  data: any;
  onlyLines?: boolean;
  height: number;
  width?: number;
  options: any;
  series: any;
}

const HistoricValuesChart = ({
  data,
  height,
  width,
  options,
  series,
}: HistoricValuesChartProps) => {
  return (
    <Chart
      chartType="LineChart"
      width={width ? `${width}px` : "100%"}
      height={`${height}px`}
      data={data}
      options={{ ...options, series }}
    />
  );
};

export default HistoricValuesChart;
