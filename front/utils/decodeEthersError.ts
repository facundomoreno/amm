import { ErrorDecoder } from "ethers-decode-error";
import ammControllerContractAbi from "../abis/AmmController.abi.json";

const errorDecoder = ErrorDecoder.create([ammControllerContractAbi]);

const decodeEthersError = async (error: any) => {
  const decodedError = await errorDecoder.decode(error);
  return decodedError;
};

export default decodeEthersError;
