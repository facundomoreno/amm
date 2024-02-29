const HistoricalDataModel = require("../models/HistoricalDataModel");
const SwapData = require("../models/SwapData");

const contractAbi = require("../abis/AmmController.abi.json");
const ERC20abi = require("../abis/ERC20.abi.json");

const ethers = require("ethers");

const updatePrices = async () => {
  const url = process.env.RPC_URL;

  const walletKey = process.env.WALLET_KEY;

  const provider = new ethers.JsonRpcProvider(url);

  const intermediaryWallet = new ethers.Wallet(walletKey, provider);

  const contractForView = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractAbi,
    intermediaryWallet
  );

  const tokensResFromEthers = await contractForView.getAllTokens();

  const currentDate = new Date();

  const tokensDataForDb = await Promise.all(
    tokensResFromEthers.map(async (item) => {
      const poolStableReserve =
        await contractForView.getPoolStableCurrencyReserve(item[0]);
      const poolTokenReserve = await contractForView.getPoolTokenReserve(
        item[0]
      );

      const marketValue = Math.ceil(
        Math.abs(Number(poolStableReserve) / Number(poolTokenReserve))
      );

      return {
        address: item[0],
        name: item[1],
        tag: item[2],
        price: marketValue,
      };
    })
  );

  const newEntry = new HistoricalDataModel({
    tokensData: tokensDataForDb,
    date: currentDate,
  });

  await newEntry.save();
};

const getAllTokens = async () => {
  const url = process.env.RPC_URL;

  const walletKey = process.env.WALLET_KEY;

  const provider = new ethers.JsonRpcProvider(url);

  const intermediaryWallet = new ethers.Wallet(walletKey, provider);

  const contractForView = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractAbi,
    intermediaryWallet
  );

  const tokensResFromEthers = await contractForView.getAllTokens();

  const tokensAddresses = [];

  tokensResFromEthers.map((item) => {
    tokensAddresses.push(item[0]);
  });

  return tokensAddresses;
};

const tradeTokens = async (
  traderKey,
  fromTokenAddress,
  toTokenAddress,
  amountIn
) => {
  try {
    let amountOutReceived = 0;
    const currentDate = new Date();
    const GAS_SPONSOR_KEY = process.env.GAS_SPONSOR_KEY;
    const RPC_URL = process.env.RPC_URL;

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const gasSponsorWallet = new ethers.Wallet(GAS_SPONSOR_KEY, provider);
    const signer = new ethers.Wallet(traderKey, provider);

    const tokenContract = new ethers.Contract(
      fromTokenAddress,
      ERC20abi,
      signer
    );

    const ammContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractAbi,
      signer
    );

    let gasSponsorTxNonce = await gasSponsorWallet.getNonce();

    const gasPrice = (await provider.getFeeData()).gasPrice;

    const gasFeeEstimationForAproval = await tokenContract.approve.estimateGas(
      ammContract.target,
      amountIn
    );

    const aproxEthToSponsorApproval =
      Number(gasFeeEstimationForAproval) * Number(gasPrice);

    await gasSponsorWallet.sendTransaction({
      from: gasSponsorWallet.address,
      to: signer.address,
      value: aproxEthToSponsorApproval,
      nonce: gasSponsorTxNonce,
    });

    gasSponsorTxNonce += 1;

    let approvalSuccess = false;
    let approvalRetries = 0;
    let approvalSponsorMuliplier = 10;
    let forceApprovalToFinish = false;

    while (!approvalSuccess && approvalRetries <= 8 && !forceApprovalToFinish) {
      approvalRetries += 1;
      try {
        await gasSponsorWallet.sendTransaction({
          from: gasSponsorWallet.address,
          to: signer.address,
          value: Math.ceil(
            aproxEthToSponsorApproval * approvalSponsorMuliplier
          ),
          nonce: gasSponsorTxNonce,
        });

        gasSponsorTxNonce += 1;
        approvalSponsorMuliplier *= 1.5;

        const approvalTx = await tokenContract
          .connect(signer)
          .approve(ammContract.target, amountIn);

        await approvalTx.wait();

        approvalSuccess = true;
      } catch (e) {
        if (typeof e.message != undefined) {
          if (
            !e.message.includes(
              "sender doesn't have enough funds to send tx"
            ) &&
            !e.message.includes("insufficient funds") &&
            !e.message.includes("fee too low")
          ) {
            forceApprovalToFinish = true;
          }
        } else {
          forceApprovalToFinish = true;
        }

        if (approvalRetries == 8 || forceApprovalToFinish) {
          throw e;
        }
      }
    }

    const gasFeeEstimationForTrade = await ammContract.tradeTokens.estimateGas(
      fromTokenAddress,
      toTokenAddress,
      amountIn
    );

    const aproxEthToSponsorTrade =
      Number(gasFeeEstimationForTrade) * Number(gasPrice);

    await gasSponsorWallet.sendTransaction({
      from: gasSponsorWallet.address,
      to: signer.address,
      value: aproxEthToSponsorTrade,
      nonce: gasSponsorTxNonce,
    });

    gasSponsorTxNonce += 1;

    let tradeSuccess = false;
    let tradeRetries = 0;
    let tradeSponsorMultiplier = 0.3;
    let forceTradeToFinish = false;

    while (
      !tradeSuccess &&
      tradeRetries <= 8 &&
      !forceTradeToFinish &&
      approvalSuccess
    ) {
      tradeRetries += 1;
      try {
        await gasSponsorWallet.sendTransaction({
          from: gasSponsorWallet.address,
          to: signer.address,
          value: Math.ceil(aproxEthToSponsorTrade * tradeSponsorMultiplier),
          nonce: gasSponsorTxNonce,
        });

        gasSponsorTxNonce += 1;
        tradeSponsorMultiplier *= 2;

        const tx = await ammContract
          .connect(signer)
          .tradeTokens(fromTokenAddress, toTokenAddress, amountIn);
        const resultOfTx = await tx.wait();

        amountOutReceived = resultOfTx.logs[2].args[4];

        tradeSuccess = true;
      } catch (e) {
        if (typeof e.message != undefined) {
          if (
            !e.message.includes(
              "sender doesn't have enough funds to send tx"
            ) &&
            !e.message.includes("insufficient funds") &&
            !e.message.includes("fee too low")
          ) {
            forceTradeToFinish = true;
          }
        } else {
          forceTradeToFinish = true;
        }

        if (tradeRetries == 8 || forceTradeToFinish) {
          throw e;
        }
      }
    }
    if (tradeSuccess && approvalSuccess) {
      const data = new SwapData({
        traderAddress: signer.address,
        tokenFrom: fromTokenAddress,
        tokenTo: toTokenAddress,
        amountGiven: amountIn,
        amountReceived: Number(amountOutReceived),
        date: currentDate,
      });

      try {
        const dataToSave = await data.save();
        await updatePrices();
        return dataToSave;
      } catch (e) {
        throw e;
      }
    }
  } catch (e) {
    throw e;
  }
};

module.exports = { updatePrices, getAllTokens, tradeTokens };
