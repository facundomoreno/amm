import { createContext } from "react";

export interface TokensContextType {
  tokens: Token[];
  stableCurrency: Token | undefined;
}

export interface Token {
  address?: string;
  name: string;
  tag: string;
}

export const TokensContext = createContext<TokensContextType>({
  tokens: [],
  stableCurrency: undefined,
});
