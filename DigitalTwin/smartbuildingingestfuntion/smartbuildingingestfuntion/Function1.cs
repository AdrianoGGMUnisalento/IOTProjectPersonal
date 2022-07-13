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
            try
            {
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
                //============================================
                // <CreateTwinCall>
                await client.CreateOrReplaceDigitalTwinAsync<BasicDigitalTwin>(twinId, initData);
                // </CreateTwinCall>
                // </CreateTwin_withHelper>
                Console.WriteLine("Twin created successfully");


                if (eventGridEvent != null && eventGridEvent.Data != null)
                {
                    log.LogInformation(eventGridEvent.Data.ToString());

                    // convert the message into a json object
                    JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(eventGridEvent.Data.ToString());

                    // get our device id, temp and humidity from the object
                    string deviceId = (string)deviceMessage["systemProperties"]["iothub-connection-device-id"];

                    if (deviceMessage.GetValue("body").HasValues)
                    {
                        log.LogInformation("it has values");

                    }
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
                    await client.UpdateDigitalTwinAsync(deviceId, updateTwinData);
                }
            }

            catch (Exception ex)
            {
                log.LogError($"Error in ingest function: {ex.Message}");
            }

        }
    }
}
