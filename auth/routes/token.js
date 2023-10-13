var express = require("express");
var router = express.Router();

/** check_token */
router.get("/", function (req, res, next) {
  const token = req.query.token;
  console.log("check_token 取得令牌", token);
  const result = {
    error: 1,
  };

  console.log(
    "check_token 驗證令牌是否正常",
    require("../utils/index").isTokenValid(token)
  );
  if (require("../utils/index").isTokenValid(token)) {
    result.error = 0;
    result.userId = "admin";
  }

  res.status(200).json(result);
});

module.exports = router;
