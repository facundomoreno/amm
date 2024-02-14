import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { Token } from "@/context/TokensContext";

const useGetAllTokens = () => {
  const { contract, isContractLoading } = useAmmControllerContract();
  const [isTokensReqLoading, setIsLoading] = useState(false);

  const getAllTokens = useCallback(async () => {
    if (!contract) return;

    setIsLoading(true);

    try {
      const tokensResponse = await contract.getAllTokens();
      const stableCurrencyDetail = await contract.getStableCurrencyDetails();

      const tokens: Token[] = [];

      tokensResponse.map((item: any) => {
        tokens.push({
          address: item[0],
          name: item[1],
          tag: item[2],
        });
      });

      return {
        tokens,
        stableCurrency: {
          address: stableCurrencyDetail[0],
          name: stableCurrencyDetail[1],
          tag: stableCurrencyDetail[2],
        },
      };
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isContractLoading]);

  return { getAllTokens, isTokensReqLoading, isContractLoading };
};

export default useGetAllTokens;
