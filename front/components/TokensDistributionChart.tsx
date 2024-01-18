"use client";

import React from "react";
import { Chart } from "react-google-charts";

const data = [
  ["Task", "Amount holded"],
  ["Facu", 5],
  ["Polo", 5],
  ["Jotto", 8],
];

export const options = {
  chartArea: {
    width: "100%",
  },
};

const TokensDistributionChart = () => {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />
  );
};

export default TokensDistributionChart;
