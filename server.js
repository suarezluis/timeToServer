const express = require("express");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

var addressFrom = "";
var to = "";

app.get("/", async (req, res) => {
  const puppeteer = require("puppeteer");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    handleSIGINT: false
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setJavaScriptEnabled(true);
  await page.setViewport({
    width: 1280,
    height: 800
  });

  addressFrom = await encodeURI(req.query.from);
  addressTo = await encodeURI(req.query.to);
  // res.send([addressFrom, to]);
  await page.goto(
    `https://www.google.com/maps/dir/${addressFrom}/${addressTo}/`
    // "http://www.suarezluis.com/"
  );

  const result = await page.evaluate(() => {
    let html = "";
    try {
      html = document.getElementsByTagName("HTML");
      let time = document.querySelector(".section-directions-trip-duration")
        .innerText;

      return {
        time
      };
    } catch (error) {
      return {
        time: "unknown, server error",
        error,
        message: error.message,
        html
      };
    }
  });

  result.from = addressFrom || "";
  result.to = addressTo || "";

  console.log(result);
  await page.close();
  await browser.close();

  res.send(result);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
