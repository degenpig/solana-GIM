import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import BN from 'bn.js';

import { useConnection } from '../ConnectionContext';

import {
  getATA,
} from '../../utils/ids';

const dicToken = new PublicKey('6pQnfdrZVm7mASQoRnDfAAi98ngS1eFNij2koW4kUZFS');
export const useDicTokenAccount = () => {
  const connection = useConnection();
  const { publicKey } = useWallet();

  const [tokenAccount, setTokenAccount] = useState<AccountInfo<Buffer>>();

  useEffect(() => {
    let subId = 0;
    const updateAccount = (account: AccountInfo<Buffer> | null) => {
      if (account) {
        setTokenAccount(account);
      }
    };

    (async () => {
      if (!connection || !publicKey) {
        return;
      }

      // non-ATA?
      const walletTokenKey = await getATA(publicKey, dicToken);

      const account = await connection.getAccountInfo(walletTokenKey);
      updateAccount(account);

      subId = connection.onAccountChange(walletTokenKey, updateAccount);
    })();

    return () => {
      if (subId) {
        connection.removeAccountChangeListener(subId);
      }
    };
  }, [setTokenAccount, publicKey, connection]);

  const amount = React.useMemo(() => {
    if (!tokenAccount) return new BN(0);
    const decoded = AccountLayout.decode(tokenAccount.data);
    return new BN(decoded.amount, 'le');
  }, [tokenAccount]);

  return { amount, tokenAccount };
};
