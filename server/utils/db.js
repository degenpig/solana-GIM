require('dotenv').config()
const mysql = require('mysql2');

const runQuery = (query) => {
  const connection = mysql.createConnection({
    //host: process.env.DB_HOST,
    //port: process.env.DB_PORT,
    //socketPath: '/var/run/mysqld/mysqld.sock',
    socketPath: '/tmp/mysql.sock',
    user:  process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
  });
  connection.connect();
  return new Promise((resolve, reject) => {
      connection.query(query, function (error, results, fields) {
        if (error) {
          connection.end();
          reject(error);
        } else {
          connection.end();
          resolve(results);
        }
      });
  });
};

exports.runQuery = runQuery;