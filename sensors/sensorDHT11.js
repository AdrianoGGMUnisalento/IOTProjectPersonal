const sensorLib = require('node-dht-sensor'); // include existing module called 'node-dht-sensor'
const http = require('http')

// Setup sensor, exit if failed
var sensorType = 11; // 11 for DHT11, 22 for DHT22 and AM2302
var sensorPin = 4; // The GPIO pin number for sensor signal
if (!sensorLib.initialize(sensorType, sensorPin))
{
    //print a warning message in the console
    console.warn('Failed to initialize sensor');
    process.exit(1);
}
// initialize the request

// Automatically update sensor value every 2 seconds
//we use a nested function (function inside another function)
setInterval(function() {
    var readout = sensorLib.read();

    console.log('Temperature:', readout.temperature.toFixed(1) + 'C');
    //console.log('Humidity: ', readout.humidity.toFixed(1) + '%');

    const data = JSON.stringify({
        'sensor': 'ID1',
        'timestamp': 12345678,
        'temperature': readout.temperature.toFixed(1)
    })

    const options = {

        hostname: '192.168.1.250',
        port: 3000,
        path: '/temperature',
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
