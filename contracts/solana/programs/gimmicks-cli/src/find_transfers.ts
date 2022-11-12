#!/usr/bin/env ts-node
import * as fs from 'fs';
import { program } from 'commander';
import log from 'loglevel';

import {
  Keypair,
  ParsedTransactionWithMeta,
  PublicKey,
} from '@solana/web3.js';
import anchor from '@project-serum/anchor';
import { createRequire } from 'module';
import db from './db.cjs';
const require = createRequire(import.meta.url);
const mysql = require('mysql2');

program.version('0.0.1');
log.setLevel(log.levels.INFO);

export const GIMMICKS_PROGRAM_ID = new PublicKey(
  'GLZpzMXW2rkh8ACpPWE2oUsDqwDFJg1DFDWeUrWkf1m6',
);

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export async function loadGimmicksProgram(
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string,
) {
  if (customRpcUrl) console.log('USING CUSTOM URL', customRpcUrl);

  // @ts-ignore
  const solConnection = new anchor.web3.Connection(
    //@ts-ignore
    customRpcUrl || anchor.web3.clusterApiUrl(env),
  );

  const walletWrapper = new anchor.Wallet(walletKeyPair);
  // @ts-ignore
  const provider = new anchor.Provider(solConnection, walletWrapper, {
    preflightCommitment: 'recent',
  });
  const idl = await anchor.Program.fetchIdl(GIMMICKS_PROGRAM_ID, provider);
  const program = new anchor.Program(idl, GIMMICKS_PROGRAM_ID, provider);
  log.debug('program id from anchor', program.programId.toBase58());
  return program;
}

export async function getMetadata(
  mint: PublicKey,
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

const parseTransaction = async (
  program: anchor.Program,
  t: ParsedTransactionWithMeta | null,
  signature: string,
  metadataMapping: { [key: string]: string },
) => {
  if (!t) {
    console.warn(`${signature}: Could not fetch transaction`);
    return;
  }

  const coder = program.coder as anchor.BorshCoder;
  const connection = program.provider.connection;
  for (const [index, ix] of t.transaction.message.instructions.entries()) {
    if (!ix.programId.equals(GIMMICKS_PROGRAM_ID))
      continue;

    if (!('accounts' in ix)) {
      console.warn(`${signature}: Did not expect gimmicks program to be parseable`);
      continue;
    }

    const decoded = coder.instruction.decode(ix.data, 'base58');
    if (!decoded) {
      console.warn(`${signature}: Could not parse instruction ${index}`);
      continue;
    }

    if (decoded.name !== 'transfer')
      continue;

    const data = decoded.data as any;
    
    const srcMetadata = ix.accounts[6].toBase58();
    const dstMetadata = ix.accounts[9].toBase58();
    const srcMint = metadataMapping[srcMetadata];
    const dstMint = metadataMapping[dstMetadata];

    if (!srcMint) {
      console.warn(`${signature}: Could not find src metadata ${srcMetadata}`);
    }
    if (!dstMint) {
      console.warn(`${signature}: Could not find dst metadata ${dstMetadata}`);
    }

    //console.log(`Transferring ${data.amount.toNumber()} tokens from ${srcMint} to ${dstMint}`);
    let exists = await db.runQuery(`SELECT id FROM dicpunches WHERE signature='${signature}'`);
    if (exists.length == 0) {
      console.log('New dic punch:', signature);
      await db.runQuery(`INSERT INTO dicpunches (fromNft, toNft, amount, signature, timestamp) VALUES ('${srcMint}', '${dstMint}', ${data.amount.toNumber()}, '${signature}', '${t.blockTime}')`);
    }
  }
}

programCommand('run')
  .option('--hodor <string>', 'Hodor')
  .option('--until <string>', 'Transaction signature to search until')
  .action(async (options, cmd) => {
    log.info(`Parsed options:`, options);

    const wallet = loadWalletKey(options.keypair);
    const anchorProgram = await loadGimmicksProgram(
      wallet, options.env, options.rpcUrl);
    const connection = anchorProgram.provider.connection;

    const hodorKey = new PublicKey(options.hodor);

    const mintAddresses = require('./mint-addresses.json');
    const metadataAddress = await Promise.all(mintAddresses.map(async (m) => ({
      metadata: (await getMetadata(new PublicKey(m))).toBase58(),
      mint: m,
    })));

    const metadataMapping = metadataAddress.reduce(
      (acc, m) => ({ ...acc, [m.metadata]: m.mint }),
      {},
    );

    let before = null;
    while (true) {
      const signatures = await connection.getSignaturesForAddress(
        hodorKey, { before, until: options.until });

      if (signatures.length === 0) break;

      console.log(`Found ${signatures.length} signatures`);

      const lastThirtyMinsInMs = 1800 * 1000;
      const thirtyMinsAgo = Math.floor((Date.now() - lastThirtyMinsInMs)/1000);
      const succeeded = signatures.filter(s => (s.err === null && s.blockTime > thirtyMinsAgo)).map(s => s.signature);

      if (succeeded.length !== 0) {
        const transactions = await connection.getParsedTransactions(succeeded);

        for (const [index, tx] of transactions.entries()) {
          parseTransaction(anchorProgram, tx, succeeded[index], metadataMapping);
        }
      }

      before = signatures[signatures.length - 1].signature;
    }
  })

function loadWalletKey(keypair): Keypair {
  if (!keypair || keypair == '') {
    throw new Error('Keypair is required!');
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
  );
  log.info(`wallet public key: ${loaded.publicKey}`);
  return loaded;
}

function programCommand(
  name: string,
  options: { requireWallet: boolean } = { requireWallet: true },
) {
  let cmProgram = program
    .command(name)
    .option(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet', //mainnet-beta, testnet, devnets
    )
    .option('-r, --rpc-url <string>', 'Custom rpc url')
    .option('-l, --log-level <string>', 'log level', setLogLevel)

  if (options.requireWallet) {
    cmProgram = cmProgram.requiredOption(
      '-k, --keypair <path>',
      `Solana wallet location`,
    );
  }

  return cmProgram;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value: string, prev: string): string {
  if (value === undefined || value === null) {
    return prev;
  }
  log.info('setting the log value to: ' + value);
  log.setLevel(value as log.LogLevelDesc);
  return value;
}

program.parse(process.argv);
