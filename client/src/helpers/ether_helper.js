import { ethers } from "ethers";
import * as ethcall from "ethcall";

let walletProvider = undefined;

const networkNameFromId = function (id) {
  for (let network of Object.values(window.NETWORKS)) {
    let networkId = parseInt(network.chainId, 16);
    if (networkId === id) {
      return network.chainName;
    }
  }
  return "Unknown Network";
};

const pageNetwork = function (network) {
  if (network.toLowerCase() === "bsc") {
    return window.NETWORKS.BINANCE_SMART_CHAIN;
  }
  if (network.toLowerCase() === "heco") {
    return window.NETWORKS.HECO;
  }
  if (network.toLowerCase() === "polygon") {
    return window.NETWORKS.POLYGON;
  }
  if (network.toLowerCase() === "xdai") {
    return window.NETWORKS.XDAI;
  }
  if (network.toLowerCase() === "fantom") {
    return window.NETWORKS.FANTOM;
  }
  if (network.toLowerCase() === "harmony") {
    return window.NETWORKS.HARMONY_S0;
  }
  if (network.toLowerCase() === "avax") {
    return window.NETWORKS.AVALANCHE;
  }

  return window.NETWORKS.ETHEREUM;
};

const init_wallet = async function (callback, connection) {
  let targetNetwork = pageNetwork("bsc");

  if (window.web3Modal.cachedProvider) {
    await connectWallet(() => {});
  }

  if (walletProvider) {
    let provider = new ethers.providers.Web3Provider(walletProvider);
    let connectedNetwork = await provider.getNetwork();
    let targetNetworkId = parseInt(targetNetwork.chainId, 56);

    var signer = provider.getSigner();

    if (connectedNetwork.chainId === targetNetworkId) {
      start(callback);
    } else {


        const ethAddress = await signer.getAddress()
        connection({
          connected: true,
          walletAddress: ethAddress
        })
        console.log(
        `You are connected to ${networkNameFromId(
          connectedNetwork.chainId
        )}, please switch to ${targetNetwork.chainName} network`
      );
    //   hideLoading();
    }
  } else {

    connection({
      connected: false
    });

    //SHOW CONNECT BUTTON
    // _print_link(
    //   "[CONNECT WALLET]",
    //   () => connectWallet(callback),
    //   "connect_wallet_button"
    // );
    // hideLoading();
  }
};



const connectWallet = async function(callback) {
    try {
      walletProvider = await window.web3Modal.connect()
  
      walletProvider.on("accountsChanged", (accounts) => {
        if (accounts === undefined || accounts.length === 0) {
          window.web3Modal.clearCachedProvider()
        }
        window.location.reload()
      });
  
      walletProvider.on("chainChanged", (networkId) => {
        window.location.reload()
      });



      // let targetNetwork = pageNetwork()
      let provider = new ethers.providers.Web3Provider(walletProvider)
      // let connectedNetwork = await provider.getNetwork()
      // let targetNetworkId = parseInt(targetNetwork.chainId, 56)
  
      var signer = provider.getSigner();

      signer.getAddress().then((ethAddress) => {
        callback({
          connected: true,
          walletAddress: ethAddress
        })
      })
      
    } catch(e) {}
  }


const start = function(f) {
    f().catch(e => {
      console.error(e)
      console.log('Oops something went wrong. Try refreshing the page.')
    })
  }
  


const etherHelper = {
  initWallet: init_wallet,
  connectWallet: connectWallet
}

export default etherHelper;