const http = require('http')
var mqtt=require('mqtt');

//======================Added for IoT Hub=======================//

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
const Message = require('azure-iot-device').Message;
const deviceConnectionString = 'HostName=DemoSmartHome.azure-devices.net;DeviceId=SensorSolarPanel;SharedAccessKey=gYC3grh3vqPS+GqblLkzDpQaIDgRBwkBUe9p1kG/aGw='
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
/*
var PowerSunnyday=[0,0,0,0,0,0,5.75,43.68,155.17,300,421.83,500,534.48,540.22,495.4,411.11,290.8,145.98,41.59,5.75,0,0,0,0];
var PowerEfficency=[];
for(var i=0;i<PowerSunnyday.length;i++) {
    PowerEfficency.push(PowerSunnyday[i]/600);
}
*/


function pad2(n) { return n < 10 ? '0' + n : n }
function SensorSolarPanel(MaxPower,GoodWeather,PowerEfficency){
        this.MaxPower = MaxPower;
        this.GoodWeather = GoodWeather; //GoodWeather is a boolean good 0 bad 1
        this.PowerEfficency=PowerEfficency;
    //methods
    this.calculatePower=function(Hour){
        var power=0;
       if(this.GoodWeather) {
           power = this.PowerEfficency[Hour]*this.MaxPower-0.05 * (getRndInteger(0,100) / 100);
           if(power<0){
               power=0;
           }
       }
       else{
           power = this.PowerEfficency[Hour]*this.MaxPower -0.20 * (getRndInteger(80,100) / 100);
            if(power<0){
                power=0;
            }
       }
       return power;
    }
    this.Efficency=function(Hour){
        return this.PowerEfficency[Hour]*100;
    }
}

var PowerEfficency=[0,0,0,0,0,0,0.103333333333333,0.1728,0.35861666666666666,0.70305,0.85634,0.8908,0.9003666666666668,0.9003666666666668,0.953324,0.9851833333333334,
    0.8846666666666667,0.85634,0.76931666666666668, 0.409583333333333333,0.123333333333333,0,0,0];

console.log(PowerEfficency.length);


var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://20.216.178.106:1883");
client.on("connect",function(){
    console.log("connected to broker");
});
client.on("error",function(error){
    console.log("Can't connect broker"+error);
});
var minutes=60;
var date = new Date();



// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    var readout = new SensorSolarPanel(500,true, PowerEfficency);//
    var power=readout.calculatePower(date.getHours());
    var efficiency=readout.Efficency(date.getHours());

    var timestamp = date.getFullYear().toString()+"-"+ pad2(date.getMonth() + 1)+"-" + pad2( date.getDate())+" " + pad2( date.getHours() )+":" + pad2( date.getMinutes() )+":" + pad2( date.getSeconds());
    console.log('Power: ',power.toFixed(1)+ 'W');
    console.log('Pannels efficiency: ', efficiency.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "SOLAR",
        "timestamp": timestamp,
        "PannelsPower": power.toFixed(1),
        "Pannelsefficiency": efficiency.toFixed(1)

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

    client.publish("unisalento/smarthome/raspberry1/sensorSolarPanel", data);





//======================================================================//

// ==================================================================//
    date.setMinutes(date.getMinutes() + minutes);
}, 2000);//here time out should be 5minutes
/*
    const options = {

        hostname: '192.168.1.53',
        port: 3000,
        path: '/SolarPanels',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        //define the callback function that will print the result of the request in case of success
        res.on('data', d => {
            process.stdout.write(d);
        })

        //define the callback function that will print the result of the request in case of error
        req.on('error', error => {
            console.error(error);
        })
    })
    //send the request
    req.write(data);
    req.end();
}, 2000);*/