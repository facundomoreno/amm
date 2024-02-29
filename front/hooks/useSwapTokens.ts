import { useCallback, useContext, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { AuthContext } from "@/context/AuthContext";
import decodeEthersError from "@/utils/decodeEthersError";
import { toast } from "react-toastify";
import axios from "axios";

const API_URI = process.env.NEXT_PUBLIC_HISTORICAL_PRICES_API_URI;

const useSwapTokens = () => {
  const { contract } = useAmmControllerContract();
  const { currentUser } = useContext(AuthContext);

  const [isSwapLoading, setIsLoading] = useState(false);
  const [swapSucceded, setSwapSucceded] = useState(false);

  const swap = useCallback(
    async (
      fromTokenAddress: string,
      toTokenAddress: string,
      amountIn: number
    ) => {
      if (!contract) return;

      setIsLoading(true);

      try {
        await axios({
          url: `${API_URI}/api/trade-tokens`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: {
            traderKey: currentUser?.privateKey,
            fromTokenAddress,
            toTokenAddress,
            amountIn,
          },
        });

        setSwapSucceded(true);
      } catch (e: any) {
        if (e.message.includes("unknown custom error")) {
          const eDecoded = await decodeEthersError(e);

          toast.error(eDecoded.reason?.split("_")[1]);
        } else {
          toast.error(e.message);
        }
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { swap, isSwapLoading, swapSucceded };
};

export default useSwapTokens;
