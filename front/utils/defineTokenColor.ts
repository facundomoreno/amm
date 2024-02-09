import colors from "tailwindcss/colors";

const defineTokenColor = (tokenIndex: number) => {
  const tailwindColors = Object.entries(colors).slice(10, 28);

  const i =
    tokenIndex % 2 == 0 || tokenIndex == 0
      ? tokenIndex
      : tailwindColors.length - tokenIndex;

  return tailwindColors[i][1][600];
};

export default defineTokenColor;
