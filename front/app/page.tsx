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
import { Token, TokensContext } from "@/context/TokensContext";
import useAmmControllerContract from "@/hooks/useAmmControllerContract";
import useGetAllTokens from "@/hooks/useGetAllTokens";
import defineTokenColor from "@/utils/defineTokenColor";
import { useContext, useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const historicValuesChartStyleOptions = {
  curveType: "function",
  chartArea: { width: "60%" },
  vAxis: {
    baselineColor: "transparent",
    viewWindowMode: "explicit",
    viewWindow: { min: 0, max: 2000 },
  },
};

export default function HomePage() {
  const authData = useContext(AuthContext);

  const { getAllTokens, isTokensReqLoading, isContractLoading } =
    useGetAllTokens();

  const [appTokens, setAppTokens] = useState<Token[] | undefined>(undefined);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const generateMockDataForHistoricPrices = (tokens: Token[]) => {
    const randomIntFromInterval = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
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
      series[key] = { color: defineTokenColor(key) };
    });
    return series;
  };

  const handleSwapTokensButtonClicked = () => {
    setIsSwapModalOpen(true);
  };

  const handleSwapModalClosed = () => {
    setIsSwapModalOpen(false);
  };

  useEffect(() => {
    if (!isContractLoading) {
      const fetchTokens = async () => {
        const tokensResponse = await getAllTokens();

        setAppTokens(tokensResponse);
      };

      fetchTokens();
    }
  }, [isContractLoading]);

  return (
    <>
      {authData.currentUser != null && appTokens && (
        <TokensContext.Provider value={{ tokens: appTokens }}>
          <main className="">
            <div className="">
              <TotalStableDisplay />

              <div className="">
                <HistoricValuesChart
                  data={generateMockDataForHistoricPrices(appTokens)}
                  height={200}
                  options={historicValuesChartStyleOptions}
                  series={defineChartSeries(appTokens)}
                />
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
