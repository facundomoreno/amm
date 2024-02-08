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
import useAmmControllerContract from "@/hooks/useAmmControllerContract";
import { useContext, useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const historicValuesChartData = [
  ["Month", "Facu", "Polo", "Jotto"],
  ["Diciembre", 1000, 1000, 1000],
  ["Enero", 1500, 1400, 900],
  ["Febrero", 1100, 1100, 100],
  ["Marzo", 1300, 1600, 200],
  ["Abril", 1200, 1700, 800],
  ["Mayo", 1500, 1560, 1600],
];

const historicValuesChartStyleOptions = {
  curveType: "function",
  // legend: { position: "bottom", alignment: "center" },
  chartArea: { width: "60%" },
  vAxis: {
    baselineColor: "transparent",
    viewWindowMode: "explicit",
    viewWindow: { min: 0 },
  },
};

const tokenListData = [
  {
    token: {
      name: "Facu",
      tag: "FAC",
      marketValue: 145,
      amountHoldedByCurrentUser: 28,
    },
    historicPrices: [
      ["Month", "Facu"],
      ["Diciembre", 1000],
      ["Enero", 1500],
      ["Febrero", 1100],
      ["Marzo", 1300],
      ["Abril", 1200],
      ["Mayo", 1500],
    ],
    color: "blue",
  },
  {
    token: {
      name: "Polo",
      tag: "POL",
      marketValue: 144,
      amountHoldedByCurrentUser: 47,
    },
    historicPrices: [
      ["Month", "Polo"],
      ["Diciembre", 1000],
      ["Enero", 1400],
      ["Febrero", 1100],
      ["Marzo", 1600],
      ["Abril", 1700],
      ["Mayo", 1560],
    ],
    color: "red",
  },
  {
    token: {
      name: "Jotto",
      tag: "JTO",
      marketValue: 149,
      amountHoldedByCurrentUser: 210,
    },
    historicPrices: [
      ["Month", "Jotto"],
      ["Diciembre", 1000],
      ["Enero", 900],
      ["Febrero", 100],
      ["Marzo", 200],
      ["Abril", 800],
      ["Mayo", 1600],
    ],
    color: "orange",
  },
];

export default function HomePage() {
  const authData = useContext(AuthContext);
  const contract = useAmmControllerContract();

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const handleSwapTokensButtonClicked = () => {
    setIsSwapModalOpen(true);
  };

  const handleSwapModalClosed = () => {
    setIsSwapModalOpen(false);
  };

  return (
    <>
      {authData.currentUser != null ? (
        <main className="">
          <div className="">
            <TotalStableDisplay />

            <div className="">
              <HistoricValuesChart
                data={historicValuesChartData}
                height={200}
                options={historicValuesChartStyleOptions}
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
                  <TokenList tokenItems={tokenListData} />
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
      ) : (
        <></>
      )}
    </>
  );
}
