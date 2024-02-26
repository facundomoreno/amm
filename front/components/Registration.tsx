"use client";
import { useCallback, useEffect, useState } from "react";
import CopyIcon from "@/public/CopyIcon";
import { ethers } from "ethers";
import Skeleton from "react-loading-skeleton";
import { AccountType } from "@/context/AuthContext";
import ammControllerContractAbi from "../abis/AmmController.abi.json";
import { ErrorDecoder } from "ethers-decode-error";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";
import useRegistration from "@/hooks/useRegistration";
import { toast } from "react-toastify";

interface RegistrationProps {
  onUserCreated: (data: AccountType) => void;
}

export interface WalletState {
  address: string;
  privateKey: string;
}

const errorDecoder = ErrorDecoder.create([ammControllerContractAbi]);

const Registration = ({ onUserCreated }: RegistrationProps) => {
  const router = useRouter();
  const { register, isLoading, isRegisterSuccess } = useRegistration();
  const [username, setUsername] = useState<string>("");
  const [wallet, setWallet] = useState<WalletState | undefined>(undefined);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const checkSpecialChar = (e: any) => {
    if (!/[0-9a-zA-Z._]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(wallet?.privateKey!);
    setCopiedKey(true);
  };

  const confirmUserCreation = useCallback(async () => {
    try {
      await register(wallet!, username);
    } catch (e) {
      toast.error("Error al crear usuario");
    }
  }, [wallet, username]);

  useEffect(() => {
    const getNewWallet = async () => {
      let url = "http://127.0.0.1:8545";
      const provider = new ethers.JsonRpcProvider(url);
      const userWallet = await ethers.Wallet.createRandom(provider);
      setWallet({
        address: userWallet.address,
        privateKey: userWallet.privateKey,
      });
    };

    getNewWallet();
  }, []);

  useEffect(() => {
    if (copiedKey) {
      setTimeout(function () {
        setCopiedKey(false);
      }, 300);
    }
  }, [copiedKey]);

  useEffect(() => {
    if (isRegisterSuccess) {
      onUserCreated({
        address: wallet?.address,
        privateKey: wallet?.privateKey,
        username: username,
      });

      router.push("/");
    }
  }, [isLoading, isRegisterSuccess]);

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 min-h-72 flex flex-col justify-center">
      <div className=" p-8 border-2 border-gray-200 rounded shadow-md">
        <p className="">Address de la wallet:</p>
        {wallet ? (
          <p className="font-bold break-all">{wallet.address}</p>
        ) : (
          <Skeleton />
        )}

        <p className="mt-4">Tu clave privada:</p>

        {wallet ? (
          <div className="flex items-center inline-block mt-1">
            <p className="font-bold break-all flex items-center">
              {wallet.privateKey}
            </p>
            <div
              className="cursor-pointer"
              onClick={() => handleCopyPrivateKey()}
            >
              <CopyIcon setCopied={copiedKey} />
            </div>
          </div>
        ) : (
          <Skeleton />
        )}

        <label htmlFor="usernameInput" className="block text-md mb-1 mt-4">
          Nombre de usuario
        </label>
        <input
          id="usernameInput"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Juan Pérez"
          name="name"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          maxLength={35}
          onKeyDown={(e) => checkSpecialChar(e)}
          onKeyUpCapture={(e) => checkSpecialChar(e)}
          onKeyDownCapture={(e) => checkSpecialChar(e)}
          onPaste={(e: any) => {
            e.preventDefault();
            return false;
          }}
          autoComplete="off"
        />
        <button
          type="submit"
          className={`flex items-center justify-center w-full px-0 sm:px-16 md:px-28 lg:px-32 py-4 mt-6 text-white font-bold rounded bg-black`}
          onClick={() => {
            confirmUserCreation();
          }}
        >
          {!isLoading ? <p>Confirmar</p> : <p>Loading...</p>}
        </button>
      </div>
    </div>
  );
};

export default Registration;
