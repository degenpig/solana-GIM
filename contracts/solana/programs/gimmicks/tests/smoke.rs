#![cfg(feature = "test-bpf")]

use anchor_lang::{InstructionData, ToAccountMetas};
use mpl_token_metadata::{
    state::Creator,
    pda::{
        find_metadata_account,
        find_master_edition_account,
    },
};
use solana_program_test::*;
use solana_sdk::{
    instruction::{AccountMeta, Instruction, InstructionError},
    native_token::LAMPORTS_PER_SOL,
    program_pack::Pack,
    pubkey::Pubkey,
    signer::{Signer, keypair::Keypair},
    system_instruction,
    system_program,
    transaction::{Transaction, TransactionError},
    transport::TransportError,
};
use spl_associated_token_account::{
    create_associated_token_account,
    get_associated_token_address,
};

async fn nft_setup_transaction(
    payer: &dyn Signer,
    dest: Pubkey,
    mint: &dyn Signer,
    recent_blockhash: &solana_sdk::hash::Hash,
    rent: &solana_sdk::sysvar::rent::Rent,
    creators: &Option<Vec<Creator>>,
) -> Result<Transaction, Box<dyn std::error::Error>> {
    let (metadata_key, _metadata_bump) = find_metadata_account(&mint.pubkey());

    let (edition_key, _edition_bump) = find_master_edition_account(&mint.pubkey());

    let payer_pubkey = payer.pubkey();
    let instructions = [
        system_instruction::create_account(
            &payer.pubkey(),
            &mint.pubkey(),
            rent.minimum_balance(spl_token::state::Mint::LEN),
            spl_token::state::Mint::LEN as u64,
            &spl_token::id(),
        ),
        spl_token::instruction::initialize_mint(
            &spl_token::id(),
            &mint.pubkey(),
            &payer.pubkey(), // mint auth
            Some(&payer_pubkey), // freeze auth
            0,
        )?,
        create_associated_token_account(
            &payer.pubkey(), // funding
            &dest, // wallet to create for
            &mint.pubkey(),
        ),
        spl_token::instruction::mint_to(
            &spl_token::id(),
            &mint.pubkey(),
            &get_associated_token_address(
                &dest,
                &mint.pubkey(),
            ),
            &payer.pubkey(),
            &[],
            1
        )?,
        mpl_token_metadata::instruction::create_metadata_accounts(
            mpl_token_metadata::id(),
            metadata_key,
            mint.pubkey(),
            payer.pubkey(), // mint auth
            payer.pubkey(), // payer
            payer.pubkey(), // update auth
            "test #11".to_string(), // name
            "".to_string(), // symbol
            "".to_string(), // uri
            creators.clone(),
            0, // seller_fee_basis_points
            true, // update_auth_is_signer
            true, // is_mutable
        ),
        mpl_token_metadata::instruction::create_master_edition(
            mpl_token_metadata::id(),
            edition_key,
            mint.pubkey(),
            payer.pubkey(), // update auth
            payer.pubkey(), // mint auth
            metadata_key,
            payer.pubkey(), // payer
            None, // limited edition supply
        ),
    ];

    Ok(Transaction::new_signed_with_payer(
        &instructions,
        Some(&payer.pubkey()),
        &[payer, mint],
        *recent_blockhash,
    ))
}

fn create_mint(
    payer: &Pubkey,
    mint: &Pubkey,
    multisig: &Pubkey,
    freeze_signers: &[&Pubkey],
    rent: &solana_sdk::sysvar::rent::Rent,
) -> Result<[Instruction; 4], Box<dyn std::error::Error>> {
    Ok([
        system_instruction::create_account(
            payer,
            multisig,
            rent.minimum_balance(spl_token::state::Multisig::LEN),
            spl_token::state::Multisig::LEN as u64,
            &spl_token::id(),
        ),
        spl_token::instruction::initialize_multisig(
            &spl_token::id(),
            multisig,
            freeze_signers,
            1, // only 1 signer required
        ).unwrap(),
        system_instruction::create_account(
            payer,
            mint,
            rent.minimum_balance(spl_token::state::Mint::LEN),
            spl_token::state::Mint::LEN as u64,
            &spl_token::id(),
        ),
        spl_token::instruction::initialize_mint(
            &spl_token::id(),
            mint,
            multisig, // mint auth
            Some(multisig), // freeze auth
            0,
        ).unwrap(),
    ])
}

fn mint_and_freeze(
    payer: &Pubkey,
    dest: &Pubkey,
    mint: &Pubkey,
    multisig: &Pubkey,
    amount: u64,
) -> Result<[Instruction; 3], Box<dyn std::error::Error>> {
    Ok([
        create_associated_token_account(payer, dest, mint),
        spl_token::instruction::mint_to(
            &spl_token::id(),
            mint,
            &get_associated_token_address(dest, mint),
            multisig,
            &[payer],
            amount,
        ).unwrap(),
        spl_token::instruction::freeze_account(
            &spl_token::id(),
            &get_associated_token_address(dest, mint),
            mint,
            multisig,
            &[payer],
        ).unwrap(),
    ])
}

fn gimmicks_transfer(
    src: &Pubkey,
    dst: &Pubkey,
    mint: &Pubkey,
    multisig: &Pubkey,
    hodor: &Pubkey,
    src_mint: &Pubkey,
    dst_mint: &Pubkey,
    amount: u64,
) -> Instruction {
    Instruction {
        accounts: gimmicks::accounts::Transfer {
            mint: *mint,
            multisig: *multisig,
            hodor: *hodor,
            sender: *src,

            // this ordering isn't confusing at all
            src_account: get_associated_token_address(src, mint),
            src_nft_account: get_associated_token_address(src, src_mint),
            src_metadata: find_metadata_account(src_mint).0,

            dst_account: get_associated_token_address(dst, mint),
            dst_nft_account: get_associated_token_address(dst, dst_mint),
            dst_metadata: find_metadata_account(dst_mint).0,
            token_program: spl_token::id(),
        }.to_account_metas(None),
        data: gimmicks::instruction::Transfer { amount }.data(),
        program_id: gimmicks::id(),
    }
}

#[tokio::test]
async fn test_transfers() {
    let mut pc = ProgramTest::default();

    pc.add_program("gimmicks", gimmicks::id(), None);
    pc.add_program("mpl_token_metadata", mpl_token_metadata::id(), None);

    let (mut banks_client, payer, recent_blockhash) = pc.start().await;

    let rent = banks_client.get_rent().await.unwrap();

    let mint = Keypair::new();
    let multisig = Keypair::new();

    let (hodor_key, _) = Pubkey::find_program_address(
        &[
            mint.pubkey().as_ref(),
            multisig.pubkey().as_ref(),
            payer.pubkey().as_ref(), // creator
            payer.pubkey().as_ref(), // authority
        ],
        &gimmicks::id(),
    );

    // initialize the FT and create accounts
    let alice = Keypair::new();
    println!("alice {}", alice.pubkey());
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            create_mint(
                &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(),
                &[&payer.pubkey(), &hodor_key], &rent
            ).unwrap().to_vec().into_iter().chain(
                mint_and_freeze(
                    &payer.pubkey(), &alice.pubkey(), &mint.pubkey(), &multisig.pubkey(), 10).unwrap()
            ).chain(
                mint_and_freeze(
                    &payer.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), 0).unwrap()
            ).chain(
                [system_instruction::transfer(
                    &payer.pubkey(),
                    &alice.pubkey(),
                    LAMPORTS_PER_SOL,
                )]
            ).collect::<Vec<_>>().as_slice(),
            Some(&payer.pubkey()),
            &[&payer, &mint, &multisig],
            recent_blockhash,
        )
    ).await.unwrap();

    // initialize hodor
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::Initialize {
                        authority: payer.pubkey(),
                        mint: mint.pubkey(),
                        multisig: multisig.pubkey(),
                        creator: payer.pubkey(),
                        hodor: hodor_key,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::Initialize {
                        tokens_per_vote: 5,
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            recent_blockhash,
        )
    ).await.unwrap();

    // initialize NFTs
    let src_mint = Keypair::new();
    let dst_mint = Keypair::new();

    let creators = Some(vec![Creator {
        address: payer.pubkey(),
        verified: true,
        share: 100,
    }]);

    let src_setup = nft_setup_transaction(
        &payer, payer.pubkey(), &src_mint, &recent_blockhash, &rent, &creators,
    ).await.unwrap();

    let dst_setup = nft_setup_transaction(
        &payer, alice.pubkey(), &dst_mint, &recent_blockhash, &rent, &creators,
    ).await.unwrap();

    banks_client.process_transaction(src_setup).await.unwrap();
    banks_client.process_transaction(dst_setup).await.unwrap();

    // transfer
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[gimmicks_transfer(
                &alice.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), &hodor_key,
                // this ordering isn't confusing at all
                &dst_mint.pubkey(), &src_mint.pubkey(), 1)
            ],
            Some(&alice.pubkey()),
            &[&alice],
            recent_blockhash,
        )
    ).await.unwrap();

    // attempt using someone elses NFT
    assert!(matches!(banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[Instruction {
                accounts: gimmicks::accounts::Transfer {
                    mint: mint.pubkey(),
                    multisig: multisig.pubkey(),
                    hodor: hodor_key.clone(),
                    sender: alice.pubkey(),

                    src_account: get_associated_token_address(&alice.pubkey(), &mint.pubkey()),
                    src_nft_account: get_associated_token_address(&payer.pubkey(), &src_mint.pubkey()),
                    src_metadata: find_metadata_account(&src_mint.pubkey()).0,

                    dst_account: get_associated_token_address(&payer.pubkey(), &mint.pubkey()),
                    dst_nft_account: get_associated_token_address(&alice.pubkey(), &dst_mint.pubkey()),
                    dst_metadata: find_metadata_account(&dst_mint.pubkey()).0,
                    token_program: spl_token::id(),
                }.to_account_metas(None),
                data: gimmicks::instruction::Transfer { amount: 1 }.data(),
                program_id: gimmicks::id(),
            }],
            Some(&alice.pubkey()),
            &[&alice],
            recent_blockhash,
        )
    ).await, Err(TransportError::TransactionError(TransactionError::InstructionError(
                _, InstructionError::Custom(x)))) if x == u32::from(gimmicks::ErrorCode::InvalidNftAccount)));


    // NFT that isn't part of the collection
    let oth_mint = Keypair::new();

    let oth_creators = Some(vec![Creator {
        address: alice.pubkey(),
        verified: true,
        share: 100,
    }]);

    let oth_setup = nft_setup_transaction(
        &alice, alice.pubkey(), &oth_mint, &recent_blockhash, &rent, &oth_creators,
    ).await.unwrap();

    banks_client.process_transaction(oth_setup).await.unwrap();

    assert!(matches!(banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[gimmicks_transfer(
                &alice.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), &hodor_key,
                &oth_mint.pubkey(), &src_mint.pubkey(), 1)
            ],
            Some(&alice.pubkey()),
            &[&alice],
            recent_blockhash,
        )
    ).await, Err(TransportError::TransactionError(TransactionError::InstructionError(
                _, InstructionError::Custom(x)))) if x == u32::from(gimmicks::ErrorCode::InvalidMetadataCreator)));
}

#[tokio::test]
async fn test_votes() {
    let mut pc = ProgramTest::default();

    pc.add_program("gimmicks", gimmicks::id(), None);
    pc.add_program("mpl_token_metadata", mpl_token_metadata::id(), None);

    let mut ptc = pc.start_with_context().await;
    let payer = Keypair::from_bytes(&ptc.payer.to_bytes()).unwrap();

    let rent = ptc.banks_client.get_rent().await.unwrap();

    let mint = Keypair::new();
    let multisig = Keypair::new();

    let (hodor_key, _) = Pubkey::find_program_address(
        &[
            mint.pubkey().as_ref(),
            multisig.pubkey().as_ref(),
            payer.pubkey().as_ref(), // creator
            payer.pubkey().as_ref(), // authority
        ],
        &gimmicks::id(),
    );

    println!("payer {}", payer.pubkey());
    println!("mint {}", mint.pubkey());
    println!("multisig {}", multisig.pubkey());
    println!("hodor {}", hodor_key);

    // initialize the FT and create accounts
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            create_mint(
                &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(),
                &[&payer.pubkey(), &hodor_key], &rent
            ).unwrap().to_vec().into_iter().chain(
                mint_and_freeze(
                    &payer.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), 0).unwrap()
            ).collect::<Vec<_>>().as_slice(),
            Some(&payer.pubkey()),
            &[&payer, &mint, &multisig],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    // initialize hodor
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::Initialize {
                        authority: payer.pubkey(),
                        mint: mint.pubkey(),
                        multisig: multisig.pubkey(),
                        creator: payer.pubkey(),
                        hodor: hodor_key,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::Initialize {
                        tokens_per_vote: 5,
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    // initialize NFTs
    let voter_mint = Keypair::new();

    let creators = Some(vec![Creator {
        address: payer.pubkey(),
        verified: true,
        share: 100,
    }]);

    let voter_setup = nft_setup_transaction(
        &payer, payer.pubkey(), &voter_mint, &ptc.last_blockhash, &rent, &creators,
    ).await.unwrap();

    ptc.banks_client.process_transaction(voter_setup).await.unwrap();

    let (vote_key, _) = Pubkey::find_program_address(
        &[
            hodor_key.as_ref(),
            0u64.to_le_bytes().as_ref(),
        ],
        &gimmicks::id(),
    );

    // create vote
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::CreateVote {
                        vote_creator: payer.pubkey(),
                        hodor: hodor_key,
                        vote: vote_key,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::CreateVote {
                        num_options: 1,
                        num_voters: 10000,
                        start: None,
                        end: None,
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    let cast_vote_ix = Instruction {
        accounts: gimmicks::accounts::CastVote {
            mint: mint.pubkey(),
            multisig: multisig.pubkey(),
            hodor: hodor_key.clone(),
            vote: vote_key,
            voter: payer.pubkey(),

            voter_account: get_associated_token_address(&payer.pubkey(), &mint.pubkey()),
            voter_nft_account: get_associated_token_address(&payer.pubkey(), &voter_mint.pubkey()),
            voter_metadata: find_metadata_account(&voter_mint.pubkey()).0,
            token_program: spl_token::id(),
        }.to_account_metas(None),
        data: gimmicks::instruction::CastVote {
            option: 0,
        }.data(),
        program_id: gimmicks::id(),
    };

    // vote OK
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[cast_vote_ix.clone()],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    let root_slot = ptc.banks_client.get_root_slot().await.unwrap();
    ptc.warp_to_slot(root_slot + 2).unwrap();

    // already voted
    assert!(matches!(ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[cast_vote_ix.clone()],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await, Err(TransportError::TransactionError(TransactionError::InstructionError(
                _, InstructionError::Custom(x)))) if x == u32::from(gimmicks::ErrorCode::AlreadyVoted)));
}

#[tokio::test]
async fn test_hodor_update() {
    let mut pc = ProgramTest::default();

    pc.add_program("gimmicks", gimmicks::id(), None);
    pc.add_program("mpl_token_metadata", mpl_token_metadata::id(), None);

    let (mut banks_client, payer, recent_blockhash) = pc.start().await;

    let rent = banks_client.get_rent().await.unwrap();

    let mint = Keypair::new();
    let multisig = Keypair::new();

    let (hodor_key, _) = Pubkey::find_program_address(
        &[
            mint.pubkey().as_ref(),
            multisig.pubkey().as_ref(),
            payer.pubkey().as_ref(), // creator
            payer.pubkey().as_ref(), // authority
        ],
        &gimmicks::id(),
    );

    // initialize the FT and create accounts
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            create_mint(
                &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(),
                &[&payer.pubkey(), &hodor_key], &rent
            ).unwrap().to_vec().into_iter().chain(
                mint_and_freeze(
                    &payer.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), 0).unwrap()
            ).collect::<Vec<_>>().as_slice(),
            Some(&payer.pubkey()),
            &[&payer, &mint, &multisig],
            recent_blockhash,
        )
    ).await.unwrap();

    // initialize hodor
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::Initialize {
                        authority: payer.pubkey(),
                        mint: mint.pubkey(),
                        multisig: multisig.pubkey(),
                        creator: payer.pubkey(),
                        hodor: hodor_key,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::Initialize {
                        tokens_per_vote: 5,
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            recent_blockhash,
        )
    ).await.unwrap();

    // update hodor
    banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::UpdateHodorSettings {
                        authority: payer.pubkey(),
                        hodor: hodor_key,
                    }.to_account_metas(None),
                    data: gimmicks::instruction::UpdateHodorSettings {
                        tokens_per_vote: Some(1),
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            recent_blockhash,
        )
    ).await.unwrap();
}

#[tokio::test]
async fn test_hodor_admin() {
    let mut pc = ProgramTest::default();

    pc.add_program("gimmicks", gimmicks::id(), None);
    pc.add_program("mpl_token_metadata", mpl_token_metadata::id(), None);

    let mut ptc = pc.start_with_context().await;
    let payer = Keypair::from_bytes(&ptc.payer.to_bytes()).unwrap();

    let rent = ptc.banks_client.get_rent().await.unwrap();

    let mint = Keypair::new();
    let multisig = Keypair::new();

    let (hodor_key, _) = Pubkey::find_program_address(
        &[
            mint.pubkey().as_ref(),
            multisig.pubkey().as_ref(),
            payer.pubkey().as_ref(), // creator
            payer.pubkey().as_ref(), // authority
        ],
        &gimmicks::id(),
    );

    // initialize the FT and create accounts
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            create_mint(
                &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(),
                &[&payer.pubkey(), &hodor_key], &rent
            ).unwrap().to_vec().into_iter().chain(
                mint_and_freeze(
                    &payer.pubkey(), &payer.pubkey(), &mint.pubkey(), &multisig.pubkey(), 0).unwrap()
            ).collect::<Vec<_>>().as_slice(),
            Some(&payer.pubkey()),
            &[&payer, &mint, &multisig],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    // initialize hodor
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::Initialize {
                        authority: payer.pubkey(),
                        mint: mint.pubkey(),
                        multisig: multisig.pubkey(),
                        creator: payer.pubkey(),
                        hodor: hodor_key,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::Initialize {
                        tokens_per_vote: 5,
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    let alice = Keypair::new();
    let admin_marker = Pubkey::find_program_address(
        &[
            hodor_key.as_ref(),
            alice.pubkey().as_ref(),
        ],
        &gimmicks::id(),
    ).0;

    let (vote_key, _) = Pubkey::find_program_address(
        &[
            hodor_key.as_ref(),
            0u64.to_le_bytes().as_ref(),
        ],
        &gimmicks::id(),
    );

    let create_vote_ix = Instruction {
        accounts: gimmicks::accounts::CreateVote {
            vote_creator: alice.pubkey(),
            hodor: hodor_key,
            vote: vote_key,
            system_program: system_program::id(),
        }.to_account_metas(None).into_iter().chain(
            vec![AccountMeta::new_readonly(admin_marker, false)],
        ).collect(),
        data: gimmicks::instruction::CreateVote {
            num_options: 1,
            num_voters: 10000,
            start: None,
            end: None,
        }.data(),
        program_id: gimmicks::id(),
    };

    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                system_instruction::transfer(
                    &payer.pubkey(),
                    &alice.pubkey(),
                    LAMPORTS_PER_SOL,
                ),
            ],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    // not allowed yet
    assert!(ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[create_vote_ix.clone()],
            Some(&alice.pubkey()),
            &[&alice],
            ptc.last_blockhash,
        )
    ).await.is_err());

    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[
                Instruction {
                    accounts: gimmicks::accounts::AddAdmin {
                        authority: payer.pubkey(),
                        hodor: hodor_key,
                        new_admin: alice.pubkey(),
                        admin_marker,
                        system_program: system_program::id(),
                    }.to_account_metas(None),
                    data: gimmicks::instruction::AddAdmin {
                    }.data(),
                    program_id: gimmicks::id(),
                },
            ],
            Some(&payer.pubkey()),
            &[&payer],
            ptc.last_blockhash,
        )
    ).await.unwrap();

    let root_slot = ptc.banks_client.get_root_slot().await.unwrap();
    ptc.warp_to_slot(root_slot + 2).unwrap();

    // create vote
    ptc.banks_client.process_transaction(
        Transaction::new_signed_with_payer(
            &[create_vote_ix.clone()],
            Some(&alice.pubkey()),
            &[&alice],
            ptc.last_blockhash,
        )
    ).await.unwrap();
}
