const http = require('http')
var mqtt=require('mqtt');

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
           power = this.PowerEfficency[Hour]*this.MaxPower-0.15 * (getRndInteger(40,100) / 100);
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
var PowerEfficency=[0,0,0,0,0,0,0.009583333333333333,0.0728,0.25861666666666666,0.5,0.70305,0.8333333333333334,0.8908,0.9003666666666668,0.8256666666666667,   0.6851833333333334,
    0.4846666666666667,0.2433,0.06931666666666668, 0.009583333333333333,0,0,0,0];
console.log(PowerEfficency);
// initialize the request
var HostName="DemoSmartHome.azure-devices.net";
var DeviceId="SensorSolarPanel";
var broker="mqtts://DemoSmartHome.azure-devices.net:8883/";
var sharedacces="SharedAccessSignature sr=DemoSmartHome.azure-devices.net%2Fdevices%2FSensorSolarPanel&sig=kbR3pBOt0FeaedakDgXwR2%2BPucEn9%2F9RozledGJS2xw%3D&se=1659683600";
var username="DemoSmartHome.azure-devices.net/SensorSolarPanel/?api-version=2021-04-12";


var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
var azclient = mqtt.connect(broker,{clientId:"SensorSolarPanel",protocolId: 'MQTT',
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
client.on("error",function(error){
    console.log("Can't connect broker"+error);
});
var minutes=5;
var date = new Date();

// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    var readout = new SensorSolarPanel(500,true, PowerEfficency);//
    var power=readout.calculatePower(date.getHours())*minutes/60;
    var efficiency=readout.Efficency(date.getHours());

    var timestamp = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2( date.getDate()) + pad2( date.getHours() ) + pad2( date.getMinutes() ) + pad2( date.getSeconds());
    console.log('Power: ',power.toFixed(1)+ 'W');
    console.log('Pannels efficiency: ', efficiency.toFixed(1) + '%');

    const data = JSON.stringify({
        "sensor": "SOLAR",
        "timestamp": timestamp,
        "PannelsPower": power.toFixed(1),
        "Pannelsefficiency": efficiency.toFixed(1)

    })
    date.setMinutes(date.getMinutes() + minutes);
    client.publish("unisalento/smarthome/raspberry1/sensorSolarPanel", data);
    azclient.publish("devices/SensorSolarPanel/messages/events/", data);
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