import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";

export interface SwapDetailType {
  userBalanceInStable: number;
  userBalanceInToken: number;
  poolStableReserve: number;
  poolTokenReserve: number;
}

const useGetInfoForTokenSwap = () => {
  const { contract } = useAmmControllerContract();
  const [isDetailLoading, setIsLoading] = useState(false);

  const getSwapDetail = useCallback(
    async (
      userAddress: string,
      tokenAddress: string
    ): Promise<SwapDetailType | undefined> => {
      if (!contract) return;

      setIsLoading(true);

      try {
        let userBalanceInStable: BigInt;
        let userBalanceInToken: BigInt;
        let poolStableReserve: BigInt;
        let poolTokenReserve: BigInt;

        userBalanceInToken = await contract.getUserBalanceInToken(
          userAddress,
          tokenAddress
        );
        poolStableReserve = await contract.getPoolStableCurrencyReserve(
          tokenAddress
        );
        poolTokenReserve = await contract.getPoolTokenReserve(tokenAddress);

        userBalanceInStable = await contract.getUserBalanceInStableCurrency(
          userAddress
        );

        return {
          userBalanceInStable: Number(userBalanceInStable),
          userBalanceInToken: Number(userBalanceInToken),
          poolStableReserve: Number(poolStableReserve),
          poolTokenReserve: Number(poolTokenReserve),
        };
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { getSwapDetail, isDetailLoading };
};

export default useGetInfoForTokenSwap;
