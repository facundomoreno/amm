import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";

const useCheckIfAddressIsRegistered = () => {
  const contract = useAmmControllerContract();
  const [isLoading, setIsLoading] = useState(false);

  const getAddressRegistered = useCallback(
    async (address: string) => {
      if (!contract) return;

      setIsLoading(true);

      try {
        const response = await contract.checkIfUserExists(address);

        return response;
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { getAddressRegistered, isLoading };
};

export default useCheckIfAddressIsRegistered;
