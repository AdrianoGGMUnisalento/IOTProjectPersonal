const http = require('http')
var mqtt=require('mqtt');


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
// initialize the request
var HostName="DemoSmartHome.azure-devices.net";
var DeviceId="Battery";
var broker="mqtts://DemoSmartHome.azure-devices.net:8883/";
var sharedacces="SharedAccessSignature sr=DemoSmartHome.azure-devices.net%2Fdevices%2FBattery&sig=4K%2FrpW068MIvaT9ovccnx0Nh7aOGonNVm2ZwZo3efxg%3D&se=1659682224";
var username="DemoSmartHome.azure-devices.net/Battery/?api-version=2021-04-12";


var client = mqtt.connect("mqtt://mqtt.eclipseprojects.io",{clientId:"mqttjs01"});
//var client = mqtt.connect("mqtt://localhost:1883");

var azclient = mqtt.connect(broker,{clientId:"Battery",protocolId: 'MQTT',
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
var readout = new Battery(4000.0,100,);
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
    var sql = "CREATE TABLE IF NOT EXISTS battery (timestamp  TIMESTAMP, sensor VARCHAR(255), BatteryPower DECIMAL (5,1), BatteryCharge DECIMAL (3,1))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");

    });
});

// =========== End of code for MySql approach===============//



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
    client.publish("unisalento/smarthome/raspberry1/SensorBattery", data);
    azclient.publish("devices/Battery/messages/events/", data);


    // =========== this below code is for MySql approach===============//


    var myDate =  timestamp;
    console.log(myDate)
    var pwr = power.toFixed(1);
    var chg = Charge.toFixed(1)
    console.log("power is: ",pwr)
    console.log("Charge is: ",chg)



    var sql = "INSERT INTO battery (timestamp,sensor,BatteryPower,BatteryCharge  ) VALUES (?,?,?,?)";
    con.query(sql, [myDate, "Battery" ,pwr,chg], function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

//======================================================================//




    // ============this below code is for mqtt dashboard ==========//
    var data_grf_pwr = JSON.stringify({
        "Battery Power":power.toFixed(1) //readout.temperature.toFixed(1)

    })
    const regex1 = /"(-?[0-9]+\.{0,1}[0-9]*)"/g
    data_grf_pwr = data_grf_pwr.replace(regex1, '$1')
    console.log(data_grf_pwr)
    client.publish("unisalento/smarthome/raspberry1/grafana/sensor/battery/power", data_grf_pwr);

    var data_grf_efc = JSON.stringify({
        "Battery Charge":Charge.toFixed(1) //readout.temperature.toFixed(1)

    })
    const regex2 = /"(-?[0-9]+\.{0,1}[0-9]*)"/g
    data_grf_efc = data_grf_efc.replace(regex2, '$1')
    console.log(data_grf_efc)
    client.publish("unisalento/smarthome/raspberry1/grafana/sensor/battery/efc", data_grf_efc);
// ==================================================================//
    date.setMinutes(date.getMinutes() + minutes);
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