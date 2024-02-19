import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { ethers, BaseWallet } from "ethers";
import { WalletState } from "@/components/Registration";

const GAS_SPONSOR_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_KEY;

const useRegistration = () => {
  const { contract } = useAmmControllerContract();

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

        // hacer chequeos para reducir la tasa de error

        if (!userAlreadyRegistered) {
          let gasSponsorTxNonce = await gasSponsorWallet.getNonce();
          const gasFeeEstimation = await contract.createUser.estimateGas(
            username
          ); // @ts-ignore

          const gasPrice = (await provider.getFeeData()).gasPrice;

          const aproxEthToSponsor = Number(gasFeeEstimation) * Number(gasPrice);
          console.log(aproxEthToSponsor);
          await gasSponsorWallet.sendTransaction({
            from: gasSponsorWallet.address,
            to: newUserWallet.address,
            value: aproxEthToSponsor,
            nonce: gasSponsorTxNonce,
          });

          gasSponsorTxNonce += 1;

          let success = false;
          let retries = 0;
          let ethSponsorMultiplier = 0.01;

          while (!success && retries <= 15) {
            retries += 1;
            try {
              console.log("VOY A PROBAR CREAR EL USUARIO");
              await gasSponsorWallet.sendTransaction({
                from: gasSponsorWallet.address,
                to: newUserWallet.address,
                value: Math.ceil(aproxEthToSponsor * ethSponsorMultiplier),
                nonce: gasSponsorTxNonce,
              });
              gasSponsorTxNonce += 1;
              ethSponsorMultiplier *= 2;

              const tx = await contract
                .connect(newUserWallet)
                // @ts-ignore
                .createUser(username);
              await tx.wait();

              success = true;
            } catch (e: any) {
              let forceTxToFinish = false;
              if (typeof e.message != undefined) {
                if (
                  !e.message.includes(
                    "sender doesn't have enough funds to send tx"
                  )
                ) {
                  forceTxToFinish = true;
                }
              } else {
                forceTxToFinish = true;
              }

              if (retries == 15 || forceTxToFinish) {
                throw e;
              }
            }
          }
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
