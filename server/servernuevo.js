const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost/SmartHomeDB';

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json());
app.post("/SolarPanels", (req, res, next) => {
    console.log(req.body.PannelsPower);
    var pannelsPower = req.body.PannelsPower;
    var timestamp = req.body.timestamp;
    var sensor = req.body.sensor;
    var pannelsEfficency =req.body.Pannelsefficiency;
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    console.log(pannelsEfficency);
    async function run() {

        try {

            await client.connect();

            const database = client.db("SmartHomeDB");
            const SolarColl = database.collection("SolarPanel");
            // create a document to be inserted
            const doc = {
                Power: pannelsPower,
                timestamp: timestamp,
                sensorId: sensor,
                efficiency: pannelsEfficency,
                panelId: 'panel1'
            };

            const result = await SolarColl.insertOne(doc);
            console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,);
        } finally {
            await client.close();
        }
    }
    run().catch(console.dir);
    res.sendStatus(200)
});

