const ammControllerConstructorArguments: {
  tokens: { name: string; tag: string }[];
  stableCurrency: { name: string; tag: string };
  initialSupplyForTokens: number;
  initialConversionFromTokenToStable: number;
  limitNumberOfUsers: number;
  initialBuyOptionsOfTokensForUsers: number;
} = {
  tokens: [
    { name: "Chocho", tag: "CH8" },
    { name: "Colo", tag: "COL" },
    { name: "Facu", tag: "FAC" },
    { name: "Ian", tag: "IAN" },
    { name: "Jotto", tag: "JOT" },
    { name: "Maxi", tag: "MAX" },
    { name: "Mastro", tag: "MST" },
    { name: "Palmo", tag: "PLM" },
    { name: "Polo", tag: "POL" },
    { name: "Roni", tag: "RON" },
    { name: "Wais", tag: "WSM" },
  ],
  stableCurrency: { name: "Mutante Coin", tag: "MUT" },
  initialSupplyForTokens: 2000,
  initialConversionFromTokenToStable: 1000,
  limitNumberOfUsers: 11,
  initialBuyOptionsOfTokensForUsers: 100,
};

export { ammControllerConstructorArguments };
