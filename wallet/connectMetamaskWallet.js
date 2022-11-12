import { injected } from './connectors';
export const connectMetamaskWallet = async (activate, active, account) => {
  try {
    await activate(injected);
  } catch (err) {
    console.log(err);
  }
};
