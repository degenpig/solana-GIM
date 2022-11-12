const signSolana = async(message) => {
  const encodedMessage = new TextEncoder().encode(message);
  const signedMessage  = await window.solana.signMessage(encodedMessage, "utf8");
  console.log(signedMessage);
}