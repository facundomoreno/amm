import { Wallet } from "ethers";
import { createContext } from "react";

export interface AuthContextType {
  currentUser: AccountType | null;
  changeCurrentUser: (data: AccountType) => void;
}

export interface AccountType {
  address?: string;
  privateKey?: string;
  username?: string;
  signer?: Wallet;
  balance?: string;
  chainId?: string;
  network?: string;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  changeCurrentUser: () => {},
});
