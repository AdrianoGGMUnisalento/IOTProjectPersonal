import numpy as np
from paho.mqtt import client as mqtt
import requests
from bs4 import BeautifulSoup
import mysql.connector
from mysql.connector import Error
import pandas as pd
import time
import json
def on_connect(client, userdata, flags, rc):
    print("Connected with result code: %s" % rc)



def on_disconnect(client, userdata, rc):
    print("Disconnected with result code: %s" % rc)


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


def obtainpredictions():
    URL = "https://www.google.com/search?lr=lang_en&ie=UTF-8&q=weather"
    import argparse

    parser = argparse.ArgumentParser(description="Quick Script for Extracting Weather data using Google Weather")
    parser.add_argument("region", nargs="?", help="""Region to get weather for, must be available region.
                                        Default is your current location determined by your IP Address""", default="")
    # parse arguments
    args = parser.parse_args()
    region ="Lecce"#args.region
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

    def create_server_connection(host_name, user_name, user_password):
        connection = None
        try:
            connection = mysql.connector.connect(
                host=host_name,
                user=user_name,
                passwd=user_password
            )
            print("MySQL Database with server connection successful")
        except Error as err:
            print(f"Error: '{err}'")

        return connection

    def create_db_connection(host_name, user_name, user_password, db_name,ca_cert):
        connection = None
        try:
            connection = mysql.connector.connect(user= user_name, password=user_password,
                                  host=host_name, port=3306, database=db_name,
                                  ssl_ca=ca_cert, ssl_disabled=False)
            print("MySQL Database connection successful")
        except Error as err:
            print(f"Error: '{err}'")

        return connection

    def execute_query(connection, query,records):
        cursor = connection.cursor()
        try:

            cursor.execute('''CREATE TABLE IF NOT EXISTS grafana.recommendations (ConsumptionPrediction VARCHAR(512),PredictionBatery VARCHAR(255),Temperaturealert VARCHAR(255),EfficienceAlert VARCHAR(255))
    ''')
            cursor.executemany(query,records)
            connection.commit()
            print("Query INSERTING PREDICTIONS")
        except Error as err:
            print(f"Error: '{err}'")

    def read_query(connection,query):
        cursor = connection.cursor()
        result=None
        try:
            cursor.execute(query)
            result=cursor.fetchall()
            return result
        except Error as err:
            print(f"Error: '{err}'")

    pw="QmluZ28uMzIx"
    host="mysql-idalab.mysql.database.azure.com"
    username="idalabsqluser"
    db_name = "grafana"
    ca_cert="../DigiCertGlobalRootCA.crt.pem"
    client = create_server_connection(host, username, pw)

    cdbconnection=create_db_connection(host,username,pw,db_name,ca_cert)
    dictio = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
                      13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}
    y= []

    t=[]
    for i in range(0, 24):
        q1 = """SELECT PannelsPower FROM grafana.solar where HOUR(timestamp) =""" + str(i)
        f = dictio.get(i)
        results = read_query(cdbconnection, q1)
        for j in results:
            t.append(float(j[0]))
        f.append(t)
        t=[]
    print(dictio)

    dictavgPannels = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
                      13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}

    for i in range(0,24):
        v = dictavgPannels.get(i)
        v.append(np.average(dictio[i]))
    print("AVGENERGYPRODUCED:" + str(dictavgPannels))


    dictio = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [],
              14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}
    t = []
    for i in range(0, 24):
        q2 = """SELECT Consumption FROM grafana.electricmeter where HOUR(timestamp) =""" + str(i)
        v = dictio.get(i)
        results = read_query(cdbconnection, q2)
        for j in results:
            t.append(float(j[0])*1000)
        v.append(t)
        t = []
    print(dictio)
    dictavgEmeter = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
                      13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}

    # aqui bucle for que vaya iterando por los vectores y haciendo el average de np
    for i in range(0, 24):
        v = dictavgEmeter.get(i)
        v.append(np.average(dictio[i]))
    print("AVGENERGYCONSUMED:" +str(dictavgEmeter))


    #Because of linear regression wasn't behaving well with hours as variable we decided to create the functions from the average

    # q3 = """SELECT BatteryPower,HOUR(timestamp) FROM grafana.battery where Id = (SELECT LAST_INSERT_ID()) FROM grafana.battery)"""
    #q3 = """SELECT BatteryPower,HOUR(timestamp) FROM grafana.battery where timestamp= (SELECT MAX(timestamp) FROM grafana.battery)"""
    q3 = """SELECT BatteryPower,HOUR(timestamp) FROM grafana.battery """


    resul = read_query(cdbconnection, q3)
    results=resul[len(resul)-1]
    print("Last battery charge"+str(results))
    #We have to give it manually the wheights one important thing should be store the day weather in orther to future modelization
    #So we can obtain the true values of the weather
    WeatherFactor = 0
    if "Soleggiato" in data['weather_now'] or "soleggiato" in data['weather_now']:
        print("sunny applying 1 factor")
        WeatherFactor=1
    if "Nuvoloso" in data['weather_now'] or "nuvoloso" in data['weather_now'] or "nuvolosità" in data['weather_now']:
        print("cloudy applying 0.40 factor")
        WeatherFactor = 0.4
    if "Temporali"in data['weather_now'] or "temporali"in data['weather_now'] or "Temporale" in data['weather_now'] \
            or"temporale"in data['weather_now'] or "Rovesci"in data['weather_now'] or "rovesci" in data['weather_now'] or 'pioggia' in data['weather_now'] or 'Pioggia' in data['weather_now']:
        print("raining applying 0.15 factor")
        WeatherFactor = 0.15

    predictionbat = []

    prediction = []

    #{0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
     #13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: []}

    # REVISION
    #SUBSTRACTING THE AVG PANNEL & AVG CONSUMPTION TO WHITH BATTERY TO BATTERY PREDICTION:
    voltaje = 3.6
    maxCAP = 4000
    hora=int(results[1])
    op = float(results[0])
    print(hora)
    print(op)
    # PREDICTION OF BATTERY STATUS IN THE NEXT 24 HOUR

    for i in range(hora, hora + 24):
        op += (WeatherFactor * dictavgPannels.get(i % 24)[0] - dictavgEmeter.get(i % 24)[0]) / voltaje  # We are calculating in voltajes
        if op==0 :
            op=0
        predictionbat.append(round(op,3))
    print("Expected PredBattery from this hour"+str(predictionbat))


    #PREDICTION OF THE AMOUNT ENERGY WE ARE PRODUCING/CONSUMING PER HOUR
    for i in range(0, 24):

        g = (WeatherFactor * dictavgPannels.get(i % 24)[0] - dictavgEmeter.get(i % 24)[0] )/ voltaje  # We are calculating in voltajes
        prediction.append(round(g,3))
    print("Expected Consumption: " + str(prediction))

    Lights = "Off"
    TurnonTurnoffinterval = [12,23]  # So if the hours are in this interval it will turn on for try purposes we are letting it as 12 23
    # if Battery % >20 && TurnonTurnoff Lights ON
    if (predictionbat[4] / maxCAP) > 0.1 and hora >= TurnonTurnoffinterval[0] and hora <= TurnonTurnoffinterval[1]:
        Lights = "On"

    # SOLAR PANEL RECOMENDATION IF SOLAR PANNEL EFFICENCY <40 && SUNNY DAY GENERATES AN ALERT OF CLEANNING/BROKEN PANNEL
    q5 = """SELECT Pannelsefficiency,HOUR(timestamp) FROM grafana.solar where timestamp= (SELECT MAX(timestamp) FROM grafana.solar)"""
    results = read_query(cdbconnection, q5)
    efficiency = float(results[0][0])
    hour=float(results[0][1])
    efficience=None
    if  efficiency< 65 and WeatherFactor==1 and hour<=17 and hour>=10:
        efficience="You need to check your solar Pannels its sunny and the efficiency its don the 65%"


    #TEMPERATURE RECOMENDATION IF THE TEMP ITS IN ONE OF THE 3 INTERVALS GENERATES A RECOMENDATION.
    q4 = """SELECT temperature,HOUR(timestamp) FROM grafana.sensordth11 where timestamp= (SELECT MAX(timestamp) FROM grafana.sensordth11)"""
    results = read_query(cdbconnection, q4)
    temp = float(results[0][0])
    Temp = None
    print("TEMP"+str(results))
    if  temp<12:
        Temp="TemperatureThe house has a cold temperature we suggest to put the heating if you are at home:"+str(temp)
    if  temp >=25 and temp<30:
        Temp="Temperature The house has an very high temperature we reccomend to put the AC: "+str(temp)
    if temp >= 34 and temp < 42:
        Temp = "Temperature ALERT: The house has an anormally high temperature mind about a possible fire:"+str(temp)
    msg = {"light": Lights}




    recomendation = [(str(prediction),str(predictionbat[0:5]),Temp,efficience)]

    query="""INSERT INTO grafana.recommendations (ConsumptionPrediction,PredictionBatery,Temperaturealert,EfficienceAlert) 
                               VALUES 
                               (%s, %s, %s, %s) """
    execute_query(cdbconnection, query,recomendation)

    return msg








mqtt.Client.connected_flag=False#create flag in class
broker="20.216.178.106"
port = 1883
client = mqtt.Client()             #create new instance
client.on_connect=on_connect  #bind call back function
client.loop_start()
print("Connecting to broker ",broker)
client.connect(broker,port)      #connect to broker
while not client.connected_flag: #wait in loop
    msg=obtainpredictions() #obtains the predictions with the function above
    client.publish("unisalento/smarthome/raspberry1/actuators/leds",json.dumps(msg) )
    time.sleep(15)
print("in Main Loop")
client.loop_stop()    #Stop loop
client.disconnect() # disconnect

