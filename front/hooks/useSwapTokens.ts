import { useCallback, useContext, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { AuthContext } from "@/context/AuthContext";
import ERC20abi from "../abis/ERC20.abi.json";
import { Contract, ethers } from "ethers";

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
        let url = "http://127.0.0.1:8545/";

        const provider = new ethers.JsonRpcProvider(url);

        const signer = new ethers.Wallet(currentUser?.privateKey!, provider);

        const tokenContract = new Contract(fromTokenAddress, ERC20abi, signer);

        await tokenContract.approve(contract.target, amountIn);

        const tx = await contract.tradeTokens(
          fromTokenAddress,
          toTokenAddress,
          amountIn
        );

        await tx.wait(1);

        setSwapSucceded(true);
      } catch (e) {
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
