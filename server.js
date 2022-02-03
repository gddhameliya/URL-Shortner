require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moongoose = require("mongoose");
const dns = require("dns");
const urlparse = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

moongoose.connect(process.env.MONGO_DB).then(() => console.log('MongoDB is Connect...')).catch(err => console.log(err.message));

const Url = moongoose.model(
  "Url",
  new moongoose.Schema({
    url: String,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
// app.get('/api/shorturl', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  const bodyurl = req.body.url;

  const something = dns.lookup(
    urlparse.parse(bodyurl).hostname,
    async (error, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" });
      } else {
        let url = new Url({ url: bodyurl });
        url = await url.save();
        res.json({ original_url: url.url, short_url: url._id });
      }
      console.log("dns", error);
      console.log("address", address);
    }
  );
  // res.json({ greeting: req.body.url });
  console.log("Something", something);
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Invalid URL" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
