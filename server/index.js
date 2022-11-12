require('dotenv').config();
const solanaWeb3 = require('@solana/web3.js');
const nfteyez = require('@nfteyez/sol-rayz');
const { checkForBannedWords } = require("./services/checkForBannedWords");
const mysql = require('mysql2');
const db = require("./utils/db");
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const base58 = require("base-58");
const nacl = require("tweetnacl");
const moment = require('moment-timezone');
const { start } = require('repl');
const app = express();

const corsOptions = {
  origin: (process.env.NETWORK == 'devnet') ? ['http://localhost:3000','https://gimmicks.alwaysaugust.co'] : ['https://therealgimmicks.com', 'https://www.therealgimmicks.com']
}

app.use(cors(corsOptions));
app.use(bodyParser.json({ extended: true }));

const getWalletNfts = async (address) => {
  try {
      const connect = nfteyez.createConnectionConfig(solanaWeb3.clusterApiUrl(process.env.NETWORK));
      let nfts = await nfteyez.getParsedNftAccountsByOwner({
        publicAddress: address,
        connection: connect,
        serialization: true,
      });
      let gimmickNfts=[];

      //get only the gimmicks nfts
      for (let nft = 0; nft < nfts.length; nft++) {
        if (typeof nfts[nft].data.creators !== 'undefined') {
          for (let creator = 0; creator < nfts[nft].data.creators.length; creator++) {
            if(nfts[nft].data.creators[creator].address == process.env.VERIFIED_CREATOR && nfts[nft].data.creators[creator].verified == 1) {
              gimmickNfts.push(nfts[nft]);
            }
          }
        }
      }
      return gimmickNfts;
  } catch (error) {
    console.log(error);
  }
};

app.get('/gimmicks', async (req, res) => {
  let gimmicks = await db.runQuery(`SELECT * FROM gimmicks`);
  res.send({gimmicks:gimmicks});
});
app.get('/gimmicks/amount', async (req, res) => {
  let count = await db.runQuery(`SELECT COUNT(*) FROM gimmicks`);
  let amount = count[0]['COUNT(*)']
  res.send({amount: amount});
});
app.post('/gimmicks/range', async (req, res) => {
  let gimmicks = await db.runQuery(`SELECT * FROM gimmicks ${req.body.updated ? 'WHERE updated_at > 0' : ''} LIMIT ${req.body.lowerLimit} , ${req.body.upperLimit}`);
  res.send({gimmicks:gimmicks});
});
app.post('/gimmicks/search', async (req, res) => {
  let gimmicks = await db.runQuery(`SELECT * FROM gimmicks WHERE
    (
      name LIKE ('%${req.body.query}') or
      background LIKE ('%${req.body.query}%') or
      skin LIKE ('%${req.body.query}%') or
      top LIKE ('%${req.body.query}%') or
      hair LIKE ('%${req.body.query}%') or
      ears LIKE ('%${req.body.query}%') or
      eyes LIKE ('%${req.body.query}%') or
      mouth LIKE ('%${req.body.query}%') or
      frame LIKE ('%${req.body.query}%')
    )
    ${req.body.updated ? 'AND updated_at > 0' : ''}
    ORDER BY name`
  );
  res.send({gimmicks:gimmicks});
});

app.get('/getGimmick', async (req, res) => {
  try {
    let gimmick = await db.runQuery(`SELECT * FROM gimmicks WHERE address='${req.query.address}' LIMIT 1`);
    if(gimmick.length == 0){
      res.status(403).send({error_code: "DOESNT_EXIST", error: "This Gimmick doesn't exist"});
      return;
    }
    let dicsSent = await db.runQuery(`SELECT SUM(amount) as dicsSent FROM dicpunches WHERE fromNft='${req.query.address}'`);
    let dicsReceived = await db.runQuery(`SELECT SUM(amount) as dicsReceived FROM dicpunches WHERE toNft='${req.query.address}'`);

    res.send({gimmick,dicsSent:dicsSent[0].dicsSent,dicsReceived:dicsReceived[0].dicsReceived});
  } catch (error) {
    res.status(403).send({error_code: "DOESNT_EXIST", error: "This Gimmick doesn't exist"});
  }
});

app.get('/getPunches', async (req, res) => {
  try {
    let dicsSent = await db.runQuery(`SELECT SUM(amount) as dicsSent FROM dicpunches WHERE fromNft='${req.query.address}'`);
    let dicsReceived = await db.runQuery(`SELECT SUM(amount) as dicsReceived FROM dicpunches WHERE toNft='${req.query.address}'`);
    res.send({dicsSent:dicsSent[0].dicsSent,dicsReceived:dicsReceived[0].dicsReceived});
  }catch (error) {
    console.log(error);
  }
});

app.post('/saveGimmick', async (req, res) => {
  
  //make sure that the wallet is owned by the user
  const signatureUint8 = base58.decode(req.body.signature);
  const nonceUint8 = new TextEncoder().encode(req.body.variables.message);
  const pubKeyUint8 = base58.decode(req.body.variables.wallet);
  if(nacl.sign.detached.verify(nonceUint8, signatureUint8, pubKeyUint8)) {
    //check that the wallet owns the nft
    let nfts = await getWalletNfts(req.body.variables.wallet);
    const found = nfts.some(nft => nft.mint === req.body.variables.id);
    if (!found) {
      res.status(403).send({error_code: "NOT_NFT_OWNER", error: "Sorry, only the NFT owner of this Gimmick can edit the bio."});
      return;
    }
  } else {
    res.status(403).send({error_code: "NOT_WALLET_OWNER", error: "Sorry, only the NFT owner of this Gimmick can edit the bio."});
    return;
  }

  let descriptionText = JSON.parse(req.body.variables.description).blocks[0].text;
  if(descriptionText != '' && checkForBannedWords(descriptionText)) {
    res.status(403).send({error_code: "BANNED_WORDS", error: "Banned words!"});
    return;
  }

  let foundUrls = false;
  let urls = JSON.parse(req.body.variables.description).entityMap;
  Object.keys(urls).forEach((url) => {
    if(urls[url].type == "LINK"){
      let descriptionUrl = new URL(urls[url].data.url);
      if(
        (!descriptionUrl.host.match(/youtube\.com/) &&
        !descriptionUrl.host.match(/youtu\.be/) &&
        !descriptionUrl.host.match(/discord\.com/) &&
        !descriptionUrl.host.match(/twitter\.com/)) &&
        !descriptionUrl.host.match(/therealgimmicks\.com/)
      ){
        foundUrls = true
        return;
      }
    }
  });

  if(foundUrls){
    res.status(403).send({error_code: "URLS_DETECTED", error: "One or more of the urls in the description are not allowed"});
    return;
  }

  let exists = await db.runQuery(`SELECT id FROM gimmicks WHERE address='${req.body.variables.id}'`);

  if (exists.length == 0) {
    res.status(403).send({error_code: "DOESNT_EXIST", error: "This Gimmick doesn't exist"});
    return;
  }

  if (req.body.variables.details.nickname.length > 30){
    res.status(403).send({error_code: "CHARACTER_LIMIT", error: "Name has to be 30 characters or less"});
    return;
  }

  if (req.body.variables.details.Spouse.length > 30){
    res.status(403).send({error_code: "CHARACTER_LIMIT", error: "Spouse has to be 30 characters or less"});
    return;
  }

  if (req.body.variables.details.Occupation.length > 30){
    res.status(403).send({error_code: "CHARACTER_LIMIT", error: "Occupation has to be 30 characters or less"});
    return;
  }

  try {
    let updated_at = Math.floor(Date.now() / 1000);
    await db.runQuery(`UPDATE gimmicks
      SET description = ${mysql.escape(req.body.variables.description)},
      birth_date = ${mysql.escape(req.body.variables.details.BirthDate)},
      country = '${req.body.variables.details.BirthPlace}',
      citizenship = '${req.body.variables.details.Citizenship}',
      occupation = ${mysql.escape(req.body.variables.details.Occupation)},
      spouse = ${mysql.escape(req.body.variables.details.Spouse)},
      nickname = ${mysql.escape(req.body.variables.details.nickname)},
      updated_at = '${updated_at}'
      WHERE address='${req.body.variables.id}'`
    );
    res.send({status:true});
  } catch (error) {
    console.log(error);
  }

})

// save place entry, only accesible for admins with admin NFTs
app.post('/savePlaceStrapi', (req, res) => {
  // check if NFT is an admin NFT
  axios.post(process.env.STRAPI_ENDPOINT,
  { query:
    `
    mutation($id: ID!, $description: String) {
      updatePlace(input: {where: {id: $id}, data: { Description: $description}})
      { 
        place {
          Description
        }
      }
    }
    `,
    variables: req.body.variables
  }
  ) 
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send(error)
    })
})

app.post('/saveEventStrapi', (req, res) => {
  // check if NFT is an admin NFT
  axios.post(process.env.STRAPI_ENDPOINT,
  { query:
    `
    mutation($id: ID!, $description: String) {
      updateEvent(input: {where: {id: $id}, data: { Description: $description}})
      { 
        event {
          Description
        }
      }
    }
    `,
    variables: req.body.variables
  }
  ) 
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send(error)
    })
})

app.post('/saveFactionStrapi', (req, res) => {
  // check if NFT is an admin NFT
  axios.post(process.env.STRAPI_ENDPOINT,
  { query:
    `
    mutation($id: ID!, $description: String) {
      updateFaction(input: {where: {id: $id}, data: { Description: $description}})
      { 
        event {
          Description
        }
      }
    }
    `,
    variables: req.body.variables
  }
  ) 
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send(error)
    })
});

app.get('/gimmicks/leaderboard', async (req, res) => {

  let startOfWeek;
  let endOfWeek;
  let today = moment().tz('America/New_York').day();
  let currentTime  = moment().tz('America/New_York').format("hh");

  if (req.query.week == 'this') {
    startOfWeek = moment().tz('America/New_York').startOf('isoWeek').day(((today==5 && currentTime >=12) || today > 5) ? 5 : -2).hours(12).unix();
    if((today==5 && currentTime >=12) || today > 5) {
      endOfWeek = moment().tz('America/New_York').add(1, 'weeks').endOf('isoWeek').day(-2).hours(11).minutes(59).unix();
    }else{
      endOfWeek = moment().tz('America/New_York').day(5).hours(11).minutes(59).unix();
    }
  } else if (req.query.week == 'last') {
    startOfWeek = moment().tz('America/New_York').subtract(1, 'weeks').startOf('isoWeek').day(((today==5 && currentTime >=12) || today > 5) ? 5 : -2).hours(12).unix();
    if((today==5 && currentTime >=12) || today > 5) {
      endOfWeek = moment().tz('America/New_York').subtract(1, 'weeks').endOf('isoWeek').day(5).hours(11).minutes(59).unix();
    }else{
      endOfWeek = moment().tz('America/New_York').subtract(1, 'weeks').day(5).hours(11).minutes(59).unix();
    }
  }

  try {
    let dicsSentLeaders = await db.runQuery(`
      SELECT gimmicks.id, gimmicks.address, gimmicks.image, gimmicks.name, COUNT(dicpunches.id) as dicsSent
      FROM gimmicks
      LEFT JOIN dicpunches ON gimmicks.address=dicpunches.fromNft
      ${startOfWeek > 0 ? `WHERE dicpunches.timestamp >= ${startOfWeek}` : ''}
      GROUP BY gimmicks.id
      HAVING dicsSent >= 1
      ORDER BY dicsSent DESC
      LIMIT 50`
    );

    if (dicsSentLeaders[49]) {
      let dicsSentTies = await db.runQuery(`
        SELECT gimmicks.id, gimmicks.address, gimmicks.image, gimmicks.name, COUNT(dicpunches.id) as dicsSent
        FROM gimmicks
        LEFT JOIN dicpunches ON gimmicks.address=dicpunches.fromNft
        ${startOfWeek > 0 ? ` WHERE dicpunches.timestamp >= ${startOfWeek}` : ''}
        GROUP BY gimmicks.id
        HAVING dicsSent = ${dicsSentLeaders[49].dicsSent} AND gimmicks.id != ${dicsSentLeaders[49].id}`
      );

      if(dicsSentTies.length > 0) dicsSentLeaders = dicsSentLeaders.concat(dicsSentTies);
    }

    let dicsReceivedLeaders = await db.runQuery(`
      SELECT gimmicks.id, gimmicks.address, gimmicks.image, gimmicks.name, COUNT(dicpunches.id) as dicsReceived
      FROM gimmicks
      LEFT JOIN dicpunches ON gimmicks.address=dicpunches.toNft
      ${startOfWeek > 0 ? `WHERE dicpunches.timestamp >= ${startOfWeek}` : ''}
      GROUP BY gimmicks.id
      HAVING dicsReceived >= 1
      ORDER BY dicsReceived DESC
      LIMIT 50`
    );

    if (dicsReceivedLeaders[49]) {
      let dicsReceivedTies = await db.runQuery(`
        SELECT gimmicks.id, gimmicks.address, gimmicks.image, gimmicks.name, COUNT(dicpunches.id) as dicsReceived
        FROM gimmicks
        LEFT JOIN dicpunches ON gimmicks.address=dicpunches.toNft
        ${startOfWeek > 0 ? ` WHERE dicpunches.timestamp >= ${startOfWeek}` : ''}
        GROUP BY gimmicks.id
        HAVING dicsReceived = ${dicsReceivedLeaders[49].dicsReceived} AND gimmicks.id != ${dicsReceivedLeaders[49].id}`
      );

      if(dicsReceivedTies.length > 0) dicsReceivedLeaders = dicsReceivedLeaders.concat(dicsReceivedTies);
    }

    res.send({dicsSentLeaders:dicsSentLeaders,dicsReceivedLeaders:dicsReceivedLeaders});
  } catch (error) {
    console.log(error)
    res.status(403).send({ error: "Unable to get leaderboard gimmicks"});
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Gimmicks listening on port ${process.env.PORT}`);
})