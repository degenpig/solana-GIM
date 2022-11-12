const mysql = require('mysql2');

const runQuery = (query) => {
  const connection = mysql.createConnection({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'gimmicks',
    password: 'FallisAugust18!a',
    database: 'gimmicks'
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