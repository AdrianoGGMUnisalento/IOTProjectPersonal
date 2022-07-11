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
// initialize the request
var HostName="DemoSmartHome.azure-devices.net";
var DeviceId="SensorSolarPanel";
var broker="mqtts://DemoSmartHome.azure-devices.net:8883/";
var sharedacces="SharedAccessSignature sr=DemoSmartHome.azure-devices.net%2Fdevices%2FSensorSolarPanel&sig=kbR3pBOt0FeaedakDgXwR2%2BPucEn9%2F9RozledGJS2xw%3D&se=1659683600";
var username="DemoSmartHome.azure-devices.net/SensorSolarPanel/?api-version=2021-04-12";


var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://localhost:1883");

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
var minutes=60;
var date = new Date();

// =========== this below code is for MySql approach===============//
var mysql = require('mysql');
const fs = require('fs');

var con = mysql.createConnection({
    host: "mysql-idalab.mysql.database.azure.com",
    user: "idalabsqluser",
    password: "QmluZ28uMzIx",
    port: 3306,
    database : "grafana",
    ssl: {ca: fs.readFileSync("../DigiCertGlobalRootCA.crt.pem")}
})


con.connect(function(err) {
    if (err) {
        console.log("!!! Cannot connect !!! Error:");
        throw err;
    }
    console.log("Connected!");
    con.query("CREATE DATABASE IF NOT EXISTS grafana", function (err, result) {
        if (err) throw err;
        console.log("Database created or already exists");
    });
    var sql = "CREATE TABLE IF NOT EXISTS solar (timestamp  TIMESTAMP, sensor VARCHAR(255), PannelsPower DECIMAL (5,2), Pannelsefficiency DECIMAL (5,2))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");

    });
});

// =========== End of code for MySql approach===============//




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

    client.publish("unisalento/smarthome/raspberry1/sensorSolarPanel", data);
    azclient.publish("devices/SensorSolarPanel/messages/events/", data);

// =========== this below code is for MySql approach===============//


    var myDate =  timestamp;
    console.log(myDate)
    var pwr = power.toFixed(1);
    var efc = efficiency.toFixed(1)
    console.log("power is: ",pwr)
    console.log("efficency is: ",efc)



    var sql = "INSERT INTO solar (timestamp,sensor,PannelsPower,Pannelsefficiency  ) VALUES (?,?,?,?)";
    con.query(sql, [myDate, "SOLAR" ,pwr,efc], function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

//======================================================================//


    // ============this below code is for mqtt dashboard ==========//
    var data_grf_pwr = JSON.stringify({
        "Pannel Power":power.toFixed(1) //readout.temperature.toFixed(1)

    })
    const regex1 = /"(-?[0-9]+\.{0,1}[0-9]*)"/g
    data_grf_pwr = data_grf_pwr.replace(regex1, '$1')
    console.log(data_grf_pwr)
    client.publish("unisalento/smarthome/raspberry1/grafana/sensor/solar/power", data_grf_pwr);

    var data_grf_efc = JSON.stringify({
        "Pannel Efficiency":efficiency.toFixed(1) //readout.temperature.toFixed(1)

    })
    const regex2 = /"(-?[0-9]+\.{0,1}[0-9]*)"/g
    data_grf_efc = data_grf_efc.replace(regex2, '$1')
    console.log(data_grf_efc)
    client.publish("unisalento/smarthome/raspberry1/grafana/sensor/solar/efc", data_grf_efc);
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