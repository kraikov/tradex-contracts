const ethers = require("ethers");

const provider = ethers.getDefaultProvider("ropsten");

module.exports = {
  getWalletForPrivateKey,
  createWallet,
  getProvider
};

function getWalletForPrivateKey(privateKey) {
  return new ethers.Wallet(privateKey, provider);
}

function createWallet() {
  let wallet = ethers.Wallet.createRandom();

  return wallet;
}

function getProvider() {
  return provider;
}
