import { Token } from "@/context/TokensContext";
import HistoricValuesChart from "./HistoricValuesChart";
import colors from "tailwindcss/colors";
import SwapTokensButton from "./SwapTokensButton";

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
  onBuyTokenClicked: (address: string) => void;
  onSellTokenClicked: (address: string) => void;
}

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

const TokenCard = ({
  token,
  historicPrices,
  color,
  stableCurrency,
  onBuyTokenClicked,
  onSellTokenClicked,
}: TokenCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 mt-4 border-2 border-gray-200 rounded shadow-xs">
      <div className="flex flex-col">
        <div className="flex items-center">
          <div
            style={{ backgroundColor: color }}
            className={`w-4 h-4 rounded-full`}
          />
          <p className="pl-2">{token.name}</p>
        </div>

        <div className="flex flex-col mt-4">
          <p className="text-sm font-bold">Valor:</p>
          <p className="text-sm">{`${
            token.marketValue?.toString().split(".")[0]
          } $${stableCurrency.tag}`}</p>
        </div>

        <div className="flex flex-col mt-4">
          <p className="text-sm font-bold">Tenes:</p>
          <p className="text-sm">{`${token.currentUserBalance} $${token.tag}`}</p>
        </div>
      </div>
      <div className="flex flex-col">
        <button
          onClick={() => onBuyTokenClicked(token.address)}
          className="flex items-center justify-center py-1 px-4 border-2 border-transparent bg-black text-white text-xs font-bold rounded"
        >
          Comprar
        </button>
        <button
          onClick={() => onSellTokenClicked(token.address)}
          className="flex items-center justify-center py-1 px-4 border-2 border-black  text-xs font-bold rounded mt-2"
        >
          Vender
        </button>
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
