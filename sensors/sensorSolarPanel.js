const http = require('http')

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

// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    var readout = new SensorSolarPanel(500,true);//tengo que cambiarlo
    //console.log('Temperature:', readout.temperature.toFixed(1) + 'C');
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
}, 2000);