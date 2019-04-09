const exchangeAbi = require("./exchange-abi.json");

const erc20Abi = require("./erc20-abi.json");

const { TRADEX_CONTRACT_ADDRESS } = require("./config");

let tradexContract;

let erc20Contract;

module.exports = {
  connectTradexContract,
  connectERC20Contract,
  getExchangeContract,
  getTokenContract
};

function connectTradexContract(wallet) {
  tradexContract = new ethers.Contract(
    TRADEX_CONTRACT_ADDRESS,
    exchangeAbi,
    wallet
  );
}

function connectERC20Contract(wallet, contractAddress) {
  erc20Contract = new ethers.Contract(contractAddress, erc20Abi, wallet);
}

function getExchangeContract() {
  return tradexContract;
}

function getTokenContract() {
  return erc20Contract;
}
