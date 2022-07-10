from bs4 import BeautifulSoup as bs
import requests

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
# US english
LANGUAGE = "en-US,en;q=0.5"


def get_weather_data(url):
    session = requests.Session()
    session.headers['User-Agent'] = USER_AGENT
    session.headers['Accept-Language'] = LANGUAGE
    session.headers['Content-Language'] = LANGUAGE
    html = session.get(url)
    # create a new soup
    soup = bs(html.text, "html.parser")
    # store all results on this dictionary
    result = {}
    # extract region
    result['region'] = soup.find("div", attrs={"id": "wob_loc"}).text
    # extract temperature now
    result['temp_now'] = soup.find("span", attrs={"id": "wob_tm"}).text
    # get the day and hour now
    result['dayhour'] = soup.find("div", attrs={"id": "wob_dts"}).text
    # get the actual weather
    result['weather_now'] = soup.find("span", attrs={"id": "wob_dc"}).text
    # get the precipitation
    result['precipitation'] = soup.find("span", attrs={"id": "wob_pp"}).text
    # get the % of humidity
    result['humidity'] = soup.find("span", attrs={"id": "wob_hm"}).text
    # extract the wind
    result['wind'] = soup.find("span", attrs={"id": "wob_ws"}).text
    # get next few days' weather
    next_days = []
    days = soup.find("div", attrs={"id": "wob_dp"})
    for day in days.findAll("div", attrs={"class": "wob_df"}):
        # extract the name of the day
        day_name = day.findAll("div")[0].attrs['aria-label']
        # get weather status for that day
        weather = day.find("img").attrs["alt"]
        temp = day.findAll("span", {"class": "wob_t"})
        # maximum temparature in Celsius, use temp[1].text if you want fahrenheit
        max_temp = temp[0].text
        # minimum temparature in Celsius, use temp[3].text if you want fahrenheit
        min_temp = temp[2].text
        next_days.append({"name": day_name, "weather": weather, "max_temp": max_temp, "min_temp": min_temp})
    # append to result
    result['next_days'] = next_days
    return result


if __name__ == "__main__":
    URL = "https://www.google.com/search?lr=lang_en&ie=UTF-8&q=weather"
    import argparse

    parser = argparse.ArgumentParser(description="Quick Script for Extracting Weather data using Google Weather")
    parser.add_argument("region", nargs="?", help="""Region to get weather for, must be available region.
                                        Default is your current location determined by your IP Address""", default="")
    # parse arguments
    args = parser.parse_args()
    region = "New York"#args.region
    if region:
        region = region.replace(" ", "+")
        URL += f"+{region}"
    # get data
    data = get_weather_data(URL)
    # print data
    print("Weather for:", data["region"])
    print("Now:", data["dayhour"])
    print(f"Temperature now: {data['temp_now']}°C")
    print("Description:", data['weather_now'])
    print("Precipitation:", data["precipitation"])
    print("Humidity:", data["humidity"])
    print("Wind:", data["wind"])
    print("Next days:")
    for dayweather in data["next_days"]:
        print("=" * 40, dayweather["name"], "=" * 40)
        print("Description:", dayweather["weather"])
        print(f"Max temperature: {dayweather['max_temp']}°C")
        print(f"Min temperature: {dayweather['min_temp']}°C")


        #Temporali sparsi  ,Soleggiato, Temporale,  Per lo più soleggiato, Parzialmente nuvoloso,  Nuvoloso ,Rovesci,Per lo più nuvoloso Temporali isolat


    mydatabase = client["SmartHomeDB"]
    collectionSolarPanel = mydatabase.SolarPanel

    # To find() all the entries inside collection name 'myTable'
    SPanel = collectionSolarPanel.find({}, { "timestamp":1,"Power":1})

    #SOLAR PANEL AVG
    pos=0
    dictio={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]}
    avgenergyproduced=0
    for i in SPanel:
        key=int(i["timestamp"][8:10])
        v=dictio.get(key)
        v.append(i["Power"])
        pos+=1
    print(dictio)
    dictavgPannels={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]}
    mean=0
    for i in range(0,24):
        v=dictio.get(i)
        mean = 0
        for j in v:
            mean+=float(j)/len(v)
        t = dictavgPannels.get(i)
        t.append(mean)
        avgenergyproduced+=mean
    print(dictavgPannels)
    print("AVGENERGYPRODUCED:"+str(avgenergyproduced))
    #ENERGY CONSUMPTION
    collectionElectricMeter = mydatabase.HouseSmartElectricMeter
    EnergyConsumption = collectionElectricMeter.find({}, {"timestamp":1,"Consumption":1})

    pos=0
    dictio={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]}
    avgconsump=0
    for i in EnergyConsumption:
        key=int(i["timestamp"][8:10])
        v=dictio.get(key)
        v.append(i["Consumption"]) #we are passing it to W because its in KW
        pos+=1
    print(dictio)
    dictavgConsumption={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]}
    mean=0

    for i in range(0,24):
        v=dictio.get(i)
        mean = 0
        for j in v:
            mean+=float(j)/len(v)*1000
        t = dictavgConsumption.get(i)
        t.append(mean)
        avgconsump +=mean
    print(dictavgConsumption)
    print("AVGENERGYCONSUMED:"+str(avgconsump))

#REDUCCION EN DIAS NUBLADOS DESDE UN 25 A UN 10% DE LO QUE PRODUCE NORMALmENTE  (REVISABLE)

#Para saber el estado predictivo de la batería primero observamos el ultimo estado actualizado de la batería en nuestra base de datos
    collectionBattery = mydatabase.Battery
#Battery = collectionBattery.find({},{"timestamp":1,"BatteryPower":1})
    Battery = collectionBattery.find({}, {"timestamp": 1, "BatteryPower": 1}).sort("timestamp", -1)
    batterystatus=Battery[0]
    print("Battery STATUS :"+ str(batterystatus))

    WeatherFactor = 0
#Because our SolarPanel its based on a SunnyDay Generator and its to complex to generate without having data a model to generate
#Calculamos la resta ponderada para saber el consumo que se tendra con el estado del día.
    if "Soleggiato" in data['weather_now'] or "soleggiato" in data['weather_now']:
        print("sunny applying 1 factor")
        WeatherFactor=1
    if "Nuvoloso" in data['weather_now'] or "nuvoloso" in data['weather_now']:
        print("cloudy applying 0.40 factor")
        WeatherFactor = 0.4
    if "Temporali"in data['weather_now'] or "temporali"in data['weather_now'] or "Temporale" in data['weather_now'] \
            or"temporale"in data['weather_now'] or "Rovesci"in data['weather_now'] or "rovesci" in data['weather_now'] or 'pioggia' in data['weather_now'] or 'Pioggia' in data['weather_now']:
        print("raining applying 0.15 factor")
        WeatherFactor = 0.15



    hora=int(batterystatus["timestamp"][8:10])
    predictionbat = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
                          13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}

    prediction = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
                     13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}



    voltaje=3.6
    maxCAP=4000
    op=batterystatus["BatteryPower"]
    for i in range(hora,hora+24):
        pr=predictionbat.get(i%24)
        op+=(WeatherFactor * dictavgPannels.get(i%24)[0] - dictavgConsumption.get(i%24)[0]) / voltaje #We are calculating in voltajes
        pr.append(op)
    print(predictionbat)

    Lights="Off"
    TurnonTurnoffinterval=[0,23] #So if the hours are in this interval it will turn on for try purposes we are letting it as 12 23
    #if Battery % >20 && TurnonTurnoff Lights ON
    if predictionbat.get(hora+4)[0]/maxCAP>0.1 and hora >= TurnonTurnoffinterval[0] and hora <=TurnonTurnoffinterval[1]:
            Lights="On"

    for i in range(0,24):
        pr=prediction.get(i%24)
        g=(WeatherFactor * dictavgPannels.get(i%24)[0] - dictavgConsumption.get(i%24)[0]) / voltaje #We are calculating in voltajes
        pr.append(g)
    print("Expected Consumption: "+str(prediction))

    msg={"light":Lights}
    recomendation={"Prediction":prediction}
    ms=[msg,recomendation]
    return ms
#Guardamos en un dict/vect la predicción de la batería que hacemos

#De acuerdo a lo obtenido por las predicciones si en las siguientes 5horas no se estima bajar del 20% de bateria lanzara los actuadores

"""
broker = "mqtt.eclipseprojects.io"
deviceID = "RecomedationSystem"
client = mqtt.Client("mqttjs03")
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.tls_set_context(None)
client.tls_insecure_set(True)  # You can also set the proper certificate using client.tls_set()
client.connect(broker,1883)
client.publish("unisalento/smarthome/raspberry1/actuators/leds",)
time.sleep(4)
client.loop_forever()
"""

mqtt.Client.connected_flag=False#create flag in class
broker="mqtt.eclipseprojects.io"
client = mqtt.Client("mqttjs03")             #create new instance
client.on_connect=on_connect  #bind call back function
client.loop_start()
print("Connecting to broker ",broker)
client.connect(broker)      #connect to broker
while not client.connected_flag: #wait in loop
    msg=obtainpredictions()
    print(msg[0])
    client.publish("unisalento/smarthome/raspberry1/actuators/leds",json.dumps(msg[0]) )
    time.sleep(60)
print("in Main Loop")
client.loop_stop()    #Stop loop
client.disconnect() # disconnect
"""iotHub = "DemoSmartHome.azure-devices.net"
deviceID = "RecomedationSystem"
deviceKey = "Sj_PLACE_REAL_KEY_HERE_VQwXU="
azclient = mqtt.Client(client_id=deviceID, protocol=mqtt.MQTTv311)
azclient.on_connect = on_connect
azclient.on_disconnect = on_disconnect
azclient.username_pw_set(username=iotHub + "/" + deviceID,password="SAS")
azclient.tls_set_context(context=None)

azclient.tls_insecure_set(True)  # You can also set the proper certificate using client.tls_set()
azclient.connect(iotHub, port=8883)
azclient.publish()
azclient.loop_forever()
"""

