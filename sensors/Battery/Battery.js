const http = require('http')
var mqtt=require('mqtt');




//======================Added for IoT Hub=======================//

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
const Message = require('azure-iot-device').Message;
const deviceConnectionString = 'HostName=DemoSmartHome.azure-devices.net;DeviceId=Battery;SharedAccessKey=/GhG6w1F4A+lG0mMAXEFLATsMDb3TawwOJ90izyf2bs='
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







function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function pad2(n) { return n < 10 ? '0' + n : n }


const PANNELPOWER=140; //140AH aprox 500WH

var Consume=[-107.15277777777777,-56.73611111111111,-27.708333333333332,-26.944444444444443,-29.375, -25.97222222222222,-28.33489583333333,-53.06666666666666,-91.90416666666667,-43.54861111111111,
    -42.113799857549864,-32.552777777777784,-74.39109686609685,-63.09496082621081,-90.0485933048433,-78.92024572649574,-56.43194444444444,-47.993589743589745,-56.24239672364673,-85.72720797720798,
    -108.63553703703704,-172.1759259259259,-215.27777777777774,-141.15740740740742];

function Battery(Capacity,initialPowerpercent,MaxPower){
    this.Capacity =Capacity; //1300 Ah    140 AH aprox la placa
    this.Power = (initialPowerpercent/100)*Capacity;
    this.Charge=100;

    //methods
    this.calculateBatteryStatus=function(hour){
        var valueP=this.Power+Consume[hour]
        if(valueP<0){
            valueP=0;
        }
        this.Power =valueP ;

        this.Charge = (this.Power / this.Capacity) * 100;
    }
}


var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://20.216.178.106:1883");




client.on("connect",function(){
    console.log("connected to broker");
});
client.on("error",function(error){
    console.log("Can't connect broker"+error);
});
var readout = new Battery(4000.0,100,);
var minutes=60;
var date = new Date();




// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    console.log('Power: ',readout.Power.toFixed(1)+ 'A');
    readout.calculateBatteryStatus(date.getHours());
    var Charge=readout.Charge;
    var power=readout.Power;
    var timestamp = date.getFullYear().toString()+"-"+ pad2(date.getMonth() + 1)+"-" + pad2( date.getDate())+" " + pad2( date.getHours() )+":" + pad2( date.getMinutes() )+":" + pad2( date.getSeconds());
    console.log('Power: ',power.toFixed(1)+ 'A');
    console.log('Charge: ', Charge.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "Battery",
        "timestamp": timestamp,
        "BatteryPower": power.toFixed(1),
        "BatteryCharge":Charge.toFixed(1)

    })
    //======================Added for IoT Hub=======================//
    var messageBytes = Buffer.from(data, "utf8");
    var message = new Message(messageBytes);
    // Encode message body using UTF-8
    // Set message body type and content encoding
    message.contentEncoding = "utf-8";
    message.contentType = "application/json";

    deviceClient.sendEvent(message, (err, res) => {
        if (err) console.log('error: ' + err.toString());
        if (res) console.log('status: ' + res.constructor.name);
    });
//======================================================================//
    client.publish("unisalento/smarthome/raspberry1/SensorBattery", data);



    // =========== this below code is for MySql approach===============//




//======================================================================//

// ==================================================================//
    date.setMinutes(date.getMinutes() + minutes);
}, 2000);