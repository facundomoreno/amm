"use client";
import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { AccountType } from "@/context/AuthContext";
import useCheckIfAddressIsRegistered from "@/hooks/useGetUserByAddress";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface LogInProps {
  onUserLogged: (data: AccountType) => void;
  onRegisterClicked: () => void;
}

const LogIn = ({ onUserLogged, onRegisterClicked }: LogInProps) => {
  const router = useRouter();
  const [privateKey, setPrivateKey] = useState<string>("");
  const { getUser, isLoading } = useCheckIfAddressIsRegistered();

  const handleLogIn = useCallback(async () => {
    try {
      const wallet = new ethers.Wallet(privateKey);

      const user = await getUser(wallet.address);

      if (user[2]) {
        onUserLogged({
          address: wallet?.address,
          privateKey: wallet?.privateKey,
          username: user[1],
        });

        router.push("/");
      } else {
        toast.error("Usuario no registrado");
      }
    } catch (e: any) {
      toast.error("Error de formato en el código ingresado");
    }
  }, [privateKey]);
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 min-h-72 flex flex-col justify-center">
      <div className=" p-8 border-2 border-gray-300 rounded shadow-md">
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
          {!isLoading ? <p>Acceder</p> : <p>loading</p>}
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
