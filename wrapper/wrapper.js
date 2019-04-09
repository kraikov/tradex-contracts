const ethers = require("ethers");

const { getProvider } = require("./wallet");

const { EXPIRE_BLOCK, TRADEX_CONTRACT_ADDRESS } = require("./config");

const {
  connectTradexContract,
  getExchangeContract,
  getTokenContract
} = require("./contract");

module.exports = {
  setupSwapSigner,
  approveAndSwapForEth,
  approveAndSwapForTokens,
  swapSigner,
  approve,
  getBalance,
  addLiquidityIn,
  getLiquidity
};

function setupSwapSigner(
  wallet,
  interval,
  tokensOutAmount,
  tokensInAmount,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider
) {
  setInterval(async () => {
    const expireBlock = (await getProvider().getBlockNumber()) + EXPIRE_BLOCK;
    const result = await swapSigner(
      wallet,
      tokensOutAmount,
      tokensInAmount,
      expireBlock,
      tokenOutAddress,
      tokenInAddress,
      liquidityProvider
    );

    console.log(result);
  }, interval);
}

async function approveAndSwapForEth(
  wallet,
  ethAmount,
  tokenAmount,
  expireBlock,
  tokensIn,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider,
  signature
) {
  connectTradexContract(wallet);

  const nonce = await getProvider().getTransactionCount(wallet.address);

  await approve(tokensIn, nonce);

  const result = await swapForEth(
    ethAmount,
    tokenAmount,
    expireBlock,
    tokensIn,
    tokenOutAddress,
    tokenInAddress,
    liquidityProvider,
    signature,
    ++nonce
  );

  return result;
}

async function approveAndSwapForTokens(
  wallet,
  tokensOutAmount,
  tokensInAmount,
  expireBlock,
  tokensIn,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider,
  signature
) {
  connectTradexContract(wallet);

  const nonce = await getProvider().getTransactionCount(wallet.address);

  await approve(tokensIn, nonce);

  const result = await swapForTokens(
    tokensOutAmount,
    tokensInAmount,
    expireBlock,
    tokensIn,
    tokenOutAddress,
    tokenInAddress,
    liquidityProvider,
    signature,
    ++nonce
  );

  return result;
}

async function swapSigner(
  wallet,
  tokensOutAmount,
  tokensInAmount,
  expireBlock,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider
) {
  const swapHash = ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "uint256", "address", "address", "address"],
    [
      tokensOutAmount,
      tokensInAmount,
      expireBlock,
      tokenOutAddress,
      tokenInAddress,
      liquidityProvider
    ]
  );
  const hashData = ethers.utils.arrayify(swapHash);
  const swapSignature = await wallet.signMessage(hashData);

  return swapSignature;
}

async function approve(amount, nonce) {
  let options = { nonce };

  const result = await getTokenContract().approve(
    TRADEX_CONTRACT_ADDRESS,
    amount,
    options
  );

  return result;
}

async function getBalance(address) {
  const result = await getExchangeContract().balances(address);

  return result;
}

async function addLiquidityIn(wallet, amount) {
  connectTradexContract(wallet);

  let options = { value: ethers.utils.parseEther(amount.toString()) };

  const result = await getExchangeContract().addLiquidityIn(options);

  return result;
}

async function getLiquidity(wallet) {
  connectTradexContract(wallet);

  const result = await getExchangeContract().getLiquidity();

  return result;
}

async function swapForEth(
  ethAmount,
  tokenAmount,
  expireBlock,
  tokensIn,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider,
  signature,
  nonce
) {
  let options = { nonce };
  const result = await getExchangeContract().swapForEth(
    ethAmount,
    tokenAmount,
    expireBlock,
    tokensIn,
    tokenOutAddress,
    tokenInAddress,
    liquidityProvider,
    signature,
    options
  );

  return result;
}

async function swapForTokens(
  tokensOutAmount,
  tokensInAmount,
  expireBlock,
  tokensIn,
  tokenOutAddress,
  tokenInAddress,
  liquidityProvider,
  signature,
  nonce
) {
  let options = { nonce };
  const result = await getExchangeContract().swapForTokens(
    tokensOutAmount,
    tokensInAmount,
    expireBlock,
    tokensIn,
    tokenOutAddress,
    tokenInAddress,
    liquidityProvider,
    signature,
    options
  );

  return result;
}
