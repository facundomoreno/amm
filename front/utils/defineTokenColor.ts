const defineTokenColor = (tokenIndex: number) => {
  const colors = [
    "#dc2626", // red
    "#ea580c", // orange
    "#d97706", // amber
    "#65a30d", // lime
    "#60a5fa", // green
    "#059669", // emerald
    "#06b6d4", // cyan
    "#2563eb", // blue
    "#4f46e5", // violet
    "#d946ef", // pink
    "#991b1b", // deep red
    "#eb9b9b", // deep blue
  ];

  const i =
    tokenIndex % 2 == 0 || tokenIndex == 0
      ? tokenIndex
      : colors.length - tokenIndex;

  return colors[i];
};

export default defineTokenColor;
