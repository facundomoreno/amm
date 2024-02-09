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
      const response = await contract.getAllTokens();

      const tokens: Token[] = [];

      response.map((item: any) => {
        tokens.push({
          address: item[0],
          name: item[1],
          tag: item[2],
        });
      });

      return tokens;
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isContractLoading]);

  return { getAllTokens, isTokensReqLoading, isContractLoading };
};

export default useGetAllTokens;
