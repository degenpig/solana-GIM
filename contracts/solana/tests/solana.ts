import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Solana } from '../target/types/solana';

describe('solana', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Solana as Program<Solana>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
