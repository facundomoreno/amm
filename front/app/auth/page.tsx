"use client";

import { ThreeDots } from "react-loader-spinner";
import Image from "next/image";
import LogIn from "@/components/LogIn";
import { useState } from "react";
import Registration from "@/components/Registration";

enum AUTH_COMPONENTS {
  LOG_IN,
  REGISTRATION,
}

export default function Auth() {
  const [userLocation, setUserLocation] = useState<AUTH_COMPONENTS>(
    AUTH_COMPONENTS.LOG_IN
  );
  return (
    <>
      <div className="min-h-screen p-16">
        <h1 className="text-4xl font-sans">
          Bienvenido a mutantes tokens market!
        </h1>
        <div className="flex items-center justify-center mt-56">
          {userLocation == AUTH_COMPONENTS.LOG_IN ? (
            <LogIn
              onAccessClicked={(privateKey) => console.log(privateKey)}
              onRegisterClicked={() =>
                setUserLocation(AUTH_COMPONENTS.REGISTRATION)
              }
            />
          ) : (
            <Registration />
          )}
        </div>
      </div>
    </>
  );
}
