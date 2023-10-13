const fetch = require("node-fetch");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "mySecret",
    name: "user", // optional
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", async (req, res) => {
  const user = req.session?.user;

  console.log("session 是否有 user", user);
  if (user) {
    res.send(`
    <h1>登入成功</h1>
    <p>使用者: ${user} </p>
    `)
  } else {
    let token = req.query.token;
    console.log("是否取得令牌", token);
    if (!token) {
      console.log("跳轉至 sso 驗證中心");
      res.redirect(
        `http://localhost:8383/login?redirectUrl=${req.headers.host}${req.url}`
      );
    }
    //從 sso 拿到 token
    else {
      //此時 A 應用還沒登入，但有了 sso 令牌

      // 檢查令牌是否過期
      const checkTokenRes = await fetch(
        `http://localhost:8383/check_token?token=${token}`
      ).then((res) => res.json());

      console.log("令牌是否過期", checkTokenRes);
      //如果令牌沒過期
      if (checkTokenRes.error === 0) {
        // 驗證通過後，註冊 session，炫染頁面
        req.session["user"] = checkTokenRes.userId;
        res.send(`
        <h1>登入成功</h1>
        <p>使用者: ${checkTokenRes.userId} </p>
        `)
        // 至此用户已经能正常访问应用A，SSO服务器和应用A服务器上都有了用户登录过的信息。
      }
      // 令牌過期，再重新登入一次
      else {
        res.redirect(
          `http://localhost:8383/login?redirectUrl=${req.headers.host}${req.url}`
        );
      }
    }
  }
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
