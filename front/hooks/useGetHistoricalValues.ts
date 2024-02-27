import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

interface HistoricalValuesData {
  [index: number]: string | number;
}

interface ApiResponseType {
  historicalPrices: {
    tokensData: { address: string; name: string; tag: string; price: number }[];
    date: Date;
  }[];
  maxValue: number;
  minValue: number;
}

export enum DateRanges {
  ONE_DAY = "ONE_DAY",
  FIVE_DAYS = "FIVE_DAYS",
  ONE_MONTH = "ONE_MONTH",
  SIX_MONTHS = "SIX_MONTHS",
  THIS_YEAR = "THIS_YEAR",
  LAST_YEAR = "ONE_YEAR",
  MAX = "MAX",
}
const API_URI = process.env.NEXT_PUBLIC_HISTORICAL_PRICES_API_URI;

const useGetHistoricalValues = (defaultSortType?: DateRanges) => {
  const [historicalValues, setHistoricalValues] = useState<
    HistoricalValuesData[] | undefined
  >(undefined);
  const [maxHistoryValue, setMaxValue] = useState<number>(0);
  const [minHistoryValue, setMinValue] = useState<number>(0);
  const [isExternalRequestLoading, setIsLoading] = useState<boolean>(true);
  const [sortType, setSortType] = useState<DateRanges>(
    defaultSortType ?? DateRanges.ONE_DAY
  );

  const generateDataForChart = (data: ApiResponseType): any => {
    const dataForChart = [["Date"]];

    data.historicalPrices.map((item, key) => {
      if (dataForChart[0].length == 1) {
        item.tokensData.map((token, key) => {
          dataForChart[0].push(token.name);
        });
      }
      const dateChartItem: any = [new Date(item.date)];
      item.tokensData.map((token, key) => {
        dateChartItem.push(token.price);
      });
      dataForChart.push(dateChartItem);
    });

    return dataForChart;
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchHistoricalValues = async () => {
      const response: AxiosResponse<ApiResponseType> = await axios({
        url: `${API_URI}/api/get-prices/${sortType}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const finalData = generateDataForChart(response.data);

      setHistoricalValues(finalData);
      setMaxValue(response.data.maxValue);
      setMinValue(response.data.minValue);
    };

    fetchHistoricalValues().finally(() => {
      setIsLoading(false);
    });
  }, [sortType]);

  return {
    historicalValues,
    setSortType,
    maxHistoryValue,
    minHistoryValue,
    isExternalRequestLoading,
  };
};

export default useGetHistoricalValues;
