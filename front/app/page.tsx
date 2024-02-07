"use client";
import HistoricValuesChart from "@/components/HistoricValuesChart";
import TokensDistributionChart from "@/components/TokensDistributionChart";
import TokensDistributionList from "@/components/TokensDistributionList";
import { AuthContext } from "@/context/AuthContext";
import useAmmControllerContract from "@/hooks/useAmmControllerContract";
import useCheckIfAddressIsRegistered from "@/hooks/useGetUserByAddress";
import { useContext, useEffect } from "react";

const mockDataForTokensOwnedList = [
  {
    tokenId: 1,
    tokenName: "$FACU",
    amountOwned: 100,
    marketValue: 1500,
  },
  {
    tokenId: 2,
    tokenName: "$POLO",
    amountOwned: 120,
    marketValue: 1600,
  },
  {
    tokenId: 3,
    tokenName: "$JOTTO",
    amountOwned: 280,
    marketValue: 1650,
  },
];

export default function HomePage() {
  const authData = useContext(AuthContext);
  const contract = useAmmControllerContract();

  return (
    <>
      {authData.currentUser != null ? (
        <main className="p-12">
          <div className="flex">
            <div className="flex-1">
              <HistoricValuesChart />
            </div>
            <div className="flex-1 flex flex-col">
              <TokensDistributionChart />
              <TokensDistributionList data={mockDataForTokensOwnedList} />
            </div>
          </div>
        </main>
      ) : (
        <></>
      )}
    </>
  );
}
