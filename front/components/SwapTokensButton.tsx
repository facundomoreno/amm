import AutorenewIcon from "@mui/icons-material/Autorenew";

interface SwapTokensButton {
  onClick: () => void;
  size: number;
}

const SwapTokensButton = ({ onClick, size }: SwapTokensButton) => {
  return (
    <div
      className={`flex items-center justify-center bg-white rounded-full cursor-pointer p-2`}
      onClick={onClick}
    >
      <AutorenewIcon style={{ color: "black" }} />
    </div>
  );
};

export default SwapTokensButton;
