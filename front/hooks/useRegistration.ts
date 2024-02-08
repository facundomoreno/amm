import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { ethers, BaseWallet } from "ethers";
import { WalletState } from "@/components/Registration";

const GAS_SPONSOR_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_KEY;

const useRegistration = () => {
  const contract = useAmmControllerContract();

  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(
    async (userWallet: WalletState, username: string) => {
      if (!contract) return;

      setIsLoading(true);

      try {
        let url = "http://127.0.0.1:8545/";
        // let url = "https://rpc.sepolia.org";

        const provider = new ethers.JsonRpcProvider(url);
        const gasSponsorWallet = new ethers.Wallet(GAS_SPONSOR_KEY!, provider);
        const newUserWallet = new ethers.Wallet(
          userWallet?.privateKey!,
          provider
        );

        const userAlreadyRegistered = await contract.checkIfUserExists(
          newUserWallet.address
        );

        if (!userAlreadyRegistered) {
          await gasSponsorWallet.sendTransaction({
            from: gasSponsorWallet.address,
            to: newUserWallet.address,
            value: ethers.parseEther("2"),
          });

          // @ts-ignore
          const tx = await contract.connect(newUserWallet).createUser(username);
          await tx.wait();
        } else {
          throw new Error("User already registered");
        }
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { register, isLoading };
};

export default useRegistration;
