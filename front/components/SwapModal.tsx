import { useContext, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Select, { StylesConfig } from "react-select";
import SwapTokensButton from "./SwapTokensButton";
import { Token, TokensContext } from "@/context/TokensContext";
import defineTokenColor from "@/utils/defineTokenColor";

interface SwapModalProps {
  isModalOpen: boolean;
  onCloseClicked: () => void;
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
    width: "80%",
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

// const options = [
//   { value: 0, label: "Facu" },
//   { value: 1, label: "Polo" },
//   { value: 2, label: "Jotto" },
// ];

enum SwapType {
  BUYING_TOKEN,
  SELLING_TOKEN,
}

const SwapModal = ({ isModalOpen, onCloseClicked }: SwapModalProps) => {
  const { tokens } = useContext(TokensContext);

  const [tokenAddressSelected, setTokenAddressSelected] = useState<
    string | undefined
  >(undefined);

  const [swapType, setSwapType] = useState<SwapType>(SwapType.BUYING_TOKEN);

  const handleSelectToken = (item: {
    value: { address: string; color: string };
    label: string;
  }) => {
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
    const options: {
      value: { address: string; color: string };
      label: string;
    }[] = [];

    tokens.map((item, key) => {
      options.push({
        value: { address: item.address!, color: defineTokenColor(key) },
        label: item.name,
      });
    });

    return options;
  };
  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={onCloseClicked}
      style={customModalStyles}
      contentLabel="Tokens Swap"
      ariaHideApp={false}
    >
      <div>
        <h1>Seleccionar token</h1>
        <Select
          className="mt-2"
          options={generateOptionsByTokens()}
          onChange={(itemSelected) => handleSelectToken(itemSelected!)}
          menuPortalTarget={document.body}
          styles={{
            ...stylesForSelect,
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
        <div className="flex items-center justify-center mt-4">
          <p>
            {tokenAddressSelected != undefined ? `500 $FAC disponibles` : "-"}
          </p>
        </div>
        <div className="min-h-44">
          {tokenAddressSelected != undefined ? (
            <>
              <div className="w-full flex justify-between px-4 py-2 mt-2 border-2 border-gray-200 bg-white rounded translate-y-2 z-0">
                <div>
                  <p>Doy</p>
                  <input
                    type="number"
                    placeholder="0"
                    className="appearance-none border-opacity-0 rounded w-12 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
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
                            (item) => item.address == tokenAddressSelected
                          )?.tag
                        : "MUT"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center z-10 relative">
                <SwapTokensButton onClick={handleChangeOrderOfSwap} size={8} />
              </div>
              <div className="w-full flex justify-between px-4 py-2 border-2 border-gray-200 bg-white rounded -translate-y-2 z-0">
                <div>
                  <p>Recibo</p>
                  <input
                    type="number"
                    placeholder="0"
                    className="appearance-none border-opacity-0 rounded w-12 mt-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                            (item) => item.address == tokenAddressSelected
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

        <button className="flex items-center justify-center w-full px-0 sm:px-16 md:px-28 lg:px-32 py-4 mt-6 text-white font-bold rounded bg-black">
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default SwapModal;
