import AutorenewIcon from "@mui/icons-material/Autorenew";

interface SwapTokensButton {
  onClick: () => void;
  size: number;
}

const SwapTokensButton = ({ onClick, size }: SwapTokensButton) => {
  const width = `w-[${size}px]`;
  const height = `h-[${size}px]`;
  return (
    <div
      className={`flex ${width} ${height} items-center justify-center bg-black rounded-full cursor-pointer p-2`}
      onClick={onClick}
    >
      <AutorenewIcon style={{ color: "white" }} />
    </div>
  );
};

export default SwapTokensButton;
