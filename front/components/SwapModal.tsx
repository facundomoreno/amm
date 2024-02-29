import { useCallback, useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { Oval, ThreeDots } from "react-loader-spinner";
import SwapTokensButton from "./SwapTokensButton";
import { TokensContext } from "@/context/TokensContext";
import defineTokenColor from "@/utils/defineTokenColor";
import useGetInfoForTokenSwap, {
  SwapDetailType,
} from "@/hooks/useGetInfoForTokenSwap";
import { AuthContext } from "@/context/AuthContext";
import useSwapTokens from "@/hooks/useSwapTokens";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
interface SwapModalProps {
  isModalOpen: boolean;
  onCloseClicked: () => void;
  swapPreData?: { addressSelected: string; swapType: SwapType };
}

export enum SwapType {
  BUYING_TOKEN,
  SELLING_TOKEN,
}

interface SelectOption {
  value: { address: string; color: string };
  label: string;
}

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "30px",
    width: "100%",
    backgroundColor: "transparent",
    borderColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
};

const dot = (color = "transparent") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 8,
    height: "1rem",
    width: "1rem",
  },
});

const stylesForSelect: any = {
  input: (styles: any) => ({ ...styles, ...dot() }),
  placeholder: (styles: any) => ({ ...styles, ...dot("#ccc") }),
  singleValue: (styles: any, { data }: any) => ({
    ...styles,
    ...dot(data.value.color),
  }),
};

const TIME_FOR_TOAST = 1500;

const SwapModal = ({
  isModalOpen,
  onCloseClicked,
  swapPreData,
}: SwapModalProps) => {
  const { tokens, stableCurrency } = useContext(TokensContext);
  const { currentUser } = useContext(AuthContext);

  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [tokenAddressSelected, setTokenAddressSelected] = useState<
    string | undefined
  >(undefined);

  const [inputsValues, setInputsValues] = useState<{
    fromInput: number;
    toInput: number;
  }>({ fromInput: 0, toInput: 0 });

  const [swapDetail, setSwapDetail] = useState<SwapDetailType | undefined>(
    undefined
  );

  const [swapType, setSwapType] = useState<SwapType>(SwapType.BUYING_TOKEN);

  const { getSwapDetail, isDetailLoading } = useGetInfoForTokenSwap();
  const { swap, isSwapLoading, swapSucceded } = useSwapTokens();

  const handleSelectToken = (item: SelectOption) => {
    setTokenAddressSelected(item.value.address);
  };
  const handleChangeOrderOfSwap = () => {
    if (swapType == SwapType.BUYING_TOKEN) {
      setSwapType(SwapType.SELLING_TOKEN);
    } else {
      setSwapType(SwapType.BUYING_TOKEN);
    }
  };

  const generateOptionsByTokens = () => {
    const options: SelectOption[] = [];

    tokens.map((item, key) => {
      options.push({
        value: { address: item.address!, color: defineTokenColor(key) },
        label: item.name,
      });
    });

    return options;
  };

  const checkSpecialChar = (e: any) => {
    if (!/[0-9]/.test(e.key) && e.key != "Backspace") {
      e.preventDefault();
    }
  };

  const handleAmountGivenChanged = (pretendedValue: number) => {
    let expectedAmountReceived =
      swapType == SwapType.BUYING_TOKEN
        ? Math.floor(
            (swapDetail?.poolTokenReserve! * pretendedValue) /
              (swapDetail?.poolStableReserve! + pretendedValue)
          )
        : Math.floor(
            (swapDetail?.poolStableReserve! * pretendedValue) /
              (swapDetail?.poolTokenReserve! + pretendedValue)
          );

    setInputsValues({
      fromInput: pretendedValue,
      toInput: expectedAmountReceived,
    });
  };

  const handleAmountReceivedChanged = (pretendedValue: number) => {
    const expectedAmountToGive =
      swapType == SwapType.BUYING_TOKEN
        ? Math.ceil(
            Math.abs(
              (pretendedValue * swapDetail?.poolStableReserve!) /
                (pretendedValue - swapDetail?.poolTokenReserve!)
            )
          )
        : Math.floor(
            Math.abs(
              (pretendedValue * swapDetail?.poolTokenReserve!) /
                (pretendedValue - swapDetail?.poolStableReserve!)
            )
          );

    setInputsValues({
      fromInput: expectedAmountToGive,
      toInput: pretendedValue,
    });
  };

  const isExcedingFromAmountAvailable = () => {
    if (swapType == SwapType.BUYING_TOKEN) {
      if (inputsValues.fromInput > swapDetail?.userBalanceInStable!) {
        return true;
      }
    } else {
      if (inputsValues.fromInput > swapDetail?.userBalanceInToken!) {
        return true;
      }
    }
    return false;
  };

  const handleSwapTokens = useCallback(() => {
    const executeSwap = async () => {
      if (
        !isExcedingFromAmountAvailable() &&
        inputsValues.fromInput != 0 &&
        tokenAddressSelected != undefined
      ) {
        const fromAddress =
          swapType == SwapType.BUYING_TOKEN
            ? stableCurrency?.address
            : tokenAddressSelected;
        const toAddress =
          swapType == SwapType.BUYING_TOKEN
            ? tokenAddressSelected
            : stableCurrency?.address;
        await swap(fromAddress!, toAddress!, inputsValues.fromInput);
      }
    };

    executeSwap();
  }, [inputsValues, swapType, tokenAddressSelected]);

  useEffect(() => {
    if (tokenAddressSelected) {
      const fetchSwapDetail = async () => {
        const details = await getSwapDetail(
          currentUser?.address!,
          tokenAddressSelected
        );

        setSwapDetail(details);
        setInputsValues({ fromInput: 0, toInput: 0 });
      };

      fetchSwapDetail();
    }
  }, [tokenAddressSelected]);

  useEffect(() => {
    setInputsValues({ fromInput: 0, toInput: 0 });
  }, [swapType]);

  useEffect(() => {
    if (swapSucceded && !isSwapLoading) {
      toast.success("Intercambio realizado con éxito", {
        autoClose: TIME_FOR_TOAST,
      });
      setTimeout(function () {
        window.location.reload();
      }, TIME_FOR_TOAST);
    }
  }, [swapSucceded]);

  useEffect(() => {
    if (swapPreData) {
      setTokenAddressSelected(swapPreData.addressSelected);
      setSwapType(swapPreData.swapType);
    } else {
      setSwapDetail(undefined);
      setTokenAddressSelected(undefined);
    }
  }, [swapPreData, isModalOpen]);

  useEffect(() => {
    if (tokens) {
      setSelectOptions(generateOptionsByTokens());
    }
  }, [tokens]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          !swapSucceded && !isSwapLoading ? onCloseClicked() : {};
        }}
        style={customModalStyles}
        contentLabel="Tokens Swap"
        ariaHideApp={false}
      >
        <div className="bg-white border-gray-300 border-2 w-full md:w-1/2 lg:w-1/3 rounded">
          <div className="flex w-full justify-end px-2 py-4">
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() =>
                !swapSucceded && !isSwapLoading ? onCloseClicked() : {}
              }
            >
              <CloseIcon style={{ color: "black" }} />
            </div>
          </div>
          <div className="px-8 pb-8">
            <h1>Seleccionar token</h1>
            <Select
              className="mt-2"
              options={selectOptions}
              defaultValue={
                swapPreData
                  ? selectOptions[
                      tokens.findIndex(
                        (item) => item.address == swapPreData.addressSelected
                      )
                    ]
                  : undefined
              }
              onChange={(itemSelected: any) => handleSelectToken(itemSelected!)}
              menuPortalTarget={document.body}
              styles={{
                ...stylesForSelect,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
            <div className="min-h-72">
              {!isDetailLoading ? (
                <>
                  <div className="flex items-center justify-center mt-4">
                    <p>
                      {swapDetail != undefined
                        ? `${
                            swapType == SwapType.BUYING_TOKEN
                              ? `${swapDetail.userBalanceInStable} $${stableCurrency?.tag}`
                              : `${swapDetail.userBalanceInToken} $${
                                  tokens.find(
                                    (item) =>
                                      item.address == tokenAddressSelected
                                  )?.tag
                                }`
                          } disponibles`
                        : "-"}
                    </p>
                  </div>

                  <div className="min-h-44">
                    {tokenAddressSelected != undefined &&
                    swapDetail != undefined ? (
                      <>
                        <div className="w-full flex justify-between px-4 py-2 mt-2 border-2 border-gray-200 bg-white rounded translate-y-2 z-0">
                          <div>
                            <p>Doy</p>
                            <input
                              type="number"
                              placeholder="0"
                              min={0}
                              onChange={(e) =>
                                handleAmountGivenChanged(e.target.valueAsNumber)
                              }
                              value={
                                inputsValues.fromInput == 0
                                  ? ""
                                  : inputsValues.fromInput
                              }
                              className="appearance-none border-opacity-0 rounded w-full pr-4 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              onKeyDown={(e) => checkSpecialChar(e)}
                              onKeyUpCapture={(e) => checkSpecialChar(e)}
                              onKeyDownCapture={(e) => checkSpecialChar(e)}
                              onPaste={(e: any) => {
                                e.preventDefault();
                                return false;
                              }}
                              autoComplete="off"
                            />
                            {isExcedingFromAmountAvailable() && (
                              <p className="text-red-500 text-xs">
                                Cantidad insuficiente
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="px-2 py-4 h-6 flex justify-between items-center border-2 border-gray-200 rounded">
                              <div
                                style={{
                                  backgroundColor:
                                    swapType == SwapType.SELLING_TOKEN
                                      ? defineTokenColor(
                                          tokens
                                            .map((item) => item.address)
                                            .indexOf(tokenAddressSelected)
                                        )
                                      : "black",
                                }}
                                className={`h-4 w-4 rounded-full`}
                              />
                              <p className="pl-2">
                                {swapType == SwapType.SELLING_TOKEN
                                  ? tokens.find(
                                      (item) =>
                                        item.address == tokenAddressSelected
                                    )?.tag
                                  : "MUT"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center z-10 relative">
                          <SwapTokensButton
                            onClick={handleChangeOrderOfSwap}
                            size={8}
                            isModal
                          />
                        </div>
                        <div className="w-full flex justify-between px-4 py-2 border-2 border-gray-200 bg-white rounded -translate-y-2 z-0">
                          <div>
                            <p>Recibo</p>
                            <input
                              type="number"
                              placeholder="0"
                              min={0}
                              onChange={(e) =>
                                handleAmountReceivedChanged(
                                  e.target.valueAsNumber
                                )
                              }
                              value={
                                inputsValues.toInput == 0
                                  ? ""
                                  : inputsValues.toInput
                              }
                              className="appearance-none border-opacity-0 rounded w-full pr-4 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              onKeyDown={(e) => checkSpecialChar(e)}
                              onKeyUpCapture={(e) => checkSpecialChar(e)}
                              onKeyDownCapture={(e) => checkSpecialChar(e)}
                              onPaste={(e: any) => {
                                e.preventDefault();
                                return false;
                              }}
                              autoComplete="off"
                            />
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="px-2 py-4 h-6 flex justify-between items-center border-2 border-gray-200 rounded">
                              <div
                                style={{
                                  backgroundColor:
                                    swapType == SwapType.SELLING_TOKEN
                                      ? "black"
                                      : defineTokenColor(
                                          tokens
                                            .map((item) => item.address)
                                            .indexOf(tokenAddressSelected)
                                        ),
                                }}
                                className={`h-4 w-4 rounded-full`}
                              />
                              <p className="pl-2">
                                {swapType == SwapType.SELLING_TOKEN
                                  ? "MUT"
                                  : tokens.find(
                                      (item) =>
                                        item.address == tokenAddressSelected
                                    )?.tag}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>Seleccionar un token para realizar el swap</p>
                    )}
                  </div>

                  <button
                    onClick={handleSwapTokens}
                    disabled={
                      isSwapLoading ||
                      swapSucceded ||
                      tokenAddressSelected == undefined ||
                      inputsValues.fromInput == 0
                    }
                    className="flex items-center justify-center w-full px-0 sm:px-16 md:px-28 lg:px-32 py-4 mt-6 text-white font-bold rounded bg-black"
                  >
                    {!isSwapLoading && !swapSucceded ? (
                      <p>Confirmar</p>
                    ) : (
                      <ThreeDots
                        visible={true}
                        height="30"
                        width="30"
                        color="white"
                        radius="9"
                        ariaLabel="three-dots-loading"
                      />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center pt-32">
                  <Oval
                    visible={true}
                    height="30"
                    width="30"
                    color="black"
                    secondaryColor="black"
                    ariaLabel="oval-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SwapModal;
