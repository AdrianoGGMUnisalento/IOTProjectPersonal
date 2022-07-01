//const sensorLib = require('node-dht-sensor'); // include existing module called 'node-dht-sensor'
const http = require('http')
var mqtt=require('mqtt');

/*
First prototype of actuator conection works properly but we need to search and decide which actuator we want to use.
 */
var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
client.on("connect",function(){
    console.log("connected");
});
client.on("error",function(error){
    console.log("Can't connect"+error);
});
client.on("message",function(topic, message, packet){
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    var messageJSON = JSON.parse(message);
    var On = messageJSON.on;
    console.log("The light was turned on :"+On);
});

var topic="unisalento/smarthome/raspberry1/actuators/leds";
console.log("subscribing to topic "+topic);
client.subscribe(topic); //single topic
