const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "104.198.110.215",
  user: "admin",
  password: "tpift",
  database: "hawk_db",
});

module.exports = connection;
