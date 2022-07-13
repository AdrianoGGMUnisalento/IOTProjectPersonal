// Default URL for triggering event grid function in the local environment.
// http://localhost:7071/runtime/webhooks/EventGrid?functionName={functionname}
using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using System.Net.Http;
using Azure.Core.Pipeline;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Azure;
namespace smartbuildingingestfuntion
{
    public static class Function1
    {
        private static readonly string adtInstanceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");
        private static readonly HttpClient singletonHttpClientInstance = new HttpClient();
        [FunctionName("Hub2Twin")]
#pragma warning disable AZF0001 // Suppress async void error

        public async static void Run([EventGridTrigger] EventGridEvent eventGridEvent, ILogger log)
#pragma warning restore AZF0001 // Suppress async void error
        {
            if (adtInstanceUrl == null) log.LogError("Application setting \"ADT_SERVICE_URL\" not set");
            var cred = new DefaultAzureCredential();
            var client = new DigitalTwinsClient(new Uri(adtInstanceUrl), cred);

            log.LogInformation($"ADT service client connection created.");
            //==========================================
            // Create new digital twin
            // <CreateTwin_withHelper>
            string twinId = "DHT11sensor";
            var initData = new BasicDigitalTwin
            {
                Id = twinId,
                Metadata = { ModelId = "dtmi:com:example:DHT11sensor;1" },
                // Initialize properties
                Contents =
                {
                    { "temperature", 25.0 },
                    { "timestamp", "2022-07-21 08:36:32" },
                    { "sensor", "temperature sensor" },
                },
            };

            // <CreateTwinCall>
            await client.CreateOrReplaceDigitalTwinAsync<BasicDigitalTwin>(twinId, initData);
            // </CreateTwinCall>
            // </CreateTwin_withHelper>
            Console.WriteLine("Twin created successfully");
            //============================================
            //==========================================
            // Create new digital twin
            // <CreateTwin_withHelper>
            string twinId_solar = "SensorSolarPanel";
            var initData_solar = new BasicDigitalTwin
            {
                Id = twinId_solar,
                Metadata = { ModelId = "dtmi:com:example:SensorSolarPanel;1" },
                // Initialize properties
                Contents =
                {
                    { "PannelsPower", 250.0 },
                    { "timestamp", "2022-07-21 08:36:32" },
                    { "sensor", "SensorSolarPanel" },
                    { "Pannelsefficiency", 41.00 },
                },
            };

            // <CreateTwinCall>
            await client.CreateOrReplaceDigitalTwinAsync<BasicDigitalTwin>(twinId_solar, initData_solar);
            // </CreateTwinCall>
            // </CreateTwin_withHelper>
            Console.WriteLine("Twin created successfully");
            //============================================
            //==========================================
            // Create new digital twin
            // <CreateTwin_withHelper>
            string twinId_meter = "HouseSmartElectricMeter";
            var initData_meter = new BasicDigitalTwin
            {
                Id = twinId_meter,
                Metadata = { ModelId = "dtmi:com:example:HouseSmartElectricMeter;1" },
                // Initialize properties
                Contents =
                {
                    { "Consumption", 250.0 },
                    { "timestamp", "2022-07-21 08:36:32" },
                    { "sensor", "HouseSmartElectricMeter" },
                },
            };

            // <CreateTwinCall>
            await client.CreateOrReplaceDigitalTwinAsync<BasicDigitalTwin>(twinId_meter, initData_meter);
            // </CreateTwinCall>
            // </CreateTwin_withHelper>
            Console.WriteLine("Twin created successfully");
            //============================================
            //==========================================
            // Create new digital twin
            // <CreateTwin_withHelper>
            string twinId_Battery = "Battery";
            var initData_Battery = new BasicDigitalTwin
            {
                Id = twinId_Battery,
                Metadata = { ModelId = "dtmi:com:example:Battery;1" },
                // Initialize properties
                Contents =
                {
                    { "BatteryPower", 250.0 },
                    { "timestamp", "2022-07-21 08:36:32" },
                    { "sensor", "Battery" },
                    {"BatteryCharge",3209.0 },
                },
            };

            // <CreateTwinCall>
            await client.CreateOrReplaceDigitalTwinAsync<BasicDigitalTwin>(twinId_Battery, initData_Battery);
            // </CreateTwinCall>
            // </CreateTwin_withHelper>
            Console.WriteLine("Twin created successfully");
            //============================================
            try
            {
                

                if (eventGridEvent != null && eventGridEvent.Data != null)
                {
                    log.LogInformation(eventGridEvent.Data.ToString());

                    // convert the message into a json object
                    JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(eventGridEvent.Data.ToString());

                    // get our device id, temp and humidity from the object
                    string deviceId = (string)deviceMessage["systemProperties"]["iothub-connection-device-id"];
                    











                    

                    if (deviceId == "DHT11sensor")
                    {
                        log.LogInformation($"I am inside if else --->, { deviceId}");
                        log.LogInformation($"I am inside --->,{deviceId}");
                        var temperature = deviceMessage["body"]["temperature"];
                        var sensorid = deviceMessage["body"]["sensor"];
                        var timestmp = deviceMessage["body"]["timestamp"];
                        //log the temperature and humidity
                        log.LogInformation($"Device:{deviceId} Timestamp is:{timestmp}");
                        log.LogInformation($"Device:{deviceId} Sensor is:{sensorid}");
                        log.LogInformation($"Device:{deviceId} Temperature is:{temperature}");

                        // Update twin with temperature and humidity from our raspberry pi>
                        var updateTwinData = new JsonPatchDocument();
                        updateTwinData.AppendReplace("/temperature", temperature.Value<double>());
                        updateTwinData.AppendReplace("/sensor", sensorid.Value<string>());
                        updateTwinData.AppendReplace("/timestamp", timestmp.Value<string>());

                        //updateTwinData.AppendReplace("/Humidity", humidity.Value<double>());
                        await client.UpdateDigitalTwinAsync("DHT11sensor", updateTwinData);

                    }
                    else if (deviceId == "SensorSolarPanel")
                    {
                        log.LogInformation($"I am inside if else --->, { deviceId}");
                        log.LogInformation($"I am inside --->, {deviceId}");
                        var PannelsPower = deviceMessage["body"]["PannelsPower"];
                        var sensorid_pp = deviceMessage["body"]["sensor"];
                        var timestmp_pp = deviceMessage["body"]["timestamp"];
                        var Pannelsefficiency = deviceMessage["body"]["Pannelsefficiency"];
                        //log the temperature and humidity
                        log.LogInformation($"Device:{deviceId} Timestamp is: {timestmp_pp}");
                        log.LogInformation($"Device:{deviceId} Sensor is: {sensorid_pp}");
                        log.LogInformation($"Device:{deviceId} PannelsPower is: {PannelsPower}");
                        log.LogInformation($"Device:{deviceId} Pannelsefficiency is: {Pannelsefficiency}");
                        // Update twin with temperature and humidity from our raspberry pi>
                        var updateTwinData_pp = new JsonPatchDocument();
                        updateTwinData_pp.AppendReplace("/PannelsPower", PannelsPower.Value<double>());
                        updateTwinData_pp.AppendReplace("/sensor", sensorid_pp.Value<string>());
                        updateTwinData_pp.AppendReplace("/timestamp", timestmp_pp.Value<string>());
                        updateTwinData_pp.AppendReplace("/Pannelsefficiency", Pannelsefficiency.Value<double>());

                        //updateTwinData.AppendReplace("/Humidity", humidity.Value<double>());
                        await client.UpdateDigitalTwinAsync("SensorSolarPanel", updateTwinData_pp);

                    }
                    else if (deviceId == "HouseSmartElectricMeter")
                    {
                        log.LogInformation($"I am inside if else --->, {deviceId}");
                        log.LogInformation($"I am inside --->, {deviceId}");
                        var Consumption = deviceMessage["body"]["Consumption"];
                        var sensorid_em = deviceMessage["body"]["sensor"];
                        var timestmp_em = deviceMessage["body"]["timestamp"];
                        //log the temperature and humidity
                        log.LogInformation($"Device:{deviceId} Timestamp is: {timestmp_em}");
                        log.LogInformation($"Device:{deviceId} Sensor is: {sensorid_em}");
                        log.LogInformation($"Device:{deviceId} Consumption is: {Consumption}");
                        // Update twin with temperature and humidity from our raspberry pi>
                        var updateTwinData_em = new JsonPatchDocument();
                        updateTwinData_em.AppendReplace("/Consumption", Consumption.Value<double>());
                        updateTwinData_em.AppendReplace("/sensor", sensorid_em.Value<string>());
                        updateTwinData_em.AppendReplace("/timestamp", timestmp_em.Value<string>());

                        //updateTwinData.AppendReplace("/Humidity", humidity.Value<double>());
                        await client.UpdateDigitalTwinAsync("HouseSmartElectricMeter", updateTwinData_em);

                    }
                    else if (deviceId == "Battery")
                    {
                        log.LogInformation($"I am inside if else --->, {deviceId}");
                        log.LogInformation($"I am inside --->, {deviceId}");
                        var BatteryPower = deviceMessage["body"]["BatteryPower"];
                        var sensorid_b = deviceMessage["body"]["sensor"];
                        var timestmp_b = deviceMessage["body"]["timestamp"];
                        var BatteryCharge = deviceMessage["body"]["BatteryCharge"];
                        //log the temperature and humidity
                        log.LogInformation($"Device:{deviceId} Timestamp is: {timestmp_b}");
                        log.LogInformation($"Device:{deviceId} Sensor is: {sensorid_b}");
                        log.LogInformation($"Device:{deviceId} BatteryPower is: {BatteryPower}");
                        log.LogInformation($"Device:{deviceId} BatteryCharge is: {BatteryCharge}");
                        // Update twin with temperature and humidity from our raspberry pi>
                        var updateTwinData_b = new JsonPatchDocument();
                        updateTwinData_b.AppendReplace("/BatteryPower", BatteryPower.Value<double>());
                        updateTwinData_b.AppendReplace("/sensor", sensorid_b.Value<string>());
                        updateTwinData_b.AppendReplace("/timestamp", timestmp_b.Value<string>());
                        updateTwinData_b.AppendReplace("/BatteryCharge", BatteryCharge.Value<double>());

                        //updateTwinData.AppendReplace("/Humidity", humidity.Value<double>());
                        await client.UpdateDigitalTwinAsync("Battery", updateTwinData_b);
                    }
                    else
                    {
                        log.LogError("Error in if else condition, no digital twin found");
                    }

                }
            }

            catch (Exception ex)
            {
                log.LogError($"Error in ingest function: {ex.Message}");
            }

        }
    }
}
