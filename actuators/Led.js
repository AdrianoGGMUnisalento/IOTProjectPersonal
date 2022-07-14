//const sensorLib = require('node-dht-sensor'); // include existing module called 'node-dht-sensor'
const http = require('http')
var mqtt=require('mqtt');

//var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO of RPI
//var LED = new Gpio(17, 'out'); //use GPIO pin 17 of RPI as output (actuator)


/*
First prototype of actuator conection works properly but we need to search and decide which actuator we want to use.
 */
//var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
var client = mqtt.connect("mqtt://20.216.178.106:1883");
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
    //var On = messageJSON.On;
    var light = messageJSON.light;

    if(light==("On")){
        //LED.writeSync(1); // making the gpio 4 on. Will turn LED on
        console.log("The light was turned :" + light);
    }

    else if(light==("Off")){
        //LED.writeSync(0); // making the gpio 4 off. Will turn LED off
        console.log("The light was turned :" + light);

    }
    else{
        console.log("The command is invalid");
    }

});

var topic="unisalento/smarthome/raspberry1/actuators/leds";
console.log("subscribing to topic "+topic);
client.subscribe(topic); //single topic
