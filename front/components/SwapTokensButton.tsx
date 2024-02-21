import AutorenewIcon from "@mui/icons-material/Autorenew";

interface SwapTokensButton {
  onClick: () => void;
  size: number;
  isModal?: boolean;
}

const SwapTokensButton = ({ onClick, isModal }: SwapTokensButton) => {
  return (
    <div
      className={`flex items-center justify-center ${
        isModal ? "bg-black" : "bg-white"
      } rounded-full cursor-pointer p-[1px] lg:p-[2px] ${isModal && "!p-2"}`}
      onClick={onClick}
    >
      <AutorenewIcon style={{ color: isModal ? "white" : "black" }} />
    </div>
  );
};

export default SwapTokensButton;
