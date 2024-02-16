import { Token } from "@/context/TokensContext";
import HistoricValuesChart from "./HistoricValuesChart";

export interface TokenCardProps {
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
    <div className=" p-6 mt-4 border-2 border-gray-200 rounded shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            style={{ backgroundColor: color }}
            className={`w-4 h-4 rounded-full`}
          />
          <p className="pl-2">{token.name}</p>
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

      <div></div>
      <p className="text-sm font-bold mt-2">Valor:</p>
      <p className="text-sm">{`${
        token.marketValue?.toString().split(".")[0]
      } $${stableCurrency.tag}`}</p>

      <p className="text-sm font-bold mt-4">Tenes:</p>
      <p className="text-sm">{`${token.currentUserBalance} $${token.tag}`}</p>

      <div className="flex items-center mt-4">
        <div className="flex-1 pr-2">
          <button
            onClick={() => onBuyTokenClicked(token.address)}
            className="flex w-full items-center justify-center py-1 px-4 border-2 border-transparent bg-black text-white text-xs font-bold rounded"
          >
            Comprar
          </button>
        </div>
        <div className="flex-1 pl-2">
          <button
            onClick={() => onSellTokenClicked(token.address)}
            className="flex w-full items-center justify-center py-1 px-4 border-2 border-black  text-xs font-bold rounded"
          >
            Vender
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
