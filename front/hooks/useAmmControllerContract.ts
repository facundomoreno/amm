import { Contract, Wallet, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ammControllerContractAbi from "../abis/AmmController.abi.json";

const contractAddress = process.env.NEXT_PUBLIC_AMM_CONTROLLER_CONTRACT;
const RPC_NODE_URL = process.env.NEXT_PUBLIC_RPC_NODE;

const useAmmControllerContract = (forcedWallet?: Wallet) => {
  const { currentUser } = useContext(AuthContext);
  const [contract, setContract] = useState<Contract | undefined>(undefined);
  const [isContractLoading, setContractLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateContractForPublicViews = async () => {
      const provider = new ethers.JsonRpcProvider(RPC_NODE_URL);

      const signerWallet = await ethers.Wallet.createRandom(provider);

      const contractForView = new Contract(
        contractAddress!,
        ammControllerContractAbi,
        signerWallet
      );
      setContract(contractForView);
    };

    const generateContractWithUser = () => {
      const provider = new ethers.JsonRpcProvider(RPC_NODE_URL);

      const signer = new ethers.Wallet(currentUser?.privateKey!, provider);

      const newContract = new Contract(
        contractAddress!,
        ammControllerContractAbi,
        signer
      );
      setContract(newContract);
    };

    const defineContractToLoad = async () => {
      if (currentUser?.address) {
        generateContractWithUser();
      } else {
        await generateContractForPublicViews();
      }
    };

    defineContractToLoad().finally(() => {
      setContractLoading(false);
    });
  }, [currentUser]);

  return { contract, isContractLoading };
};

export default useAmmControllerContract;
