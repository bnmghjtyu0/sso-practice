const connection = require("../config/database");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

module.exports = {
  //票證
  isTokenValid: async function (ticket) {
    const uuid = ticket;
    const users = await query(
      `
        SELECT *
        FROM users
        WHERE uuid = ?
        `,
      [uuid]
    );

    return users.length !== 0;
  },
};
