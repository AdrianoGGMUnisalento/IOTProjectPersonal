//const sensorLib = require('node-dht-sensor'); // include existing module called 'node-dht-sensor'
const http = require('http')
var mqtt=require('mqtt');


function pad2(n) { return n < 10 ? '0' + n : n }

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
// // Setup sensor, exit if failed
// var sensorType = 11; // 11 for DHT11, 22 for DHT22 and AM2302
// var sensorPin = 4; // The GPIO pin number for sensor signal
// if (!sensorLib.initialize(sensorType, sensorPin))
// {
//     //print a warning message in the console
//     console.warn('Failed to initialize sensor');
//     process.exit(1);
// }
// initialize the request
var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
client.on("connect",function(){
    console.log("connected");
});
client.on("error",function(error){
    console.log("Can't connect"+error);
});
var minutes=1;
var date = new Date();
// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    //var readout = sensorLib.read();
    var timestamp = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2( date.getDate()) + pad2( date.getHours() ) + pad2( date.getMinutes() ) + pad2( date.getSeconds());
    console.log('timestamp: ',timestamp);
    tmp=28+ 4 * (getRndInteger(10, 80) / 100) - 4 * (getRndInteger(10, 80) / 100);
    console.log('Temperature:', tmp.toFixed(1) + 'C');
    //console.log('Temperature:', readout.temperature.toFixed(1) + 'C');
    //console.log('Humidity: ', readout.humidity.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": 'ID1',
        "timestamp": timestamp,
        "temperature":tmp.toFixed(1)
    })
    date.setMinutes(date.getMinutes() + minutes);
    client.publish("unisalento/smarthome/raspberry1/temperature", data);

}, 2000);
