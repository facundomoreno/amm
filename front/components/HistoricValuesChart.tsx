"use client";

import React from "react";
import { Chart } from "react-google-charts";

const data = [
  ["Month", "Facu", "Polo", "Jotto"],
  ["Diciembre", 1000, 1000, 1000],
  ["Enero", 1500, 1400, 900],
  ["Febrero", 1100, 1100, 100],
  ["Marzo", 1300, 1600, 200],
  ["Abril", 1200, 1700, 800],
  ["Mayo", 1500, 1560, 1600],
];

export const options = {
  curveType: "function",
  legend: { position: "bottom" },
  chartArea: { width: "85%" },
};

const HistoricValuesChart = () => {
  return (
    <Chart
      chartType="LineChart"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
};

export default HistoricValuesChart;
