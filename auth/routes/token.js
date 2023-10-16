var express = require("express");
var { isTokenValid } = require("../utils/index");

var router = express.Router();

/** 
 * [GET] /sso/check_token
 */
router.get("/", function (req, res, next) {
  const ticket = req.query.ticket;

  const result = {
    error: 1,
  };

  if (isTokenValid(ticket)) {
    result.error = 0;
    result.userId = ticket;
  }

  res.status(200).json(result);
});

module.exports = router;
