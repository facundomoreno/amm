import { Contract, ethers } from "ethers";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ammControllerContractAbi from "../abis/AmmController.abi.json";

const contractAddress = process.env.NEXT_PUBLIC_AMM_CONTROLLER_CONTRACT;

const useAmmControllerContract = () => {
  const { currentUser } = useContext(AuthContext);
  const [contract, setContract] = useState<Contract | undefined>(undefined);

  useEffect(() => {
    const generateContractForPublicViews = async () => {
      let url = "http://127.0.0.1:8545/";

      const provider = new ethers.JsonRpcProvider(url);

      const signerWallet = await ethers.Wallet.createRandom(provider);

      const contractForView = new Contract(
        contractAddress!,
        ammControllerContractAbi,
        signerWallet
      );
      setContract(contractForView);
    };

    const generateContractWithUser = () => {
      const newContract = new Contract(
        contractAddress!,
        ammControllerContractAbi,
        currentUser?.signer
      );
      setContract(newContract);
    };

    const defineContractToLoad = async () => {
      if (currentUser?.signer) {
        generateContractWithUser();
      } else {
        await generateContractForPublicViews();
      }
    };

    defineContractToLoad();
  }, [currentUser]);

  return contract;
};

export default useAmmControllerContract;
