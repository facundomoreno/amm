"use client";

import React from "react";
import { Chart } from "react-google-charts";

interface HistoricValuesChartProps {
  data: any;
  onlyLines?: boolean;
  height: number;
  width?: number;
  options: any;
}

const HistoricValuesChart = ({
  data,
  height,
  width,
  options,
}: HistoricValuesChartProps) => {
  // const options = {
  //   curveType: "function",
  //   legend: { position: "bottom", alignment: "center" },
  //   chartArea: { width: "100%", height: onlyLines ? "100%" : "40%" },
  //   vAxis: {
  //     baselineColor: "transparent",
  //     gridlines: {
  //       interval: 0,
  //     },
  //   },
  // };

  return (
    <Chart
      chartType="LineChart"
      width={width ? `${width}px` : "100%"}
      height={`${height}px`}
      data={data}
      options={options}
    />
  );
};

export default HistoricValuesChart;
