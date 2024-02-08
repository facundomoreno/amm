import { MetaMaskAvatar } from "react-metamask-avatar";

interface HeaderProps {
  username?: string;
  address?: string;
  onLogoutClicked: () => void;
}

const Header = ({ username, address, onLogoutClicked }: HeaderProps) => {
  return (
    <div className="w-full justify-end flex items-center">
      {address && (
        <>
          <p className="pr-2">{username}</p>
          <MetaMaskAvatar address={address} size={28} />
          <button
            onClick={onLogoutClicked}
            className="ml-4 flex items-center justify-center py-1 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
};

export default Header;
