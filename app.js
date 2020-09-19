// create an express app
const express = require("express");
const app = express();

let data = require("./public/utility/csvjson.json");

// use the express-static middleware
app.use(express.static("public"));

app.get("/data", function (req, res) {
  res.header("Content-Type", 'application/json')
  res.send(JSON.stringify(data))
});
// define the first route
app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

// start the server listening for requests
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
