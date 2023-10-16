const fetch = require("node-fetch");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const ssoApi = "http://localhost:8383";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.get("/", async (req, res) => {
  let ticket = req.query.ticket;
  console.log("是否取得票證", ticket);
  if (!ticket) {
    console.log("跳轉至 sso 驗證中心");
    res.redirect(
      `${ssoApi}/sso/login?redirectUrl=${req.headers.host}${req.url}`
    );
    
  }
  //從 sso 拿到 ticket
  else {
    //此時 A 應用還沒登入，但有了 sso 票證

    // 檢查票證是否過期
    const checkTokenRes = await fetch(
      `${ssoApi}/sso/check_token?ticket=${ticket}`
    ).then((res) => res.json());

    console.log("票證是否過期", checkTokenRes);
    //如果票證沒過期
    if (checkTokenRes.error === 0) {
      // req.session.destroy();
      res.send(`
      <h1>登入成功</h1>
      <p>使用者: ${checkTokenRes.userId} </p>
      <form method="get" action="/logout">
        <button type="submit">登出</button>
      </form>
  
      `);
    }
    // 票證過期，再重新登入一次
    else {
      res.redirect(
        `${ssoApi}/sso/login?redirectUrl=${req.headers.host}${req.url}`
      );
    }
  }
});

app.get("/logout", function (req, res) {

  res.clearCookie("ticket");
  res.redirect('/')

});

//Node-fetch: Disable SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
