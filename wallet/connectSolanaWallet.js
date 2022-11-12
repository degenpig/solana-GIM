export const connectSolanaWallet = async() => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      try {
        const resp = await window.solana.connect().then(
          
        )
        if (resp.publicKey.toString()) {
          return resp.publicKey.toString();
        }
      } catch (err) {
        // console.log(err);
      }
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  }
}