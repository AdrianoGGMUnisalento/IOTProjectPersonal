const http = require('http')
var mqtt=require('mqtt');


//======================Added for IoT Hub=======================//

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
const Message = require('azure-iot-device').Message;
const deviceConnectionString = 'HostName=DemoSmartHome.azure-devices.net;DeviceId=HouseSmartElectricMeter;SharedAccessKey=p6XrFP6kY2gv49Z025ghBBPdrZyiz5cfJgfiTA4wrJQ='
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


//Time stamp format:  the time stamp format will have 4 numbers year 2 numbers month 2 number day 2 number hour 2minutes 2 seconds  '20220701095604'
function pad2(n) { return n < 10 ? '0' + n : n }
//Vector with the hours of the day goes from 0-23

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

var EnergyConsumptionoverthedayAverage=[0.39,0.2,0.1,0.1,0.1,0.1,0.1,0.2,0.36,0.2,0.2,0.2,0.33,0.30,0.4,0.37,0.29,0.25,0.25,0.33,0.4,0.63,0.77,0.5];


console.log(EnergyConsumptionoverthedayAverage.length);
var sum=0;
for(var i=0;i<EnergyConsumptionoverthedayAverage.length;i++) {
    sum +=EnergyConsumptionoverthedayAverage[i];
}
console.log("The overall value for the day is Kw: "+ sum + " KWh/day");

function SensorEnergyConsumption(EnergyConsumptionoverthedayAverage) {//We pass to the function an hour and with the Energy Average consumption generates a random value
    this.EnergyConsumption = EnergyConsumptionoverthedayAverage; //GoodWeather is a boolean good 0 bad 1
    //methods
    this.calculateConsumption = function (Hour) {
        if (Hour < 0 || Hour > 23) {
            if (Hour == 24) {
                console.log("The Hour 24 its set as 0 please insert 0 if that was the value you wanted");
            }
            else {
                console.log("Wrong number remember to put a number between 0-23")
            }

        } else {
            //we make the +- operation to set the center of the variance average Consumption
            return this.EnergyConsumption[Hour] + 0.1 * (getRndInteger(10, 75) / 100) - 0.1 * (getRndInteger(10, 75) / 100);
        }
    }
}

// initialize the request
var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs02"});
//var client = mqtt.connect("mqtt://20.216.178.106:1883");





client.on("connect",function(){
    console.log("connected to broker");
});
client.on("error",function(error){
    console.log("Can't connect broker"+error);
});
// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
//var counter=0;
var minutes=60;
var date = new Date();

setInterval(function() {
    var readout = new SensorEnergyConsumption(EnergyConsumptionoverthedayAverage);//
    /*if(counter>23){
        counter=0;
    }
    */
    var consumption=readout.calculateConsumption(date.getHours());
    var timestamp=date.getFullYear().toString()+"-"+ pad2(date.getMonth() + 1)+"-" + pad2( date.getDate())+" " + pad2( date.getHours() )+":" + pad2( date.getMinutes() )+":" + pad2( date.getSeconds());
    console.log('timestamp: ',timestamp)
    console.log('Consumption: ',consumption.toFixed(4)+ 'KWh')
    console.log('Hour: ', date.getHours().toFixed(1) + 'H');


    //counter++;
    const data = JSON.stringify({
        "sensor": "HouseSmartElectricMeter",
        "timestamp": timestamp,
        "Consumption": consumption.toFixed(4)
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

    client.publish("unisalento/smarthome/HouseSmartElectricMeter", data);
    date.setMinutes(date.getMinutes() + minutes);
// ==================================================================//

}, 2000);

