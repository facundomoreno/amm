import { useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Select, { StylesConfig } from "react-select";
import SwapTokensButton from "./SwapTokensButton";

interface Token {
  id: number;
  name: string;
  tag: string;
}

interface SwapModalProps {
  isModalOpen: boolean;
  onCloseClicked: () => void;
}
const customStyles = {
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

const tokens = [
  { id: 0, name: "Facu", tag: "FAC" },
  { id: 1, name: "Polo", tag: "POL" },
  { id: 2, name: "Jotto", tag: "JTO" },
];

const options = [
  { value: 0, label: "Facu" },
  { value: 1, label: "Polo" },
  { value: 2, label: "Jotto" },
];

enum SwapType {
  BUYING_TOKEN,
  SELLING_TOKEN,
}

const SwapModal = ({ isModalOpen, onCloseClicked }: SwapModalProps) => {
  const [tokenIdSelected, setTokenIdSelected] = useState<number | undefined>(
    undefined
  );

  const [swapType, setSwapType] = useState<SwapType>(SwapType.BUYING_TOKEN);

  const handleSelectToken = (item: { value: number; label: string }) => {
    setTokenIdSelected(item.value);
  };
  const handleChangeOrderOfSwap = () => {
    if (swapType == SwapType.BUYING_TOKEN) {
      setSwapType(SwapType.SELLING_TOKEN);
    } else {
      setSwapType(SwapType.BUYING_TOKEN);
    }
  };
  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={onCloseClicked}
      style={customStyles}
      contentLabel="Tokens Swap"
      ariaHideApp={false}
    >
      <div>
        <h1>Seleccionar token</h1>
        <Select
          className="mt-2"
          options={options}
          onChange={(itemSelected) => handleSelectToken(itemSelected!)}
        />
        <div className="flex items-center justify-center mt-4">
          <p>{tokenIdSelected != undefined ? `500 $FAC disponibles` : "-"}</p>
        </div>
        <div className="min-h-44">
          {tokenIdSelected != undefined ? (
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
                      className={`h-4 w-4 ${
                        swapType == SwapType.SELLING_TOKEN
                          ? "bg-orange-400"
                          : "bg-black"
                      } rounded-full`}
                    />
                    <p className="pl-2">
                      {swapType == SwapType.SELLING_TOKEN
                        ? tokens.find((item) => item.id == tokenIdSelected)?.tag
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
                      className={`h-4 w-4 ${
                        swapType == SwapType.SELLING_TOKEN
                          ? "bg-black"
                          : "bg-orange-400"
                      } rounded-full`}
                    />
                    <p className="pl-2">
                      {swapType == SwapType.SELLING_TOKEN
                        ? "MUT"
                        : tokens.find((item) => item.id == tokenIdSelected)
                            ?.tag}
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
