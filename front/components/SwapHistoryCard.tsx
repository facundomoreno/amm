import { Token, TokensContext } from "@/context/TokensContext";
import { SwapHistoryDataType } from "@/hooks/useGetSwapHistory";
import { useContext, useEffect } from "react";
import { SwapType } from "./SwapModal";
import defineTokenColor from "@/utils/defineTokenColor";
import SellIcon from "@mui/icons-material/CallMade";
import BuyIcon from "@mui/icons-material/CallReceived";

export interface SwapHistoryCardProps {
  swapData: SwapHistoryDataType;
}

const SwapHistoryCard = ({ swapData }: SwapHistoryCardProps) => {
  const { tokens, stableCurrency } = useContext(TokensContext);

  const swapType =
    stableCurrency?.address == swapData.tokenFrom
      ? SwapType.BUYING_TOKEN
      : SwapType.SELLING_TOKEN;

  const tokenInfo: Token = tokens.find(
    (item) =>
      item.address ==
      (swapType == SwapType.BUYING_TOKEN
        ? swapData.tokenTo
        : swapData.tokenFrom)
  )!;

  const tokenKey = tokens.findIndex(
    (item) =>
      item.address ==
      (swapType == SwapType.BUYING_TOKEN
        ? swapData.tokenTo
        : swapData.tokenFrom)
  );

  return (
    <div className="px-6 py-1 flex items-center bg-white border-2 border-gray-200 lg:border-gray-300 rounded shadow-xs lg:shadow-md">
      <div className="flex-1 grow-[12]">
        {swapType == SwapType.BUYING_TOKEN ? (
          <p className="text-xs">
            {`Compraste ${swapData.amountReceived} `}
            <span
              className="font-bold"
              style={{ color: defineTokenColor(tokenKey) }}
            >{`$${tokenInfo.tag}`}</span>
            <span>{` a cambio de ${swapData.amountGiven} `}</span>
            <span className="font-bold">{`$${stableCurrency?.tag}`}</span>
          </p>
        ) : (
          <p className="text-xs">
            {`Vendiste ${swapData.amountGiven} `}
            <span
              className="font-bold"
              style={{ color: defineTokenColor(tokenKey) }}
            >{`$${tokenInfo.tag}`}</span>
            <span>{` a cambio de ${swapData.amountReceived} `}</span>
            <span className="font-bold">{`$${stableCurrency?.tag}`}</span>
          </p>
        )}
      </div>
      <div className="pl-2 flex-1 grow-[1] items-center justify-center">
        {swapType == SwapType.BUYING_TOKEN ? <BuyIcon /> : <SellIcon />}
      </div>
    </div>
  );
};

export default SwapHistoryCard;
