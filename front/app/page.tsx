"use client";
import HistoricValuesChart from "@/components/HistoricValuesChart";
import SwapModal from "@/components/SwapModal";
import SwapTokensButton from "@/components/SwapTokensButton";
import TokenCard from "@/components/TokenCard";
import TokenList from "@/components/TokenList";
import TokensDistributionChart from "@/components/TokensDistributionChart";
import TokensDistributionList from "@/components/TokensDistributionList";
import TotalStableDisplay from "@/components/TotalStableDisplay";
import { AuthContext } from "@/context/AuthContext";
import {
  Token,
  TokensContext,
  TokensContextType,
} from "@/context/TokensContext";
import useAmmControllerContract from "@/hooks/useAmmControllerContract";
import useGetAllTokens from "@/hooks/useGetAllTokens";
import defineTokenColor from "@/utils/defineTokenColor";
import { useContext, useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const historicValuesChartStyleOptions = {
  curveType: "function",
  chartArea: { width: "70%" },
  legend: { position: "none" },
  vAxis: {
    baselineColor: "transparent",
    viewWindowMode: "explicit",
    viewWindow: { min: 0, max: 2050 },
  },
};

const mockDataForHistoricPrices: any = [
  ["Month"],
  ["Diciembre"],
  ["Enero"],
  ["Febrero"],
  ["Marzo"],
  ["Abril"],
  ["Mayo"],
  ["Junio"],
];

const emptyHistoricPrices = [
  ["Month", "dummy"],
  ["Diciembre", 0],
  ["Enero", 0],
  ["Febrero", 0],
  ["Marzo", 0],
  ["Abril", 0],
  ["Mayo", 0],
  ["Junio", 0],
];

export default function HomePage() {
  const authData = useContext(AuthContext);

  const { getAllTokens, isTokensReqLoading, isContractLoading } =
    useGetAllTokens();

  const [appERC20s, setAppERC20s] = useState<TokensContextType | undefined>(
    undefined
  );
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const [tokensDataForChart, setTokensDataForChart] =
    useState(emptyHistoricPrices);
  const [tokensInChartView, setTokensInChartView] = useState<string[]>([]);

  const [chartSeries, setChartSeries] = useState<any>({});

  const generateMockDataForHistoricPrices = (tokens: Token[]) => {
    const randomIntFromInterval = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    tokens.map((item, key) => {
      mockDataForHistoricPrices[0].push(item.name);

      for (var i = 1; i < mockDataForHistoricPrices.length; i++) {
        const randomPrice = randomIntFromInterval(0, 2000);
        mockDataForHistoricPrices[i].push(randomPrice);
      }
    });

    return mockDataForHistoricPrices;
  };

  const defineChartSeries = (tokens: Token[]) => {
    const series: any = {};
    tokens.map((item, key) => {
      series[key] = { color: "transparent" };
    });
    return series;
  };

  const handleSwapTokensButtonClicked = () => {
    setIsSwapModalOpen(true);
  };

  const handleSwapModalClosed = () => {
    setIsSwapModalOpen(false);
  };

  const handleTokenChangedInChartView = (
    tokenAddress: string,
    tokenKey: number,
    checked: boolean
  ) => {
    if (checked) {
      const tokensSelected = [...tokensInChartView, tokenAddress];
      setTokensInChartView(tokensSelected);

      setChartSeries({
        ...chartSeries,
        [tokenKey]: { color: defineTokenColor(tokenKey) },
      });
    } else {
      const tokensSelected = tokensInChartView.filter((item) => {
        return item !== tokenAddress;
      });
      setTokensInChartView(tokensSelected);

      setChartSeries({ ...chartSeries, [tokenKey]: { color: "transparent" } });
    }
  };

  useEffect(() => {
    if (!isContractLoading) {
      const fetchTokens = async () => {
        const tokensResponse = await getAllTokens();

        setAppERC20s(tokensResponse);
        setTokensDataForChart(
          generateMockDataForHistoricPrices(tokensResponse?.tokens!)
        );
        setChartSeries(defineChartSeries(tokensResponse?.tokens!));
      };

      fetchTokens();
    }
  }, [isContractLoading]);

  return (
    <>
      {authData.currentUser != null && appERC20s && (
        <TokensContext.Provider value={appERC20s}>
          <main className="">
            <div className="">
              <TotalStableDisplay />

              <div className="border-2 border-gray-200 rounded shadow-xs mt-8 p-4">
                <HistoricValuesChart
                  data={tokensDataForChart}
                  height={200}
                  options={historicValuesChartStyleOptions}
                  series={chartSeries}
                />
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-4">
                    {appERC20s.tokens.map((item, key) => (
                      <div className="flex items-center" key={key}>
                        <input
                          type="checkbox"
                          style={{
                            accentColor: defineTokenColor(key),
                            outline: `1px auto ${defineTokenColor(key)}`,
                          }}
                          onChange={(e) =>
                            handleTokenChangedInChartView(
                              item.address!,
                              key,
                              e.target.checked
                            )
                          }
                          checked={tokensInChartView.includes(item.address!)}
                        />
                        <p className="pl-2">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mt-8 cursor-pointer">
                <SwapTokensButton
                  onClick={handleSwapTokensButtonClicked}
                  size={8}
                />
                <p className="text-xs mt-4">INTERCAMBIAR TOKENS</p>
              </div>

              <Tabs className="mt-12">
                <TabList>
                  <Tab>Todos los tokens</Tab>
                  <Tab>Tu balance</Tab>
                </TabList>

                <TabPanel>
                  <div className="mt-8">
                    <TokenList />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className="w-22 mt-8">
                    <TokensDistributionChart data={{}} />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
            <SwapModal
              isModalOpen={isSwapModalOpen}
              onCloseClicked={handleSwapModalClosed}
            />
          </main>
        </TokensContext.Provider>
      )}
    </>
  );
}
