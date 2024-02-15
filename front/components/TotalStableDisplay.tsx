import { TokensContext } from "@/context/TokensContext";
import { useContext, useEffect } from "react";

const TotalStableDisplay = () => {
  const { tokens, stableCurrency } = useContext(TokensContext);

  const calculateTotalBalanceInStable = () => {
    let balance = stableCurrency?.currentUserBalance!;

    tokens.map((item, key) => {
      const tokenToStable = item.currentUserBalance * item.marketValue!;

      balance += tokenToStable;
    });

    return balance;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-bold mt-12">{`TU TOTAL: ${calculateTotalBalanceInStable()} $MUT`}</h1>
      <p className="text-gray-400 mt-1">{`En mano: ${stableCurrency?.currentUserBalance} $MUT`}</p>
    </div>
  );
};

export default TotalStableDisplay;
