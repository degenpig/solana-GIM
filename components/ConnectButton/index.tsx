import React, { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '../../contexts/WalletContext';

import headerStyles from '../Header.module.scss'

export const ConnectButton = (props: any) => {
  const { children, disabled, allowWalletChange, className, ...rest } = props;
  const { wallet, connect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);

  const handleClick = useCallback(
    () => {
      console.log('Trying to connect', wallet);
      (wallet ? connect().catch(() => {}) : open())
    },
    [wallet, connect, open],
  );

  // only show if wallet selected or user connected

  return (
    <button
      className={className || `${headerStyles.connectBtn} btn`}
      {...rest}
      style={{ cursor: 'pointer' }}
      onClick={e => {
        props.onClick ? props.onClick(e) : null;
        handleClick();
      }}
      disabled={connected && disabled}
    >
      {children}
    </button>
  );
};
