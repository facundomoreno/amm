import { createContext } from "react";

export interface TokensContextType {
  tokens: Token[];
}

export interface Token {
  address?: string;
  name: string;
  tag: string;
}

export const TokensContext = createContext<TokensContextType>({
  tokens: [],
});
