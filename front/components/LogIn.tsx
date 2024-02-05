"use client";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { AccountType } from "@/context/AuthContext";

interface LogInProps {
  onUserLogged: (data: AccountType) => void;
  onRegisterClicked: () => void;
}

const LogIn = ({ onUserLogged, onRegisterClicked }: LogInProps) => {
  const [privateKey, setPrivateKey] = useState<string>("");

  const handleLogIn = useCallback(async () => {
    let url = "http://127.0.0.1:8545/";

    const provider = new ethers.JsonRpcProvider(url);

    const signerWallet = new ethers.Wallet(privateKey, provider);

    const signerAddress = await signerWallet.getAddress();

    const balance = (await provider.getBalance(signerAddress)).toString();

    const network = await provider.getNetwork();

    onUserLogged({
      address: signerAddress,
      balance,
      chainId: network.chainId.toString(),
      network: network.name,
      privateKey,
      signer: signerWallet,
      username: "Facu",
    });
  }, [privateKey]);
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 min-h-72 flex flex-col justify-center">
      <div className=" p-8 border-2 border-gray-200 rounded shadow-md">
        <p>Ya tenés una cuenta?</p>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 mt-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Ingresá tu clave privada"
          name="name"
          onChange={(e) => setPrivateKey(e.target.value)}
          value={privateKey}
        />
        <button
          type="submit"
          className={`flex items-center justify-center w-full px-0 sm:px-16 md:px-28 lg:px-32 py-4 mt-6 text-white font-bold rounded bg-black`}
          onClick={handleLogIn}
        >
          <p>Acceder</p>
        </button>
      </div>
      <p
        onClick={() => onRegisterClicked()}
        className="text-right mt-4 cursor-pointer"
      >
        Registrarme
      </p>
    </div>
  );
};

export default LogIn;
