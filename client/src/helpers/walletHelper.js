const WalletHelper = {
    setWalletAddress: (walletAddress, callback) => {
        window.WALLET_ADDRESS = walletAddress;
        callback(walletAddress);
    }
}

export default WalletHelper;