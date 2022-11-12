use {
    anchor_lang::{InstructionData, ToAccountMetas, AccountDeserialize},
    chrono::{DateTime},
    clap::{crate_description, crate_name, crate_version, App, Arg, SubCommand},
    solana_clap_utils::{
        input_validators::{is_url_or_moniker, is_valid_signer, normalize_to_url_if_moniker},
        keypair::DefaultSigner,
    },
    solana_client::{rpc_client::RpcClient},
    solana_remote_wallet::remote_wallet::RemoteWalletManager,
    solana_sdk::{
        commitment_config::CommitmentConfig,
        instruction::{AccountMeta, Instruction},
        message::Message,
        program_pack::Pack,
        pubkey::Pubkey,
        signature::{Keypair, Signer},
        system_instruction,
        system_program,
        transaction::Transaction,
    },
    std::{process::exit, sync::Arc},
};

struct Config {
    commitment_config: CommitmentConfig,
    default_signer: Box<dyn Signer>,
    json_rpc_url: String,
    verbose: bool,
}

fn send(
    rpc_client: &RpcClient,
    msg: &str,
    instructions: &[Instruction],
    signers: &[&dyn Signer],
) -> Result<(), Box<dyn std::error::Error>> {
    println!("==> {}", msg);
    let mut transaction =
        Transaction::new_unsigned(Message::new(instructions, Some(&signers[0].pubkey())));

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .map_err(|err| format!("error: unable to get recent blockhash: {}", err))?;

    transaction
        .try_sign(&signers.to_vec(), recent_blockhash)
        .map_err(|err| format!("error: failed to sign transaction: {}", err))?;

    let signature = rpc_client
        .send_and_confirm_transaction_with_spinner(&transaction)
        .map_err(|err| format!("error: send transaction: {}", err))?;
    println!("Signature: {}", signature);
    Ok(())
}

struct InitializeParams {
    mint: String,
    multisig: String,
    creator: String,
}

fn process_initialize(
    rpc_client: &RpcClient,
    payer: &dyn Signer,
    _config: &Config,
    InitializeParams{
        mint,
        creator,
        multisig,
    }: &InitializeParams,
) -> Result<(), Box<dyn std::error::Error>> {
    let mint = Keypair::from_base58_string(&mint);
    let multisig = Keypair::from_base58_string(&multisig);

    let creator = Pubkey::new(
        bs58::decode(&creator).into_vec()?.as_slice()
    );

    let (hodor_key, _) = Pubkey::find_program_address(
        &[
            mint.pubkey().as_ref(),
            multisig.pubkey().as_ref(),
            creator.as_ref(),
            payer.pubkey().as_ref(), // authority
        ],
        &gimmicks::id(),
    );

    let instructions = [
        system_instruction::create_account(
            &payer.pubkey(),
            &multisig.pubkey(),
            rpc_client.get_minimum_balance_for_rent_exemption(spl_token::state::Multisig::LEN)?,
            spl_token::state::Multisig::LEN as u64,
            &spl_token::id(),
        ),
        spl_token::instruction::initialize_multisig(
            &spl_token::id(),
            &multisig.pubkey(),
            &[&payer.pubkey(), &hodor_key],
            1, // only 1 signer required
        ).unwrap(),
        system_instruction::create_account(
            &payer.pubkey(),
            &mint.pubkey(),
            rpc_client.get_minimum_balance_for_rent_exemption(spl_token::state::Mint::LEN)?,
            spl_token::state::Mint::LEN as u64,
            &spl_token::id(),
        ),
        spl_token::instruction::initialize_mint(
            &spl_token::id(),
            &mint.pubkey(),
            &multisig.pubkey(), // mint auth
            Some(&multisig.pubkey()), // freeze auth
            0,
        ).unwrap(),
        Instruction {
            accounts: gimmicks::accounts::Initialize {
                authority: payer.pubkey(),
                mint: mint.pubkey(),
                multisig: multisig.pubkey(),
                creator,
                hodor: hodor_key,
                system_program: system_program::id(),
            }.to_account_metas(None),
            data: gimmicks::instruction::Initialize {
                tokens_per_vote: 5,
            }.data(),
            program_id: gimmicks::id(),
        }
    ];

    send(
        rpc_client,
        &format!("Initializing mint {} and multisig {}", mint.pubkey(), multisig.pubkey()),
        &instructions,
        &[payer, &mint, &multisig],
    )?;

    Ok(())
}

struct UpdateHodorSettings {
    hodor: String,
    tokens_per_vote: Option<u64>,
}

fn process_update_hodor_settings(
    rpc_client: &RpcClient,
    payer: &dyn Signer,
    _config: &Config,
    UpdateHodorSettings {
        hodor,
        tokens_per_vote,
    }: &UpdateHodorSettings,
) -> Result<(), Box<dyn std::error::Error>> {
    let hodor = Pubkey::new(
        bs58::decode(&hodor).into_vec()?.as_slice()
    );

    if tokens_per_vote.is_none() {
        println!("The only setting right now is tokens per vote!");
        return Ok(());
    }

    let instructions = [
        Instruction {
            accounts: gimmicks::accounts::UpdateHodorSettings {
                authority: payer.pubkey(),
                hodor: hodor,
            }.to_account_metas(None),
            data: gimmicks::instruction::UpdateHodorSettings {
                tokens_per_vote: *tokens_per_vote,
            }.data(),
            program_id: gimmicks::id(),
        },
    ];

    send(
        rpc_client,
        &format!("Updating hodor {} settings: {:?} tokens_per_vote", hodor, tokens_per_vote),
        &instructions,
        &[payer],
    )?;

    Ok(())
}

struct AddAminParams {
    hodor: String,
    admin: String,
}

fn process_add_admin(
    rpc_client: &RpcClient,
    payer: &dyn Signer,
    _config: &Config,
    params: &AddAminParams,
) -> Result<(), Box<dyn std::error::Error>> {
    let hodor = Pubkey::new(
        bs58::decode(&params.hodor).into_vec()?.as_slice()
    );
    let admin = Pubkey::new(
        bs58::decode(&params.admin).into_vec()?.as_slice()
    );

    let admin_marker = Pubkey::find_program_address(
        &[
            hodor.as_ref(),
            admin.as_ref(),
        ],
        &gimmicks::id(),
    ).0;

    let instructions = [
        Instruction {
            accounts: gimmicks::accounts::AddAdmin {
                authority: payer.pubkey(),
                hodor,
                new_admin: admin,
                admin_marker,
                system_program: system_program::id(),
            }.to_account_metas(None),
            data: gimmicks::instruction::AddAdmin {
            }.data(),
            program_id: gimmicks::id(),
        },
    ];

    send(
        rpc_client,
        &format!(
            "Adding admin {} to {}",
            params.admin,
            params.hodor,
        ),
        &instructions,
        &[payer],
    )?;

    Ok(())
}


#[derive(serde::Serialize, serde::Deserialize)]
struct CreateVoteConfig {
    pub start: Option<String>,
    pub end: Option<String>,
    pub num_options: u64,
    pub num_voters: u64,
}

struct CreateVoteParams {
    hodor: String,
    filename: String,
    update: Option<u64>,
}

fn process_create_vote(
    rpc_client: &RpcClient,
    payer: &dyn Signer,
    _config: &Config,
    CreateVoteParams{
        hodor,
        filename,
        update,
    }: &CreateVoteParams,
) -> Result<(), Box<dyn std::error::Error>> {
    let hodor = Pubkey::new(
        bs58::decode(&hodor).into_vec()?.as_slice()
    );

    let create_vote_config: CreateVoteConfig = serde_json::from_str(
        &std::fs::read_to_string(&filename)?)?;

    let hodor_data = rpc_client.get_account_data(&hodor)?;
    let hodor_account = gimmicks::Hodor::try_deserialize(&mut hodor_data.as_slice())?;

    let mut remaining_accounts = vec![];
    if hodor_account.authority == payer.pubkey() {
        println!("OK... You are the authority on hodor");
    } else {
        let admin_marker_key = Pubkey::find_program_address(
            &[
                hodor.as_ref(),
                payer.pubkey().as_ref(),
            ],
            &gimmicks::id(),
        ).0;

        if rpc_client.get_account_data(&admin_marker_key).is_err() {
            return Err("You do not have admin access to create votes".into());
        }

        remaining_accounts.push(
            AccountMeta::new_readonly(admin_marker_key, false),
        );
        println!("OK... You have admin access");
    }

    let vote_no = if let Some(update) = update { *update } else { hodor_account.votes_held };
    let (vote_key, _) = Pubkey::find_program_address(
        &[
            hodor.as_ref(),
            vote_no.to_le_bytes().as_ref(),
        ],
        &gimmicks::id(),
    );

    let to_unix_timestamp = |t: String| -> i64 {
        DateTime::parse_from_rfc3339(&t).unwrap().timestamp()
    };

    let mut instructions = vec![];

    if update.is_none() {
        instructions.push(Instruction {
            accounts: gimmicks::accounts::CreateVote {
                vote_creator: payer.pubkey(),
                hodor: hodor,
                vote: vote_key,
                system_program: system_program::id(),
            }.to_account_metas(None).into_iter().chain(
                remaining_accounts
            ).collect(),
            data: gimmicks::instruction::CreateVote {
                num_options: create_vote_config.num_options,
                num_voters: create_vote_config.num_voters,
                start: create_vote_config.start.map(to_unix_timestamp),
                end: create_vote_config.end.map(to_unix_timestamp),
            }.data(),
            program_id: gimmicks::id(),
        });
    } else {
        instructions.push(Instruction {
            accounts: gimmicks::accounts::UpdateVoteSettings {
                vote_updater: payer.pubkey(),
                hodor: hodor,
                vote: vote_key,
            }.to_account_metas(None).into_iter().chain(
                remaining_accounts
            ).collect(),
            data: gimmicks::instruction::UpdateVoteSettings {
                settings: gimmicks::VoteSettings {
                    start: create_vote_config.start.map(to_unix_timestamp),
                    end: create_vote_config.end.map(to_unix_timestamp),
                },
            }.data(),
            program_id: gimmicks::id(),
        });
    }

    send(
        rpc_client,
        &format!(
            "{} vote {} at {}",
            if update.is_some() { "Updating" } else { "Creating" },
            vote_no,
            vote_key,
        ),
        &instructions,
        &[payer],
    )?;

    Ok(())
}


struct ShowHodorParams {
    hodor: String,
}

fn process_show_hodor(
    rpc_client: &RpcClient,
    _payer: &dyn Signer,
    _config: &Config,
    ShowHodorParams{
        hodor,
    }: &ShowHodorParams,
) -> Result<(), Box<dyn std::error::Error>> {
    let hodor = Pubkey::new(
        bs58::decode(&hodor).into_vec()?.as_slice()
    );
    let hodor_data = rpc_client.get_account_data(&hodor)?;
    let hodor_account = gimmicks::Hodor::try_deserialize(&mut hodor_data.as_slice())?;

    println!("Hodor account {}:\n{:?}", hodor, hodor_account);

    Ok(())
}

struct ShowVoteParams {
    vote: String,
}

fn process_show_vote(
    rpc_client: &RpcClient,
    _payer: &dyn Signer,
    _config: &Config,
    ShowVoteParams{
        vote,
    }: &ShowVoteParams,
) -> Result<(), Box<dyn std::error::Error>> {
    let vote = Pubkey::new(
        bs58::decode(&vote).into_vec()?.as_slice()
    );
    let vote_data = rpc_client.get_account_data(&vote)?;
    let vote_account = gimmicks::Vote::try_deserialize(&mut vote_data.as_slice())?;

    println!("Vote account {}:\n{:?}", vote, vote_account);

    Ok(())
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let matches = App::new(crate_name!())
        .about(crate_description!())
        .version(crate_version!())
        .arg({
            let arg = Arg::with_name("config_file")
                .long("config")
                .value_name("PATH")
                .takes_value(true)
                .global(true)
                .help("Configuration file to use");
            if let Some(ref config_file) = *solana_cli_config::CONFIG_FILE {
                arg.default_value(config_file)
            } else {
                arg
            }
        })
        .arg(
            Arg::with_name("keypair")
                .long("keypair")
                .value_name("KEYPAIR")
                .validator(is_valid_signer)
                .takes_value(true)
                .global(true)
                .help("Filepath or URL to a keypair [default: client keypair]"),
        )
        .arg(
            Arg::with_name("verbose")
                .long("verbose")
                .takes_value(false)
                .global(true)
                .help("Show additional information"),
        )
        .arg(
            Arg::with_name("json_rpc_url")
                .long("rpc_url")
                .value_name("URL")
                .takes_value(true)
                .global(true)
                .validator(is_url_or_moniker)
                .help("JSON RPC URL for the cluster [default: value from configuration file]"),
        )
        .subcommand(
            SubCommand::with_name("initialize")
            .about("Initialize hodor state for mint")
            .arg(
                Arg::with_name("mint")
                    .long("mint")
                    .value_name("KEYPAIR_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Keypair of mint account to create"),
            )
            .arg(
                Arg::with_name("multisig")
                    .long("multisig")
                    .value_name("KEYPAIR_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Keypair of multisig account to create"),
            )
            .arg(
                Arg::with_name("creator")
                    .long("creator")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("First creator of collection"),
            )
        )
        .subcommand(
            SubCommand::with_name("update_hodor_settings")
            .about("Update hodor settings (e.g tokens per vote)")
            .arg(
                Arg::with_name("hodor")
                    .long("hodor")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Hodor"),
            )
            .arg(
                Arg::with_name("tokens_per_vote")
                    .long("tokens_per_vote")
                    .value_name("NUMBER")
                    .takes_value(true)
                    .global(true)
                    .help("Tokens received per vote"),
            )
        )
        .subcommand(
            SubCommand::with_name("add_admin")
            .about("Add vote creation and updating admin")
            .arg(
                Arg::with_name("hodor")
                    .long("hodor")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Hodor"),
            )
            .arg(
                Arg::with_name("admin")
                    .long("admin")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Admin to add"),
            )
        )
        .subcommand(
            SubCommand::with_name("create_vote")
            .about("Initialize hodor state for mint")
            .arg(
                Arg::with_name("hodor")
                    .long("hodor")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Hodor"),
            )
            .arg(
                Arg::with_name("filename")
                    .long("filename")
                    .value_name("STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Vote config file"),
            )
            .arg(
                Arg::with_name("update")
                    .long("update")
                    .value_name("NUMBER")
                    .takes_value(true)
                    .global(true)
                    .help("Vote number to update"),
            )
        )
        .subcommand(
            SubCommand::with_name("show_hodor")
            .about("show current hodor state")
            .arg(
                Arg::with_name("hodor")
                    .long("hodor")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Hodor PDA"),
            )
        )
        .subcommand(
            SubCommand::with_name("show_vote")
            .about("show current vote state")
            .arg(
                Arg::with_name("vote")
                    .long("vote")
                    .value_name("PUBKEY_STRING")
                    .takes_value(true)
                    .global(true)
                    .help("Vote PDA"),
            )
        )
        .get_matches();

    let mut wallet_manager: Option<Arc<RemoteWalletManager>> = None;

    let config = {
        let cli_config = if let Some(config_file) = matches.value_of("config_file") {
            solana_cli_config::Config::load(config_file).unwrap_or_default()
        } else {
            solana_cli_config::Config::default()
        };

        let default_signer = DefaultSigner::new(
            "keypair",
            matches
                .value_of(&"keypair")
                .map(|s| s.to_string())
                .unwrap_or_else(|| cli_config.keypair_path.clone()),
        );

        Config {
            json_rpc_url: normalize_to_url_if_moniker(
                matches
                    .value_of("json_rpc_url")
                    .unwrap_or(&cli_config.json_rpc_url)
                    .to_string(),
            ),
            default_signer: default_signer
                .signer_from_path(&matches, &mut wallet_manager)
                .unwrap_or_else(|err| {
                    eprintln!("error: {}", err);
                    exit(1);
                }),
            verbose: matches.is_present("verbose"),
            commitment_config: CommitmentConfig::confirmed(),
        }
    };
    solana_logger::setup_with_default("solana=info");

    if config.verbose {
        println!("JSON RPC URL: {}", config.json_rpc_url);
    }
    let rpc_client =
        RpcClient::new_with_commitment(config.json_rpc_url.clone(), config.commitment_config);

    match matches.subcommand() {
        ("initialize", Some(sub_m)) => {
            process_initialize(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &InitializeParams {
                    mint: sub_m.value_of("mint").unwrap().to_string(),
                    multisig: sub_m.value_of("multisig").unwrap().to_string(),
                    creator: sub_m.value_of("creator").unwrap().to_string(),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        ("update_hodor_settings", Some(sub_m)) => {
            process_update_hodor_settings(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &UpdateHodorSettings {
                    hodor: sub_m.value_of("hodor").unwrap().to_string(),
                    tokens_per_vote: sub_m.value_of("tokens_per_vote").and_then(|s| s.parse::<u64>().ok()),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        ("add_admin", Some(sub_m)) => {
            process_add_admin(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &AddAminParams {
                    hodor: sub_m.value_of("hodor").unwrap().to_string(),
                    admin: sub_m.value_of("admin").unwrap().to_string(),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        ("create_vote", Some(sub_m)) => {
            process_create_vote(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &CreateVoteParams {
                    hodor: sub_m.value_of("hodor").unwrap().to_string(),
                    filename: sub_m.value_of("filename").unwrap().to_string(),
                    update: sub_m.value_of("update").and_then(|s| s.parse::<u64>().ok()),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        ("show_hodor", Some(sub_m)) => {
            process_show_hodor(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &ShowHodorParams {
                    hodor: sub_m.value_of("hodor").unwrap().to_string(),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        ("show_vote", Some(sub_m)) => {
            process_show_vote(
                &rpc_client,
                config.default_signer.as_ref(),
                &config,
                &ShowVoteParams {
                    vote: sub_m.value_of("vote").unwrap().to_string(),
                },
            ).unwrap_or_else(|err| {
                eprintln!("error: {}", err);
                exit(1);
            });
        }
        _ => {
        }
    }

    Ok(())
}

