require('dotenv').config();
const db = require("../utils/db");
const fetch = require('node-fetch');
const base58 = require("base-58");
const solanaWeb3 = require('@solana/web3.js');
const nfteyez = require('@nfteyez/sol-rayz');
const tokenMetaData = require("@metaplex-foundation/mpl-token-metadata");

const MAX_METADATA_LEN = 679;
const CREATOR_ARRAY_START = 326;
const TOKEN_METADATA_PROGRAM = new solanaWeb3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const CANDY_MACHINE_V2_PROGRAM = new solanaWeb3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
const candyMachineId = new solanaWeb3.PublicKey('4xXRnKbShMDAdnW7wE6T33L2ncSSxBb7fBxYrWU9ttT7');

const connection = nfteyez.createConnectionConfig("https://api.devnet.solana.com");

const getNftMetadata = async (address) => {
    try {  
        let mintPubkey = new solanaWeb3.PublicKey(address);
        let tokenmetaPubkey = await tokenMetaData.Metadata.getPDA(mintPubkey);
        const tokenmeta = await tokenMetaData.Metadata.load(connection, tokenmetaPubkey);
        return tokenmeta;
    } catch (e) {
        return false;
    }
};

const getCandyMachineCreator = async (candyMachine) => (
    solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), candyMachine.toBuffer()],
        CANDY_MACHINE_V2_PROGRAM,
    )
  );

const getMintAddresses = async (firstCreatorAddress) => {
    const metadataAccounts = await connection.getProgramAccounts(
        TOKEN_METADATA_PROGRAM,
        {
            dataSlice: { offset: 33, length: 32 },

            filters: [
            { dataSize: MAX_METADATA_LEN },

            {
                memcmp: {
                offset: CREATOR_ARRAY_START,
                bytes: firstCreatorAddress.toBase58(),
                },
            },
            ],
        },
    );

    return metadataAccounts.map((metadataAccountInfo) => (
        base58.encode(metadataAccountInfo.account.data)
    ));
};


const processGimmicks = async(nfts) => {
    for (let index = 0; index < nfts.length; index++) {
        let exists = await db.runQuery(`SELECT id FROM gimmicks WHERE address = '${nfts[index].data.mint}'`);
        if (exists.length == 0) {
            let response = await fetch(nfts[index].data.data.uri);
            let metadata = await response.json();
            console.log('New gimmicks', nfts[index].data.mint);
            let background = (metadata.attributes.filter((a) => a.trait_type == 'Background')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Background')[0].value : '';
            let skin = (metadata.attributes.filter((a) => a.trait_type == 'Skin')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Skin')[0].value : '';
            let top = (metadata.attributes.filter((a) => a.trait_type == 'Top')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Top')[0].value : '';
            let hair = (metadata.attributes.filter((a) => a.trait_type == 'Hair')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Hair')[0].value : '';
            let ears = (metadata.attributes.filter((a) => a.trait_type == 'Ears')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Ears')[0].value : '';
            let eyes = (metadata.attributes.filter((a) => a.trait_type == 'Eyes')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Eyes')[0].value : '';
            let mouth = (metadata.attributes.filter((a) => a.trait_type == 'Mouth')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Mouth')[0].value : '';
            let frame = (metadata.attributes.filter((a) => a.trait_type == 'Frame')[0]) ? metadata.attributes.filter((a) => a.trait_type == 'Frame')[0].value : '';
            await db.runQuery(`INSERT INTO gimmicks (name, image, address, background, skin, top, hair, ears, eyes, mouth, frame)
                VALUES(
                    '${nfts[index].data.data.name}',
                    '${metadata.image}',
                    '${nfts[index].data.mint}',
                    '${background}',
                    '${skin}',
                    '${top}',
                    '${hair}',
                    '${ears}',
                    '${eyes}',
                    '${mouth}',
                    '${frame}'
                )`
            );
        }
    }

  };

const init = async() => {
    const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
    let addresses = await getMintAddresses(candyMachineCreator[0]);
    let nfts = [];
    for (let index = 0; index < addresses.length; index++) {
        nfts.push(await getNftMetadata(addresses[index]));
    }
    await processGimmicks(nfts);
};

function run() {
    init();
    setInterval(init, 180000);
};
  
run();