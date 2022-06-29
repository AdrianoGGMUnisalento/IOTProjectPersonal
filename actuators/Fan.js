// ledrest.js
var gpio = require('rpi-gpio');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 8099;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

gpio.setup(11, gpio.DIR_OUT);
gpio.setup(13, gpio.DIR_OUT);
gpio.setup(15, gpio.DIR_OUT);

function off1() {
    setTimeout(function() {
        gpio.write(11, 0);
    }, 2000);
}
function off2() {
    setTimeout(function() {
        gpio.write(13, 0);
    }, 2000);