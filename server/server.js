const sensorLib = require('node-dht-sensor'); // include existing module called 'node-dht-sensor'
const http = require('http')
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Hello World!');
    res.end();
}).listen(8080);