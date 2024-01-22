const ammControllerConstructorArguments: [
  { name: string; tag: string }[],
  { name: string; tag: string },
  number,
  number,
  number,
  number
] = [
  [
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
  ], // tokens
  { name: "Mutante Coin", tag: "MUT" }, // stable currency
  20, // initial supply for tokens
  1000, // initial conversion rate from token to stable
  11, // limit number of users using the contract
  3, //initial buy options of tokens for users
];

export { ammControllerConstructorArguments };
