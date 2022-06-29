const http = require('http')
var mqtt=require('mqtt');
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
const PANNELPOWER=140; //140AH aprox 500WH
var Consumption=300;

function Battery(Capacity,initialPowerpercent,ifconnected,GoodWeather){
    this.Capacity =Capacity; //1300 Ah    140 AH aprox la placa
    this.Power = (initialPowerpercent/100)*Capacity;
    this.ifconnected=ifconnected;
    this.GoodWeather = GoodWeather; //GoodWeather is a boolean good 0 bad 1
    this.Charge=100;
    //methods
    this.calculateBatteryStatus=function(){
        if(!this.ifconnected) {
            if (this.GoodWeather) {
                this.Power = this.Power + (getRndInteger(85, 100) / 100)* (PANNELPOWER / this.Capacity);
            } else {
                this.Power = this.Power + (getRndInteger(10, 75) / 100) * (PANNELPOWER / this.Capacity);
            }
            this.Charge = (this.Power / this.Capacity) * 100;
        }
        else{

            if (this.GoodWeather) {
                this.Power = this.Power + (getRndInteger(85, 100) / 100)* (PANNELPOWER / this.Capacity)-Consumption;
            } else {
                this.Power = this.Power + (getRndInteger(10, 75) / 100) * (PANNELPOWER / this.Capacity)-Consumption;
            }
            this.Charge = (this.Power / this.MaxPower) * 100;
        }
    }
}
// initialize the request
var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
client.on("connect",function(){
    console.log("connected");
});
client.on("error",function(error){
    console.log("Can't connect"+error);
});
var readout = new Battery(1300.0,60,false,true);
// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    console.log('Power: ',readout.Power.toFixed(1)+ 'A');
    readout.calculateBatteryStatus();
    var Charge=readout.Charge;
    var power=readout.Power;

    console.log('Power: ',power.toFixed(1)+ 'A');
    console.log('Charge: ', Charge.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "Battery",
        "timestamp": 12345678,
        "BatteryPower": power.toFixed(1),
        "BatteryCharge":Charge.toFixed(1)

    })
    client.publish("unisalento/smarthome/raspberry1/SensorBattery", data);

}, 2000);
/*
    const options = {

        hostname: '192.168.1.53',
        port: 3000,
        path: '/Battery',
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
}, 6000);*/