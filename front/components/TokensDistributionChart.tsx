"use client";

import React from "react";
import { Chart } from "react-google-charts";

interface TokensDistributionChartProps {
  data: any;
}

const data = [
  ["Task", "Amount holded"],
  ["Facu", 5],
  ["Polo", 5],
  ["Jotto", 8],
];

export const options = {
  chartArea: {
    width: "100%",
    height: "100%",
  },
};

const TokensDistributionChart = ({}: TokensDistributionChartProps) => {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"100px"}
    />
  );
};

export default TokensDistributionChart;
