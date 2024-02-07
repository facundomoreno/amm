"use client";
import { use, useCallback, useContext, useEffect, useState } from "react";
import CopyIcon from "@/public/CopyIcon";
import { ethers } from "ethers";
import Skeleton from "react-loading-skeleton";
import { AccountType, AuthContext } from "@/context/AuthContext";
import ammControllerContractAbi from "../abis/AmmController.abi.json";
import { ErrorDecoder } from "ethers-decode-error";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

interface RegistrationProps {
  onUserCreated: (data: AccountType) => void;
}

interface Wallet {
  address: string;
  privateKey: string;
}

const errorDecoder = ErrorDecoder.create([ammControllerContractAbi]);
const GAS_SPONSOR_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_KEY;
const contractAddress = process.env.NEXT_PUBLIC_AMM_CONTROLLER_CONTRACT;

const Registration = ({ onUserCreated }: RegistrationProps) => {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const authData = useContext(AuthContext);

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(wallet?.privateKey!);
    setCopiedKey(true);
  };

  const confirmUserCreation = useCallback(async () => {
    let url = "http://127.0.0.1:8545/";
    // let url = "https://rpc.sepolia.org";

    const provider = new ethers.JsonRpcProvider(url);
    const gasSponsorWallet = new ethers.Wallet(GAS_SPONSOR_KEY!, provider);
    const newUserWallet = new ethers.Wallet(wallet?.privateKey!, provider);

    const ammControllerContract = new ethers.Contract(
      contractAddress!,
      ammControllerContractAbi,
      newUserWallet
    );

    const userAlreadyRegistered = await ammControllerContract.checkIfUserExists(
      newUserWallet.address
    );

    try {
      if (!userAlreadyRegistered) {
        await gasSponsorWallet.sendTransaction({
          from: gasSponsorWallet.address,
          to: newUserWallet.address,
          value: ethers.parseEther("2"),
        });

        await ammControllerContract.createUser(username);

        const balance = (
          await provider.getBalance(wallet?.address!)
        ).toString();
        const network = await provider.getNetwork();

        onUserCreated({
          address: wallet?.address,
          balance,
          network: network.name,
          signer: newUserWallet,
          chainId: network.chainId.toString(),
          privateKey: wallet?.privateKey, // guardarla encriptada
          username,
        });
        router.push("/");
      } else {
        throw new Error("User already registered");
      }
    } catch (error: Error | any) {
      const decodedError = await errorDecoder.decode(error);
      console.log(decodedError);
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

    getNewWallet().catch((e: any) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    if (copiedKey) {
      setTimeout(function () {
        setCopiedKey(false);
      }, 300);
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
