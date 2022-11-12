use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_program::{
    entrypoint::ProgramResult,
    instruction::Instruction,
    program::invoke_signed,
};
use spl_token::instruction::{thaw_account, freeze_account, mint_to};
use mpl_token_metadata::state::{Creator, Metadata};

#[cfg(not(target_arch = "bpf"))]
use chrono::{DateTime, Utc, naive::NaiveDateTime};

declare_id!("GLZpzMXW2rkh8ACpPWE2oUsDqwDFJg1DFDWeUrWkf1m6");

#[program]
pub mod gimmicks {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        tokens_per_vote: u64,
    ) -> Result<()> {
        let hodor = &mut ctx.accounts.hodor;
        let multisig = &ctx.accounts.multisig;

        require_owned_by(multisig, &spl_token::id())?;

        {
        use solana_program::program_pack::Pack;
        let multisig = spl_token::state::Multisig::unpack(
            &multisig.try_borrow_data()?)?;
        let found_hodor = multisig.signers.iter().any(|s| *s == hodor.key());
        require!(found_hodor, ErrorCode::InvalidMultisig);
        }

        hodor.mint = ctx.accounts.mint.key();
        hodor.multisig = multisig.key();
        hodor.creator = ctx.accounts.creator.key();
        hodor.authority = ctx.accounts.authority.key();
        hodor.tokens_per_vote = tokens_per_vote;
        hodor.votes_held = 0;
        hodor.bump = Pubkey::find_program_address(&hodor.seeds()[..4], &id()).1;

        Ok(())
    }

    pub fn update_hodor_settings(
        ctx: Context<UpdateHodorSettings>,
        tokens_per_vote: Option<u64>,
    ) -> Result<()> {
        let hodor = &mut ctx.accounts.hodor;

        if let Some(tokens_per_vote) = tokens_per_vote {
            hodor.tokens_per_vote = tokens_per_vote;
        }

        Ok(())
    }

    pub fn add_admin(
        ctx: Context<AddAdmin>,
    ) -> Result<()> {
        let admin_marker = &mut ctx.accounts.admin_marker;

        admin_marker.hodor = ctx.accounts.hodor.key();
        admin_marker.admin = ctx.accounts.new_admin.key();

        Ok(())
    }

    pub fn create_vote<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateVote<'info>>,
        num_options: u64,
        num_voters: u64,
        start: Option<i64>,
        end: Option<i64>,
    ) -> Result<()> {
        let hodor = &mut ctx.accounts.hodor;
        let vote = &mut ctx.accounts.vote;

        require_admin_ok(
            &ctx.accounts.vote_creator,
            &hodor,
            ctx.remaining_accounts,
        )?;

        vote.hodor = hodor.key();
        vote.vote_no = hodor.votes_held;
        vote.settings = VoteSettings {
            start,
            end,
        };
        vote.votes = vec![0; num_options as usize];
        vote.voted = vec![0; (num_voters as usize + 7) / 8];
        vote.bump = Pubkey::find_program_address(&vote.seeds()[..2], &id()).1;

        hodor.votes_held += 1;

        Ok(())
    }

    pub fn update_vote_settings<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateVoteSettings<'info>>,
        settings: VoteSettings,
    ) -> Result<()> {
        let vote = &mut ctx.accounts.vote;

        require_admin_ok(
            &ctx.accounts.vote_updater,
            &ctx.accounts.hodor,
            ctx.remaining_accounts,
        )?;

        vote.settings = settings;

        Ok(())
    }

    pub fn cast_vote(
        mut ctx: Context<CastVote>,
        option: u64,
    ) -> Result<()> {
        let CastVote {
            mint,
            multisig,
            hodor,
            vote,
            voter,
            voter_account,
            voter_nft_account,
            voter_metadata,
            token_program,
        } = &mut ctx.accounts;

        let current_timestamp = Clock::get()?.unix_timestamp;
        if let Some(start) = vote.settings.start {
            if current_timestamp < start {
                return Err(ErrorCode::OutsideVoteTime.into());
            }
        }
        if let Some(end) = vote.settings.end {
            if current_timestamp > end {
                return Err(ErrorCode::OutsideVoteTime.into());
            }
        }

        require!(voter.key() == voter_nft_account.owner, ErrorCode::InvalidNftAccount);

        let voter = Bran::new(mint, multisig, hodor, voter_account, voter_nft_account, voter_metadata, token_program)?;

        {
            use bitvec::prelude::*;

            let voted = vote.voted.view_bits_mut::<Lsb0>();

            let voter_index = voter.index()?.checked_sub(1)
                .ok_or(ErrorCode::ArithmeticOverflow)? as usize;

            if voted[voter_index] {
                return Err(ErrorCode::AlreadyVoted.into());
            }

            voted.set(voter_index, true);
        }

        let start_vote = vote.votes[option as usize];
        vote.votes[option as usize] = start_vote.checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        if voter_account.is_frozen() {
            voter.open(voter_account.to_account_info())?;
        }

        invoke_signed(
            &mint_to(
                &token_program.key(),
                &mint.key(),
                &voter_account.key(),
                &multisig.key(),
                &[&hodor.key()],
                hodor.tokens_per_vote,
            )?,
            &[
                token_program.to_account_info(),
                voter_account.to_account_info(),
                mint.to_account_info(),
                multisig.to_account_info(),
                hodor.to_account_info(),
            ],
            &[&hodor.seeds()],
        )?;

        voter.close(voter_account.to_account_info())?;

        Ok(())
    }

    pub fn transfer<'info>(
        ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
        amount: u64,
    ) -> Result<()> {
        let Transfer {
            mint,
            multisig,
            hodor,
            sender,
            src_account,
            src_nft_account,
            src_metadata,
            dst_account,
            dst_nft_account,
            dst_metadata,
            token_program,
        } = &ctx.accounts;

        require!(sender.key() == src_nft_account.owner, ErrorCode::InvalidNftAccount);

        let src = Bran::new(mint, multisig, hodor, src_account, src_nft_account, src_metadata, token_program)?;
        let dst = Bran::new(mint, multisig, hodor, dst_account, dst_nft_account, dst_metadata, token_program)?;
        if src_account.is_frozen() {
            src.open(src_account.to_account_info())?;
        }
        if dst_account.is_frozen() {
            dst.open(dst_account.to_account_info())?;
        }

        token::transfer(
            CpiContext::new(
                token_program.to_account_info(),
                token::Transfer {
                    from: src_account.to_account_info(),
                    to: dst_account.to_account_info(),
                    authority: sender.to_account_info(),
                },
            ),
            amount,
        )?;

        src.close(src_account.to_account_info())?;
        dst.close(dst_account.to_account_info())?;

        Ok(())
    }
}

pub struct Bran<'a, 'info> {
    pub mint: &'a Account<'info, Mint>,

    pub multisig: &'a UncheckedAccount<'info>,

    pub hodor: &'a Account<'info, Hodor>,

    pub account: &'a Box<Account<'info, TokenAccount>>,

    pub nft_account: &'a Box<Account<'info, TokenAccount>>,

    pub metadata: &'a UncheckedAccount<'info>,

    pub token_program: &'a Program<'info, Token>,
}

impl<'a, 'info> Bran<'a, 'info> {
    pub fn new(
        mint: &'a Account<'info, Mint>,
        multisig: &'a UncheckedAccount<'info>,
        hodor: &'a Account<'info, Hodor>,
        account: &'a Box<Account<'info, TokenAccount>>,
        nft_account: &'a Box<Account<'info, TokenAccount>>,
        metadata_info: &'a UncheckedAccount<'info>,
        token_program: &'a Program<'info, Token>,
    ) -> Result<Bran<'a, 'info>> {
        require_owned_by(metadata_info, &mpl_token_metadata::id())?;

        let metadata = Metadata::from_account_info(metadata_info)?;

        // check that the token matches the auth mint
        require!(account.mint == mint.key(), ErrorCode::InvalidMint);

        // check that the nft metadata matches what we claimed
        require!(metadata.mint == nft_account.mint, ErrorCode::InvalidMetadataMint);

        // check that we have at least 1 nft
        require!(nft_account.amount > 0, ErrorCode::InvalidNftAccount);

        // check that the nft owners match the token owners
        require!(nft_account.owner == account.owner, ErrorCode::InvalidNftAccount);

        // check that the nfts are part of our collection (by creator)
        require!(creator_matches(&hodor, &metadata.data.creators), ErrorCode::InvalidMetadataCreator);

        Ok(Bran {
            mint,
            multisig,
            hodor,
            account,
            nft_account,
            metadata: metadata_info,
            token_program,
        })
    }

    fn index(&self) -> Result<u64> {
        let metadata = Metadata::from_account_info(self.metadata)?;

        let name = &metadata.data.name;
        let num_idx = name.find(
            |c: char| c.is_ascii_digit()).ok_or(ErrorCode::InvalidMetadataName)?;

        let name = &name[num_idx..];

        // TODO: could overflow but lol
        let end_idx = name.find(
            |c: char| !c.is_ascii_digit()).ok_or(ErrorCode::InvalidMetadataName)?;

        let idx = name[..end_idx].parse::<u64>()
            .map_err(|_| ErrorCode::InvalidMetadataName)?;

        msg!("Parsed index {} from name {}", idx, name);

        Ok(idx)
    }

    fn multisig_operation(
        &self,
        operation: fn (&Pubkey, &Pubkey, &Pubkey, &Pubkey, &[&Pubkey])
                    -> std::result::Result<Instruction, ProgramError>,
        account_info: AccountInfo<'info>,
    ) -> ProgramResult {
        invoke_signed(
            &operation(
                &self.token_program.key(),
                &account_info.key(),
                &self.mint.key(),
                &self.multisig.key(),
                &[&self.hodor.key()],
            )?,
            &[
                self.token_program.to_account_info(),
                account_info.clone(),
                self.mint.to_account_info(),
                self.multisig.to_account_info(),
                self.hodor.to_account_info(),
            ],
            &[&self.hodor.seeds()],
        )
    }

    fn open(&self, account_info: AccountInfo<'info>) -> ProgramResult {
        self.multisig_operation(thaw_account, account_info)
    }

    fn close(&self, account_info: AccountInfo<'info>) -> ProgramResult {
        self.multisig_operation(freeze_account, account_info)
    }
}

fn creator_matches<'info>(
    hodor: &Account<'info, Hodor>,
    creators: &Option<Vec<Creator>>,
) -> bool {
    if let Some(creators) = creators {
        creators.iter().any(|c| c.address == hodor.creator && c.verified)
    } else {
        false
    }
}

fn require_admin_ok<'info>(
    signer: &Signer<'info>,
    hodor: &Account<'info, Hodor>,
    remaining_accounts: &[AccountInfo<'info>],
) -> Result<()> {
    if signer.key() == hodor.authority {
        // OK
    } else {
        let account_info_iter = &mut remaining_accounts.iter();
        let admin_marker_info = next_account_info(account_info_iter)?;

        let admin_marker = Account::<'info, AdminMarker>::try_from(admin_marker_info)?;

        require!(
            admin_marker.hodor == hodor.key(),
            ErrorCode::InvalidAdminMarker,
        );
        require!(
            admin_marker.admin == signer.key(),
            ErrorCode::InvalidAdminMarker,
        );
    }

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub mint: Account<'info, Mint>,

    pub multisig: UncheckedAccount<'info>,

    pub creator: UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [
            mint.key().as_ref(),
            multisig.key().as_ref(),
            creator.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority
    )]
    pub hodor: Account<'info, Hodor>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateHodorSettings<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
        has_one = authority,
    )]
    pub hodor: Account<'info, Hodor>,
}

#[derive(Accounts)]
pub struct AddAdmin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
        has_one = authority,
    )]
    pub hodor: Account<'info, Hodor>,

    pub new_admin: UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [
            hodor.key().as_ref(),
            new_admin.key().as_ref(),
        ],
        bump,
        payer = authority
    )]
    pub admin_marker: Account<'info, AdminMarker>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    pub mint: Account<'info, Mint>,

    pub multisig: UncheckedAccount<'info>,

    #[account(
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
        has_one = mint,
        has_one = multisig,
    )]
    pub hodor: Account<'info, Hodor>,

    pub sender: Signer<'info>,

    #[account(mut)]
    pub src_account: Box<Account<'info, TokenAccount>>,

    pub src_nft_account: Box<Account<'info, TokenAccount>>,

    pub src_metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub dst_account: Box<Account<'info, TokenAccount>>,

    pub dst_nft_account: Box<Account<'info, TokenAccount>>,

    pub dst_metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(num_options: u64, num_voters: u64)]
pub struct CreateVote<'info> {
    #[account(mut)]
    pub vote_creator: Signer<'info>,

    #[account(
        mut,
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
    )]
    pub hodor: Account<'info, Hodor>,

    #[account(
        init,
        seeds = [
            hodor.key().as_ref(),
            hodor.votes_held.to_le_bytes().as_ref(),
        ],
        bump,
        payer = vote_creator,
        space = 8
            + 32
            + 8
            + 1
            + 9 * 2
            + 4 + 8 * num_options as usize
            + 4 + 1 * ((num_voters as usize + 7) / 8)
            ,
    )]
    pub vote: Account<'info, Vote>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVoteSettings<'info> {
    pub vote_updater: Signer<'info>,

    #[account(
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
    )]
    pub hodor: Account<'info, Hodor>,

    #[account(
        mut,
        seeds = [
            vote.hodor.as_ref(),
            vote.vote_no.to_le_bytes().as_ref(),
        ],
        bump = vote.bump,
        has_one = hodor,
    )]
    pub vote: Account<'info, Vote>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub multisig: UncheckedAccount<'info>,

    #[account(
        seeds = [
            hodor.mint.as_ref(),
            hodor.multisig.as_ref(),
            hodor.creator.as_ref(),
            hodor.authority.as_ref(),
        ],
        bump = hodor.bump,
        has_one = mint,
        has_one = multisig,
    )]
    pub hodor: Account<'info, Hodor>,

    #[account(
        mut,
        seeds = [
            vote.hodor.as_ref(),
            vote.vote_no.to_le_bytes().as_ref(),
        ],
        bump = vote.bump,
        has_one = hodor,
    )]
    pub vote: Account<'info, Vote>,

    pub voter: Signer<'info>,

    #[account(mut)]
    pub voter_account: Box<Account<'info, TokenAccount>>,

    pub voter_nft_account: Box<Account<'info, TokenAccount>>,

    pub voter_metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(Default, Debug)]
pub struct Hodor {
    pub mint: Pubkey,
    pub multisig: Pubkey,

    pub creator: Pubkey,
    pub authority: Pubkey,

    pub tokens_per_vote: u64,
    pub votes_held: u64,

    pub bump: u8,
}

#[account]
#[derive(Default, Debug)]
pub struct AdminMarker {
    pub hodor: Pubkey,

    pub admin: Pubkey,

    pub padding: [u8; 32],
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default)]
pub struct VoteSettings {
    pub start: Option<i64>,
    pub end: Option<i64>,
}

impl std::fmt::Debug for VoteSettings {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // TODO: this is kind of jank. can we just cfg derive?
        #[cfg(not(target_arch = "bpf"))]
        let to_utc = |ts| -> String {
            DateTime::<Utc>::from_utc(
                NaiveDateTime::from_timestamp(ts, 0), Utc)
                .format("%Y-%m-%d %H:%M:%SZ")
                .to_string()
        };

        #[cfg(target_arch = "bpf")]
        let to_utc = |ts: i64| -> String {
            ts.to_string()
        };

        f.debug_struct("VoteSettings")
         .field("start", &self.start.map(to_utc))
         .field("end", &self.end.map(to_utc))
         .finish()
    }
}

#[account]
#[derive(Default, Debug)]
pub struct Vote {
    pub hodor: Pubkey,
    pub vote_no: u64,

    pub bump: u8,

    pub settings: VoteSettings,

    pub votes: Vec<u64>,
    pub voted: Vec<u8>,
}

impl Hodor {
    pub fn seeds(&self) -> [&[u8]; 5] {
        [
            self.mint.as_ref(),
            self.multisig.as_ref(),
            self.creator.as_ref(),
            self.authority.as_ref(),
            std::slice::from_ref(&self.bump),
        ]
    }
}

impl Vote {
    pub fn seeds(&self) -> [&[u8]; 3] {
        [
            self.hodor.as_ref(),
            bytemuck::cast_slice::<u64, u8>(
                std::slice::from_ref(&self.vote_no)
            ),
            std::slice::from_ref(&self.bump),
        ]
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid Multisig")]
    InvalidMultisig,
    #[msg("Invalid Mint")]
    InvalidMint,
    #[msg("Invalid Metadata Creator")]
    InvalidMetadataCreator,
    #[msg("Invalid Metadata Mint")]
    InvalidMetadataMint,
    #[msg("Invalid Metadata Name")]
    InvalidMetadataName,
    #[msg("Invalid Nft Account")]
    InvalidNftAccount,
    #[msg("Invalid Owner")]
    InvalidOwner,
    #[msg("Arithmetic Overflow")]
    ArithmeticOverflow,
    #[msg("Already Voted")]
    AlreadyVoted,
    #[msg("Outside Vote Time")]
    OutsideVoteTime,
    #[msg("Invalid Admin Marker for creating votes")]
    InvalidAdminMarker,
}

pub fn require_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
    if account.owner != owner {
        Err(ErrorCode::InvalidOwner.into())
    } else {
        Ok(())
    }
}
