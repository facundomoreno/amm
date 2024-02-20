import { MetaMaskAvatar } from "react-metamask-avatar";

interface HeaderProps {
  username?: string;
  address?: string;
  onLogoutClicked: () => void;
}

const Header = ({ username, address, onLogoutClicked }: HeaderProps) => {
  return (
    <div className="w-full justify-between flex items-center lg:px-32">
      {address && (
        <>
          <div className="flex items-center">
            <MetaMaskAvatar address={address} size={28} />
            <p className="pl-2">{username}</p>
          </div>
          <button
            onClick={onLogoutClicked}
            className="ml-4 flex items-center justify-center py-1 px-4 border-2 border-black text-black text-xs hover:bg-red-700 font-bold rounded"
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
};

export default Header;
