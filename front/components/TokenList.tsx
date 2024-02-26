import { useContext } from "react";
import TokenCard from "./TokenCard";
import { TokensContext } from "@/context/TokensContext";
import defineTokenColor from "@/utils/defineTokenColor";
import useGetHistoricalValues, {
  DateRanges,
} from "@/hooks/useGetHistoricalValues";

interface TokenListProps {
  onBuyTokenClicked: (address: string) => void;
  onSellTokenClicked: (address: string) => void;
}

const TokenList = ({
  onBuyTokenClicked,
  onSellTokenClicked,
}: TokenListProps) => {
  const { tokens, stableCurrency } = useContext(TokensContext);

  const { historicalValues, isExternalRequestLoading } = useGetHistoricalValues(
    DateRanges.FIVE_DAYS
  );

  const getHistoricalPricesForObject = (key: number) => {
    if (historicalValues) {
      let object: any = [["Date", "Token"]];

      for (var i = 1; i < historicalValues.length; i++) {
        object.push([historicalValues[i][0], historicalValues[i][key + 1]]);
      }
      return object;
    } else {
      return [];
    }
  };
  return (
    <>
      {historicalValues && !isExternalRequestLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {tokens.map((item, key) => (
            <TokenCard
              token={item}
              historicPrices={getHistoricalPricesForObject(key)}
              stableCurrency={stableCurrency!}
              color={defineTokenColor(key)}
              key={key}
              onBuyTokenClicked={(address: string) =>
                onBuyTokenClicked(address)
              }
              onSellTokenClicked={(address: string) =>
                onSellTokenClicked(address)
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TokenList;
