import HistoricValuesChart from "@/components/HistoricValuesChart";
import TokensDistributionChart from "@/components/TokensDistributionChart";
import TokensDistributionList from "@/components/TokensDistributionList";

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
  return (
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
  );
}
