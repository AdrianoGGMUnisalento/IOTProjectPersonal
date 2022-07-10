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
            print("MySQL Database connection successful")
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

    def execute_query(connection, query):
        cursor = connection.cursor()
        try:
            cursor.execute(query)
            connection.commit()
            print("Query successful")
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
    ca_cert="../mysql-ssl/DigiCertGlobalRootCA.crt.pem"
    client = create_server_connection(host, username, pw)

    cdbconnection=create_db_connection(host,username,pw,db_name,ca_cert)
    q1="""select * from solar;
    """
    results=read_query( cdbconnection,q1)

    for r in results:
        print(r)





mqtt.Client.connected_flag=False#create flag in class
broker="mqtt.eclipseprojects.io"
client = mqtt.Client("mqttjs03")             #create new instance
client.on_connect=on_connect  #bind call back function
client.loop_start()
print("Connecting to broker ",broker)
client.connect(broker)      #connect to broker
while not client.connected_flag: #wait in loop
    msg=obtainpredictions()
    #print(msg[0])
    #client.publish("unisalento/smarthome/raspberry1/actuators/leds",json.dumps(msg[0]) )
    time.sleep(60)
print("in Main Loop")
client.loop_stop()    #Stop loop
client.disconnect() # disconnect

