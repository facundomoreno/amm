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
    <div className="flex flex-col items-center mt-6 lg:mt-12">
      <h1 className="font-bold lg:text-xl">{`TU TOTAL: ${calculateTotalBalanceInStable()} $MUT`}</h1>
      <p className="text-gray-400 mt-1 lg:text-md">{`En mano: ${stableCurrency?.currentUserBalance} $MUT`}</p>
    </div>
  );
};

export default TotalStableDisplay;
