import { useCallback, useContext, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { AuthContext } from "@/context/AuthContext";
import ERC20abi from "../abis/ERC20.abi.json";
import { Contract, ethers } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import decodeEthersError from "@/utils/decodeEthersError";
import { toast } from "react-toastify";

const GAS_SPONSOR_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_NODE;

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
        let url = RPC_URL;

        const provider = new ethers.JsonRpcProvider(url);

        const gasSponsorWallet = new ethers.Wallet(GAS_SPONSOR_KEY!, provider);

        const signer = new ethers.Wallet(currentUser?.privateKey!, provider);

        const tokenContract = new Contract(fromTokenAddress, ERC20abi, signer);

        let gasSponsorTxNonce = await gasSponsorWallet.getNonce();

        const gasPrice = (await provider.getFeeData()).gasPrice;

        const gasFeeEstimationForAproval =
          await tokenContract.approve.estimateGas(contract.target, amountIn); // @ts-ignore

        const aproxEthToSponsorApproval =
          Number(gasFeeEstimationForAproval) * Number(gasPrice);

        await gasSponsorWallet.sendTransaction({
          from: gasSponsorWallet.address,
          to: signer.address,
          value: aproxEthToSponsorApproval,
          nonce: gasSponsorTxNonce,
        });

        gasSponsorTxNonce += 1;

        let approvalSuccess = false;
        let approvalRetries = 0;
        let approvalSponsorMuliplier = 0.1;

        while (!approvalSuccess && approvalRetries <= 8) {
          approvalRetries += 1;
          try {
            await gasSponsorWallet.sendTransaction({
              from: gasSponsorWallet.address,
              to: signer.address,
              value: Math.ceil(
                aproxEthToSponsorApproval * approvalSponsorMuliplier
              ),
              nonce: gasSponsorTxNonce,
            });
            gasSponsorTxNonce += 1;
            approvalSponsorMuliplier *= 2;

            await tokenContract.approve(contract.target, amountIn);

            approvalSuccess = true;
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

            if (approvalRetries == 8 || forceTxToFinish) {
              toast.error("Error en el swap de tokens");
            }
          }
        }

        const gasFeeEstimationForTrade = await contract.tradeTokens.estimateGas(
          fromTokenAddress,
          toTokenAddress,
          amountIn
        );

        const aproxEthToSponsorTrade =
          Number(gasFeeEstimationForTrade) * Number(gasPrice);

        await gasSponsorWallet.sendTransaction({
          from: gasSponsorWallet.address,
          to: signer.address,
          value: aproxEthToSponsorTrade,
          nonce: gasSponsorTxNonce,
        });

        gasSponsorTxNonce += 1;

        let tradeSuccess = false;
        let tradeRetries = 0;
        let tradeSponsorMultiplier = 0.1;

        while (!tradeSuccess && tradeRetries <= 8) {
          tradeRetries += 1;
          try {
            await gasSponsorWallet.sendTransaction({
              from: gasSponsorWallet.address,
              to: signer.address,
              value: Math.ceil(aproxEthToSponsorTrade * tradeSponsorMultiplier),
              nonce: gasSponsorTxNonce,
            });
            gasSponsorTxNonce += 1;
            tradeSponsorMultiplier *= 2;

            const tx = await contract.tradeTokens(
              fromTokenAddress,
              toTokenAddress,
              amountIn
            );
            await tx.wait();

            tradeSuccess = true;
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

            if (tradeRetries == 8 || forceTxToFinish) {
              toast.error("Error en el swap de tokens");
            }
          }
        }

        setSwapSucceded(true);
      } catch (e: any) {
        if (e.message.includes("unknown custom error")) {
          const eDecoded = await decodeEthersError(e);

          toast.error(eDecoded.reason?.split("_")[1]);
        } else {
          toast.error(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { swap, isSwapLoading, swapSucceded };
};

export default useSwapTokens;
