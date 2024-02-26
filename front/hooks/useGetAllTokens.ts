import { useCallback, useContext, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { Token } from "@/context/TokensContext";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";

const useGetAllTokens = () => {
  const { contract, isContractLoading } = useAmmControllerContract();
  const { currentUser } = useContext(AuthContext);
  const [isTokensReqLoading, setIsLoading] = useState(false);

  const getAllTokens = useCallback(async () => {
    if (!contract) return;

    setIsLoading(true);

    try {
      const tokensResponse = await contract.getAllTokens();
      const stableCurrencyDetail = await contract.getStableCurrencyDetails();

      const tokens: Token[] = [];

      const userBalanceInStable = await contract.getUserBalanceInStableCurrency(
        currentUser?.address
      );
      await Promise.all(
        tokensResponse.map(async (item: any) => {
          const userBalance = await contract.getUserBalanceInToken(
            currentUser?.address,
            item[0]
          );

          const poolStableReserve = await contract.getPoolStableCurrencyReserve(
            item[0]
          );
          const poolTokenReserve = await contract.getPoolTokenReserve(item[0]);

          const marketValue = Math.ceil(
            Math.abs(Number(poolStableReserve) / Number(poolTokenReserve))
          );
          tokens.push({
            address: item[0],
            name: item[1],
            tag: item[2],
            currentUserBalance: Number(userBalance),
            marketValue,
          });
        })
      );

      return {
        tokens,
        stableCurrency: {
          address: stableCurrencyDetail[0],
          name: stableCurrencyDetail[1],
          tag: stableCurrencyDetail[2],
          currentUserBalance: Number(userBalanceInStable),
        },
      };
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, isContractLoading]);

  return { getAllTokens, isTokensReqLoading, isContractLoading };
};

export default useGetAllTokens;
