"use client";
import { useCallback, useEffect, useState } from "react";
import CopyIcon from "@/public/CopyIcon";
import { ethers } from "ethers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface RegistrationProps {}

interface Wallet {
  address: string;
  privateKey: string;
}

const Registration = ({}: RegistrationProps) => {
  const [username, setUsername] = useState<string>("");
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(wallet?.privateKey!);
    setCopiedKey(true);
  };

  const confirmUserCreation = useCallback(async () => {
    let url = "http://127.0.0.1:8545/";
    // let url = "https://rpc.sepolia.org";

    const provider = new ethers.JsonRpcProvider(url);

    try {
      const balance = await provider.getBalance(wallet?.address!);
      const network = await provider.getNetwork();
      const signer = new ethers.Wallet(wallet?.privateKey!, provider);
      console.log(balance, network, signer);
    } catch (error: Error | any) {
      alert(`Error connecting to wallet: ${error?.message ?? error}`);
    }
  }, [wallet]);

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

    getNewWallet().catch((e: any) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    if (copiedKey) {
      setTimeout(function () {
        setCopiedKey(false);
      }, 1000);
    }
  }, [copiedKey]);

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
          Tu nombre
        </label>
        <input
          id="usernameInput"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Juan Pérez"
          name="name"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <button
          type="submit"
          className={`flex items-center justify-center w-full px-0 sm:px-16 md:px-28 lg:px-32 py-4 mt-6 text-white font-bold rounded bg-black`}
          onClick={() => {
            confirmUserCreation();
          }}
        >
          <p>Confirmar</p>
        </button>
      </div>
    </div>
  );
};

export default Registration;
