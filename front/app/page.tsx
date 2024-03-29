"use client";
import HistoricValuesChart from "@/components/HistoricValuesChart";
import SwapHistoryList from "@/components/SwapHistoryList";
import SwapModal, { SwapType } from "@/components/SwapModal";
import SwapTokensButton from "@/components/SwapTokensButton";
import Tabs, { TabOption } from "@/components/Tabs";
import TokenList from "@/components/TokenList";
import TokensDistributionChart from "@/components/TokensDistributionChart";
import TotalStableDisplay from "@/components/TotalStableDisplay";
import { AuthContext } from "@/context/AuthContext";
import {
  Token,
  TokensContext,
  TokensContextType,
} from "@/context/TokensContext";
import useGetAllTokens from "@/hooks/useGetAllTokens";
import useGetHistoricalValues, {
  DateRanges,
} from "@/hooks/useGetHistoricalValues";
import useGetSwapHistory from "@/hooks/useGetSwapHistory";
import defineTokenColor from "@/utils/defineTokenColor";
import { useContext, useEffect, useState } from "react";
import { GoogleChartOptions, GoogleChartTicks } from "react-google-charts";
import { Oval, TailSpin } from "react-loader-spinner";
import Select from "react-select";
import "react-tabs/style/react-tabs.css";

const historicValuesChartStyleOptions: any = {
  backgroundColor: "white",
  curveType: "function",
  chartArea: { width: "70%" },
  legend: { position: "none" },
  vAxis: {
    baselineColor: "transparent",
    viewWindowMode: "explicit",
  },
  hAxis: {
    type: "log",
  },
};

const dateRangeOptions = [
  { value: DateRanges.ONE_DAY, label: "1 día" },
  { value: DateRanges.FIVE_DAYS, label: "5 días" },
  { value: DateRanges.ONE_MONTH, label: "1 mes" },
  { value: DateRanges.SIX_MONTHS, label: "6 meses" },
  { value: DateRanges.THIS_YEAR, label: "Este año" },
  { value: DateRanges.LAST_YEAR, label: "1 año" },
  { value: DateRanges.MAX, label: "Todo" },
];

export default function HomePage() {
  const authData = useContext(AuthContext);

  const { getAllTokens, isTokensReqLoading, isContractLoading } =
    useGetAllTokens();
  const {
    historicalValues,
    maxHistoryValue,
    minHistoryValue,
    isExternalRequestLoading,
    setSortType,
  } = useGetHistoricalValues();

  const { swapHistory, pageCount, setOffset, isSwapHistoryRequestLoading } =
    useGetSwapHistory();

  const [appERC20s, setAppERC20s] = useState<TokensContextType | undefined>(
    undefined
  );
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapModalPreData, setSwapModalPreData] = useState<
    { addressSelected: string; swapType: SwapType } | undefined
  >(undefined);

  const [tokensDataForPieChart, setTokensDataForPieChart] = useState([
    "Token",
    "Amount holded",
  ]);
  const [tokensInChartView, setTokensInChartView] = useState<string[]>([]);

  const [chartSeries, setChartSeries] = useState<any>({});
  const [chartSlices, setChartSlices] = useState<any>({});

  const [currentTab, setCurrentTab] = useState<TabOption>(
    TabOption.TOKENS_LIST
  );

  const generatePieChartData = (tokens: Token[]) => {
    const data: any = [["Token", "Amount holded"]];
    const slices: any = {};

    tokens.map((item, key) => {
      if (item.currentUserBalance > 0) {
        slices[data.length - 1] = { color: defineTokenColor(key) };
        data.push([item.name, item.currentUserBalance]);
      }
    });

    setTokensDataForPieChart(data);
    setChartSlices(slices);
  };

  const defineLineChartSeries = (tokens: Token[]) => {
    const series: any = {};
    tokens.map((item, key) => {
      series[key] = { color: "transparent" };
    });
    return series;
  };

  const handleSwapTokensButtonClicked = () => {
    setSwapModalPreData(undefined);
    setIsSwapModalOpen(true);
  };

  const handleSwapModalClosed = () => {
    setIsSwapModalOpen(false);
  };

  const handleTokenChangedInChartView = (
    tokenAddress: string,
    tokenKey: number,
    checked: boolean
  ) => {
    if (checked) {
      const tokensSelected = [...tokensInChartView, tokenAddress];
      setTokensInChartView(tokensSelected);

      setChartSeries({
        ...chartSeries,
        [tokenKey]: { color: defineTokenColor(tokenKey) },
      });
    } else {
      const tokensSelected = tokensInChartView.filter((item) => {
        return item !== tokenAddress;
      });
      setTokensInChartView(tokensSelected);

      setChartSeries({
        ...chartSeries,
        [tokenKey]: {
          color: "transparent",
        },
      });
    }
  };

  const handleBuyOrSellTokenClicked = (
    addressSelected: string,
    swapType: SwapType
  ) => {
    setSwapModalPreData({
      addressSelected,
      swapType,
    });
    setIsSwapModalOpen(true);
  };

  const handlePageChanged = (page: { selected: number }) => {
    setOffset(page.selected);
  };

  const handleTabChanged = (tabOption: TabOption) => {
    setCurrentTab(tabOption);
    setOffset(0);
  };

  useEffect(() => {
    if (!isContractLoading && authData.currentUser != null) {
      const fetchTokens = async () => {
        const tokensResponse = await getAllTokens();

        setAppERC20s(tokensResponse);
        setChartSeries(defineLineChartSeries(tokensResponse?.tokens!));

        generatePieChartData(tokensResponse?.tokens!);
      };

      fetchTokens();
    }
  }, [isContractLoading]);

  return (
    <>
      {authData.currentUser != null &&
      appERC20s &&
      historicalValues &&
      swapHistory &&
      !isSwapHistoryRequestLoading ? (
        <TokensContext.Provider value={appERC20s}>
          <div className="lg:px-32">
            <TotalStableDisplay />

            <div className="bg-white border-2 border-gray-200 lg:border-gray-300 rounded shadow-xs lg:shadow-lg mt-8 lg:mt-12 py-6 lg:py-8 px-4 lg:px-8">
              <p className="text-xs text-gray-500">Vista de gráfico</p>
              <div className="flex items-center">
                <div className="w-40">
                  <Select
                    className="mt-2"
                    options={dateRangeOptions}
                    defaultValue={dateRangeOptions[0]}
                    onChange={(option: any) => setSortType(option?.value)}
                    menuPortalTarget={document.body}
                  />
                </div>
                <div className="translate-y-1 pl-2">
                  {isExternalRequestLoading && (
                    <Oval
                      visible={true}
                      height="20"
                      width="20"
                      color="black"
                      secondaryColor="black"
                      ariaLabel="oval-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  )}
                </div>
              </div>

              <HistoricValuesChart
                data={historicalValues}
                height={250}
                options={{
                  ...historicValuesChartStyleOptions,
                  vAxis: {
                    ...historicValuesChartStyleOptions.vAxis,
                    viewWindow: {
                      min: minHistoryValue - 10,
                      max: maxHistoryValue + 10,
                    },
                  },
                }}
                series={chartSeries}
              />
              <div className="flex justify-center mt-4 lg:mt-8">
                <div className="grid grid-cols-3 gap-4 lg:gap-8">
                  {appERC20s.tokens.map((item, key) => (
                    <div className="flex items-center" key={key}>
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        style={{
                          accentColor: defineTokenColor(key),
                          outline: `1px auto ${defineTokenColor(key)}`,
                        }}
                        onChange={(e) =>
                          handleTokenChangedInChartView(
                            item.address!,
                            key,
                            e.target.checked
                          )
                        }
                        checked={tokensInChartView.includes(item.address!)}
                      />
                      <p className="pl-2 text-xs md:text-lg lg:text-lg">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end mt-4">
                <div
                  className="flex items-center cursor-pointer bg-black p-2 lg:px-6 lg:py-4 rounded mt-4 lg:mt-0 hover:bg-gray-800"
                  onClick={handleSwapTokensButtonClicked}
                >
                  <SwapTokensButton onClick={() => {}} size={2} />
                  <p className="text-xs lg:text-sm text-white pl-2 ">
                    Comprar / vender
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-16">
              <Tabs onTabChanged={handleTabChanged} selectedTab={currentTab} />

              {currentTab == TabOption.TOKENS_LIST ? (
                <div className="mt-4">
                  <TokenList
                    onBuyTokenClicked={(address: string) =>
                      handleBuyOrSellTokenClicked(
                        address,
                        SwapType.BUYING_TOKEN
                      )
                    }
                    onSellTokenClicked={(address: string) =>
                      handleBuyOrSellTokenClicked(
                        address,
                        SwapType.SELLING_TOKEN
                      )
                    }
                  />
                </div>
              ) : (
                <div className="w-22 mt-8 min-h-96">
                  <TokensDistributionChart
                    data={tokensDataForPieChart}
                    chartSlices={chartSlices}
                  />
                  {swapHistory.length > 0 && (
                    <SwapHistoryList
                      swapHistory={swapHistory}
                      onPageChange={handlePageChanged}
                      pageCount={pageCount}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <SwapModal
            isModalOpen={isSwapModalOpen}
            onCloseClicked={handleSwapModalClosed}
            swapPreData={swapModalPreData}
          />
        </TokensContext.Provider>
      ) : (
        <div className="flex items-center justify-center mt-24">
          <Oval
            visible={true}
            height="40"
            width="40"
            color="black"
            secondaryColor="black"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
    </>
  );
}
