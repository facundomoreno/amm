import { useContext } from "react";
import TokenCard, { TokenCardProps } from "./TokenCard";
import { TokensContext } from "@/context/TokensContext";
import defineTokenColor from "@/utils/defineTokenColor";

interface TokenListProps {
  onBuyTokenClicked: (address: string) => void;
  onSellTokenClicked: (address: string) => void;
}

const mockHistoricPrices = [
  ["Month", "Token"],
  ["Diciembre", 1000],
  ["Enero", 1400],
  ["Febrero", 1100],
  ["Marzo", 1600],
  ["Abril", 1700],
  ["Mayo", 1560],
];

const TokenList = ({
  onBuyTokenClicked,
  onSellTokenClicked,
}: TokenListProps) => {
  const { tokens, stableCurrency } = useContext(TokensContext);
  return (
    <div>
      {tokens.map((item, key) => (
        <TokenCard
          token={item}
          historicPrices={mockHistoricPrices}
          stableCurrency={stableCurrency!}
          color={defineTokenColor(key)}
          key={key}
          onBuyTokenClicked={(address: string) => onBuyTokenClicked(address)}
          onSellTokenClicked={(address: string) => onSellTokenClicked(address)}
        />
      ))}
    </div>
  );
};

export default TokenList;
