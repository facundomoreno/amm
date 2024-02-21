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
}

const API_URI = process.env.NEXT_PUBLIC_HISTORICAL_PRICES_API_URI;

const useGetHistoricalValues = () => {
  const [historicalValues, setHistoricalValues] = useState<
    HistoricalValuesData | undefined
  >(undefined);
  const [maxHistoryValue, setMaxValue] = useState<number>(0);
  const [isExternalRequestLoading, setIsLoading] = useState<boolean>(true);

  const generateDataForChart = (data: ApiResponseType): any => {
    const dataForChart = [["Date"]];

    data.historicalPrices.map((item, key) => {
      if (dataForChart[0].length == 1) {
        item.tokensData.map((token, key) => {
          dataForChart[0].push(token.name);
        });
      }
      const dateChartItem: any = [item.date.toString()];
      item.tokensData.map((token, key) => {
        dateChartItem.push(token.price);
      });
      dataForChart.push(dateChartItem);
    });

    return dataForChart;
  };

  useEffect(() => {
    const fetchHistoricalValues = async () => {
      const response: AxiosResponse<ApiResponseType> = await axios({
        url: `${API_URI}/api/get-prices`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const finalData = generateDataForChart(response.data);

      setHistoricalValues(finalData);
      setMaxValue(response.data.maxValue);
    };

    fetchHistoricalValues().finally(() => {
      setIsLoading(false);
    });
  }, []);

  return { historicalValues, maxHistoryValue, isExternalRequestLoading };
};

export default useGetHistoricalValues;
