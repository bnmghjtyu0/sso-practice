var express = require("express");
const { isTokenValid } = require("../utils");
var router = express.Router();

router.get("/", function (req, res, next) {
  const token = req.cookies["token"];
  console.log("cookie 中是否有 token", token);

  if (token && isTokenValid(token)) {
    //有登入過
    const redirectUrl = req.query.redirectUrl;
    if (redirectUrl) {
      //帶著令牌跳轉至應用B
      res.redirect(`${req.protocol}://${redirectUrl}?token=${token}`);
    } else {
      res.send(`<h1>登入成功</h1>`);
    }
  } else {
    // sso 認證中心沒有登入過，渲染登入頁面
    res.render("login", { title: "Express" });
  }
});

router.post("/", function (req, res, next) {
  const name = req.body.name;
  const password = req.body.password;
  const redirectUrl = req.query["redirectUrl"];

  // 2. 用戶訊息
  if (name === "admin" && password === "123456") {
    //令牌
    const token = "passport";
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    if (redirectUrl) {
      console.log(`跳轉至: ${req.protocol}://${redirectUrl}?token=${token}`);
      //帶著令牌回到 A 網頁
      res.redirect(`${req.protocol}://${redirectUrl}?token=${token}`);
      //http://localhost:8686?token=passport
    } else {
      req.body = "<h1>登入成功</h1>";
    }
  } else {
    res.send({ error: 1, msg: "帳密錯誤" });
  }
});

module.exports = router;
