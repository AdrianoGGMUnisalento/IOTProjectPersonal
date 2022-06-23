var express = require("express");
var app = express();
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.post("/temperature", (req, res, next) => {
    console.log("receivedData");
    res.sendStatus(200);
});