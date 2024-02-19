import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { toast } from "react-toastify";

const useGetUserByAddress = () => {
  const { contract } = useAmmControllerContract();
  const [isLoading, setIsLoading] = useState(false);

  const getUser = useCallback(
    async (address: string) => {
      if (!contract) return;

      setIsLoading(true);

      try {
        const response = await contract.getUserByAddress(address);

        return response;
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { getUser, isLoading };
};

export default useGetUserByAddress;
