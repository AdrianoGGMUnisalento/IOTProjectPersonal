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

var HostName="DemoSmartHome.azure-devices.net";
var DeviceId="DHT11sensor";
var sharedacces="SharedAccessSignature sr=DemoSmartHome.azure-devices.net%2Fdevices%2FDHT11sensor&sig=%2Fy7wjPzn1Wc6v7aBAyQ8k1q4x%2F%2FVzTe2UwwZi%2BE%2BQaU%3D&se=1659699285";
var broker="mqtts://DemoSmartHome.azure-devices.net:8883/";
var username="DemoSmartHome.azure-devices.net/DHT11sensor/?api-version=2021-04-12";

var client= mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://localhost:1883");
var azclient = mqtt.connect(broker,{clientId:"DHT11sensor",protocolId: 'MQTT',
    keepalive: 10,
    clean: false,
    protocolVersion: 4,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    rejectUnauthorized: false,
    username:username,
    password:sharedacces});

azclient.on("connect",function(){
    console.log("connected to azure");
});
azclient.on("error",function(error){
    console.log("Can't connect to azure"+error);
});
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

// =========== this below code is for MySql approach===============//


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE IF NOT EXISTS grafana", function (err, result) {
        if (err) throw err;
        console.log("Database created or already exists");
    });

});

// =========== End of code for MySql approach===============//

setInterval(function() {
    //var readout = sensorLib.read();
    var timestamp =  date.getFullYear().toString()+"-"+ pad2(date.getMonth() + 1)+"-" + pad2( date.getDate())+" " + pad2( date.getHours() )+":" + pad2( date.getMinutes() )+":" + pad2( date.getSeconds());
    console.log('timestamp: ',timestamp);
    var tmp=28+ 4 * (getRndInteger(10, 80) / 100) - 4 * (getRndInteger(10, 80) / 100);
    console.log('Temperature:', tmp.toFixed(1) + 'C');
    //console.log('Temperature:', readout.temperature.toFixed(1) + 'C');
    //console.log('Humidity: ', readout.humidity.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "ID1",
        "timestamp": timestamp,
        "temperature":tmp.toFixed(1) //readout.temperature.toFixed(1)
    })

//======================================================================//


    date.setMinutes(date.getMinutes() + minutes);
    client.publish("unisalento/smarthome/raspberry1/sensor/temperature", data);

    azclient.publish("devices/DHT11sensor/messages/events/", data);
        //"unisalento/smarthome/raspberry1/actuator/led"
}, 2000);

