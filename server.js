const express = require("express");
const app = express();
const request = require("request");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");

dotenv.config();
const cache = new NodeCache({ stdTTL: 10 }); // 10 seconds

app.get("/:crypto", (req, res) => {
  const crypto = req.params.crypto;
  const cacheKey = `crypto-${crypto}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.send({
      data: cachedData,
      cached: true,
    });
  }

  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${crypto}`;

  const url2 = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${crypto}&convert=THB`;

  request.get(
    {
      url: url2,
      json: true,
      headers: {
        "X-CMC_PRO_API_KEY": process.env.API_KEY,
      },
    },
    (error, response, data) => {
      if (error) {
        return res.send({
          error: error,
        });
      }

      // Store data in cache
      cache.set(cacheKey, data);

      res.send({
        // data: data,
        data: data.data[crypto].quote,
        // data: data.data[crypto].quote.THB.price,
        cached: false,
      });
    }
  );
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
