require('dotenv').config();
const mysql = require('mysql2');
const db = require("../utils/db");
const axios = require('axios');

const getGimmicks = () => {
  axios.post(process.env.STRAPI_ENDPOINT,
      { query:
        `
        query { 
          gimmicks {
            id
            Name
            NFTID
            updated_at
            Details {
              Name
              BirthDate
              BirthPlace
              Citizenship
              Occupation
              Spouse
            }
            Description
            Avatar {
              url
            }
          }
        }`,
      })
      .then((response) => {
          response.data.data.gimmicks.map(async (gimmick,index) => {
              try {
                let date = Math.floor(new Date(gimmick.updated_at)/1000);
                await db.runQuery(`UPDATE gimmicks
                    SET description = ${mysql.escape(gimmick.Description)},
                    birth_date = ${mysql.escape(gimmick.Details.BirthDate)},
                    country = ${mysql.escape(gimmick.Details.BirthPlace)},
                    citizenship = ${mysql.escape(gimmick.Details.Citizenship)},
                    occupation = ${mysql.escape(gimmick.Details.Occupation)},
                    spouse = ${mysql.escape(gimmick.Details.Spouse)},
                    updated_at = ${mysql.escape(date)}
                    WHERE address='${gimmick.NFTID}'`
                );
                console.log(index,gimmick.NFTID,date)
              } catch (error) {
                  console.log(error);
              }
          })
      })
      .catch((error) => {
          console.log(error);
      })
};

getGimmicks();