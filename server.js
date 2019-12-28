const express = require("express");
var cors = require("cors");
const app = express();
var bodyParser = require("body-parser");
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser());
var addressFrom = "";
var to = "";

app.post("/", async (req, res) => {
  // res.send(req.body.from);
  // return;
  const puppeteer = require("puppeteer");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--incognito", "--disable-setuid-sandbox"],
    handleSIGINT: false
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setJavaScriptEnabled(true);
  await page.setViewport({
    width: 1280,
    height: 800
  });

  addressFrom = req.body.from;
  addressTo = req.body.to;
  // res.send([addressFrom, to]);
  let url = `https://www.google.com/maps/dir/${addressFrom}/${addressTo}/`;
  await page.goto(
    url
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
  result.url = url;
  console.log(result);
  await page.close();
  await browser.close();

  res.send(result);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
