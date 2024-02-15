import { Token } from "@/context/TokensContext";
import HistoricValuesChart from "./HistoricValuesChart";
import colors from "tailwindcss/colors";

// interface TokenData {
//   name: string;
//   tag: string;
//   marketValue: number;
//   amountHoldedByCurrentUser: number;
// }

export interface TokenCardProps {
  // token: TokenData;
  token: Token;
  historicPrices: any;
  color: string;
  stableCurrency: Token;
}

const TokenCard = ({
  token,
  historicPrices,
  color,
  stableCurrency,
}: TokenCardProps) => {
  const chartStyleOptions = {
    curveType: "function",
    legend: { position: "bottom", alignment: "center" },
    chartArea: { width: "100%", height: "100%" },
    vAxis: {
      baselineColor: "transparent",
      gridlines: {
        interval: 0,
      },
    },
  };
  return (
    <div className="flex items-center justify-between p-4 mt-4 border-2 border-gray-200 rounded shadow-xs">
      <div className="flex items-center">
        <div
          style={{ backgroundColor: color }}
          className={`w-4 h-4 rounded-full`}
        />
        <p className="pl-2">{token.name}</p>
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-bold">Valor:</p>
        <p className="text-xs">{`${
          token.marketValue?.toString().split(".")[0]
        } $${stableCurrency.tag}`}</p>
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-bold">Tenes:</p>
        <p className="text-xs">{`${token.currentUserBalance} $${token.tag}`}</p>
      </div>

      <div className="w-22 h-22">
        <HistoricValuesChart
          data={historicPrices}
          onlyLines
          height={50}
          width={60}
          options={chartStyleOptions}
          series={{ 0: { color } }}
        />
      </div>
    </div>
  );
};

export default TokenCard;
