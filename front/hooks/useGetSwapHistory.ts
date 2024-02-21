import { useContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { AuthContext } from "@/context/AuthContext";

export interface SwapHistoryDataType {
  traderAddress: string;
  tokenFrom: string;
  tokenTo: string;
  amountGiven: number;
  amountReceived: number;
  date: Date;
}

const API_URI = process.env.NEXT_PUBLIC_HISTORICAL_PRICES_API_URI;
const LIMIT = 4;

const useGetSwapHistory = () => {
  const { currentUser } = useContext(AuthContext);
  const [swapHistory, setSwapHistoryValues] = useState<
    SwapHistoryDataType[] | undefined
  >(undefined);
  const [offset, setOffset] = useState<number>(0);
  const [isSwapHistoryRequestLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      const fetchHistoricalValues = async () => {
        const response: AxiosResponse<SwapHistoryDataType[]> = await axios({
          url: `${API_URI}/api/get-user-swaps/${currentUser?.address}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: {
            offset: offset == 0 ? 0 : offset + LIMIT,
            limit: LIMIT,
          },
        });

        setSwapHistoryValues(response.data);
      };

      fetchHistoricalValues().finally(() => {
        setIsLoading(false);
      });
    }
  }, [currentUser, offset]);

  return { swapHistory, setOffset, isSwapHistoryRequestLoading };
};

export default useGetSwapHistory;
