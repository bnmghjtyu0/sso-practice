var express = require("express");
var bcrypt = require("bcrypt");
const { isTokenValid, ticket } = require("../utils");
var router = express.Router();
const connection = require("../config/database");

/**
 * [GET] /sso/login
 */
router.get("/", function (req, res, next) {
  const ticket = req.cookies["ticket"];
  console.log("cookie 中是否有 ticket", ticket);

  if (ticket && isTokenValid(ticket)) {
    //有登入過
    const redirectUrl = req.query.redirectUrl;
    if (redirectUrl) {
      //帶著票證跳轉至應用B
      res.redirect(`${req.protocol}://${redirectUrl}?ticket=${ticket}`);
    } else {
      res.send(`<h1>登入成功</h1>`);
    }
  } else {
    // sso 認證中心沒有登入過，渲染登入頁面
    res.render("login", { title: "Express" });
  }
});

/**
 * [POST] /sso/login
 */
router.post("/", async function (req, res, next) {
  const username = req.body.name;
  const password = req.body.password;
  const redirectUrl = req.query["redirectUrl"];

  connection.query(
    `
      SELECT *
      FROM users
      WHERE username = ?
    `,
    [username],
    (error, results) => {
      if (error) throw error;
      if (results.length === 0) {
        res.send("找不到使用者");
        return;
      }
      bcrypt.compare(password, results[0]?.password, function (err, result) {
        // 票證
        const ticket = results[0].uuid;
        if (result) {

          // 將票證儲存在 cookie
          res.cookie("ticket", ticket, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
          });

          if (redirectUrl) {
            console.log(
              `跳轉至: ${req.protocol}://${redirectUrl}?ticket=${ticket}`
            );

            //帶著票證回到 A 網頁
            res.redirect(`${req.protocol}://${redirectUrl}?ticket=${ticket}`);
            //http://localhost:8686?token=passport
          } else {
            req.body = "<h1>登入成功</h1>";
          }
        } else {
          res.send("帳密錯誤");
        }
      });
    }
  );
});

module.exports = router;
