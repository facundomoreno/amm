"use client";
import LogIn from "@/components/LogIn";
import { useState } from "react";
import Registration from "@/components/Registration";
import { AccountType, AuthContext } from "@/context/AuthContext";

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
      <AuthContext.Consumer>
        {({ currentUser, changeCurrentUser }) => (
          <>
            {currentUser == null && (
              <div className="min-h-screen p-16">
                <h1 className="text-4xl font-sans">
                  Bienvenido a mutantes tokens market!
                </h1>
                <div className="flex items-center justify-center mt-56">
                  {userLocation == AUTH_COMPONENTS.LOG_IN ? (
                    <LogIn
                      onUserLogged={(data: AccountType) =>
                        changeCurrentUser(data)
                      }
                      onRegisterClicked={() =>
                        setUserLocation(AUTH_COMPONENTS.REGISTRATION)
                      }
                    />
                  ) : (
                    <Registration
                      onUserCreated={(data: AccountType) =>
                        changeCurrentUser(data)
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </AuthContext.Consumer>
    </>
  );
}
