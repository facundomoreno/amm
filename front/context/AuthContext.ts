import { JsonRpcSigner } from "ethers"
import { createContext } from "react"

export interface AccountType {
    address?: string
    signer: JsonRpcSigner
    balance?: string
    chainId?: string
    network?: string
}

export const AuthContext = createContext<AccountType | null>(null)
