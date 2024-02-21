import { MetaMaskAvatar } from "react-metamask-avatar";

interface HeaderProps {
  username?: string;
  address?: string;
  onLogoutClicked: () => void;
}

const Header = ({ username, address, onLogoutClicked }: HeaderProps) => {
  return (
    <div className="w-full justify-between flex items-center lg:px-32 lg:pt-6">
      {address && (
        <>
          <div className="flex items-center">
            <MetaMaskAvatar address={address} size={28} />
            <p className="pl-2">{username}</p>
          </div>
          <button
            onClick={onLogoutClicked}
            className="ml-4 flex items-center justify-center py-1 lg:py-2 px-4 lg:px-6 border-2 border-black text-black text-xs lg:text-sm hover:bg-gray-100 font-bold rounded"
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
};

export default Header;
