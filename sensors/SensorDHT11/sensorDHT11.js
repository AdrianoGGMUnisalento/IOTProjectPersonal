const http = require('http')
var mqtt=require('mqtt');
//======================Added for IoT Hub=======================//

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
const Message = require('azure-iot-device').Message;
const deviceConnectionString = 'HostName=DemoSmartHome.azure-devices.net;DeviceId=DHT11sensor;SharedAccessKey=698ln+5NtWam7JcdAe95qsr9JlVzDN4fqzUOJEglSjY='
let deviceClient = Client.fromConnectionString(deviceConnectionString, Protocol);


// Helper function to print results in the console

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

function disconnectHandler () {
    clearInterval(sendInterval);
    sendInterval = null;
    deviceClient.open().catch((err) => {
        console.error(err.message);
    });
}

function messageHandler (msg) {
    console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
    deviceClient.complete(msg, printResultFor('completed'));
}
function errorHandler (err) {
    console.error(err.message);
}


//deviceClient.on('connect', connectHandler);
deviceClient.on('error', errorHandler);
deviceClient.on('disconnect', disconnectHandler);
deviceClient.on('message', messageHandler);
deviceClient.open()
    .catch(err => {
        console.error('Could not connect: ' + err.message);
    });

//========================================================
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

/*var HostName="DemoSmartHome.azure-devices.net";
var DeviceId="DHT11sensor";
var sharedacces="SharedAccessSignature sr=DemoSmartHome.azure-devices.net%2Fdevices%2FDHT11sensor&sig=%2Fy7wjPzn1Wc6v7aBAyQ8k1q4x%2F%2FVzTe2UwwZi%2BE%2BQaU%3D&se=1659699285";
var broker="mqtts://DemoSmartHome.azure-devices.net:8883/";
var username="DemoSmartHome.azure-devices.net/DHT11sensor/?api-version=2021-04-12";
*/
var client= mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://20.216.178.106:1883");
client.on("connect",function(){
    console.log("connected to broker");
});
client.on("error",function(error) {
    console.log("Can't connect broker" + error);
});
var minutes=60;
var date = new Date();
//'YYYYMMDDHHMMSS
// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)


setInterval(function() {
    //var readout = sensorLib.read();
    var timestamp =  date.getFullYear().toString()+"-"+ pad2(date.getMonth() + 1)+"-" + pad2( date.getDate())+" " + pad2( date.getHours() )+":" + pad2( date.getMinutes() )+":" + pad2( date.getSeconds());
    console.log('timestamp: ',timestamp);
    var tmp=28+ 4 * (getRndInteger(10, 80) / 100) - 4 * (getRndInteger(10, 80) / 100);
    console.log('Temperature:', tmp.toFixed(1) + 'C');
    //console.log('Temperature:', readout.temperature.toFixed(1) + 'C');
    //console.log('Humidity: ', readout.humidity.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "temperature sensor",
        "timestamp": timestamp,
        "temperature":tmp.toFixed(1) //readout.temperature.toFixed(1)
    })

    //======================Added for IoT Hub=======================//
    var messageBytes = Buffer.from(data, "utf8");
    var message = new Message(messageBytes);
    // Encode message body using UTF-8


    // Set message body type and content encoding
    message.contentEncoding = "utf-8";
    message.contentType = "application/json";
    message.properties.add('temperatureAlertAC', (tmp > 22) ? 'true' : 'false');
    message.properties.add('temperatureAlertHA', (tmp < 22) ? 'true' : 'false');
    deviceClient.sendEvent(message, (err, res) => {
        if (err) console.log('error: ' + err.toString());
        if (res) console.log('status: ' + res.constructor.name);
    });
//======================================================================//


    date.setMinutes(date.getMinutes() + minutes);
    client.publish("unisalento/smarthome/raspberry1/sensor/temperature", data);


}, 2000);

