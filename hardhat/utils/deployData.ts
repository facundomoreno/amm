const ammControllerConstructorArguments: {
  tokens: { name: string; tag: string }[],
  stableCurrency: { name: string; tag: string },
  initialSupplyForTokens: number,
  initialConversionFromTokenToStable: number,
  limitNumberOfUsers: number,
  initialBuyOptionsOfTokensForUsers: number
} = {
  tokens: [
    { name: "Facu", tag: "FAC" },
    { name: "Polo", tag: "POL" },
    { name: "Colo", tag: "COL" },
    { name: "Jotto", tag: "JOT" },
    { name: "Maxi", tag: "MAX" },
    { name: "Wais", tag: "WSM" },
    { name: "Roni", tag: "RON" },
    { name: "Chocho", tag: "CH8" },
    { name: "Ian", tag: "IAN" },
    { name: "Mastro", tag: "MST" },
    { name: "Palmo", tag: "PLM" },
  ], 
  stableCurrency: { name: "Mutante Coin", tag: "MUT" }, 
  initialSupplyForTokens: 20, 
  initialConversionFromTokenToStable: 1000, 
  limitNumberOfUsers: 11, 
  initialBuyOptionsOfTokensForUsers: 3, 
};

export { ammControllerConstructorArguments };
