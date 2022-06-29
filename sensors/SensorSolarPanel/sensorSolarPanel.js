const http = require('http')
var mqtt=require('mqtt');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function SensorSolarPanel(MaxPower,GoodWeather){
        this.MaxPower = MaxPower;
        this.GoodWeather = GoodWeather; //GoodWeather is a boolean good 0 bad 1
        this.efficiency=0;
    //methods
    this.calculatePower=function(){
        let power = this.MaxPower *(getRndInteger(10,75)/100);
       if(this.GoodWeather) {
           power = this.MaxPower*(getRndInteger(85,100)/100);
       }
        this.efficiency=(power/this.MaxPower)*100;
        return power;
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
// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    var readout = new SensorSolarPanel(500,true);//
    var power=readout.calculatePower()
    var efficiency=readout.efficiency
    console.log('Power: ',power.toFixed(1)+ 'W')
    console.log('Pannels efficiency: ', efficiency.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "SOLAR",
        "timestamp": 12345678,
        "PannelsPower": power.toFixed(1),
        "Pannelsefficiency": efficiency.toFixed(1)

    })
    client.publish("unisalento/smarthome/raspberry1/sensorSolarPanel", data);

}, 2000);
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