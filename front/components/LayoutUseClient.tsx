"use client";

import { ReactNode, useState } from "react";
import { AccountType, AuthContext } from "@/context/AuthContext";
import { ethers } from "ethers";

const LayoutUseClient = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default LayoutUseClient;
