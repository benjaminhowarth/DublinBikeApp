import sqlalchemy
from sqlalchemy import create_engine
import traceback
import glob
import os
import json
import pandas
from pandas.io.json import json_normalize

URI="dublinbikedb.c3n1hjxadqkf.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikeDB"
PASSWORD = "password"
  
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)


def create_database():
    """Creates database in RDB instance."""
    
    sql = """
    CREATE DATABASE IF NOT EXISTS dublinbikedb;     
    """
    try:   
        engine.execute(sql)
    except Exception as e:
        print(e)

def createStaticTable(): 
    """
    Creates table for storing static station information that does not change.
    This table is updated once a day. Has 105 rows.
    """
        
    sql = """
    CREATE TABLE IF NOT EXISTS static (
    number INTEGER NOT NULL,
    contract_name VARCHAR(256),
    name VARCHAR(256),
    address VARCHAR(256),
    position_lat REAL,
    position_lng REAL,
    banking INTEGER,
    bonus INTEGER
    PRIMARY KEY (number)
    )
    """
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)

def createDynamicTable():
    """
    Creates table for storing historical dynamic station information.
    Dynamic station information for all stations is appended to the table every five minutes. 
    Has hundreds of thousands of rows.
    """
    
    sql = """
    CREATE TABLE IF NOT EXISTS dynamic (
    number INTEGER,
    status VARCHAR(256),
    bike_stands INTEGER,
    available_bike_stands INTEGER,
    available_bikes INTEGER,
    last_update BIGINT
    )
    """
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)
        
def createStationInformation():
    """
    Creates table for storing all current information about stations.
    This table updates every five minutes. Has 105 rows.   
    """
    
    sql = """
    CREATE TABLE IF NOT EXISTS stationInformation (
    number INTEGER NOT NULL,
    contract_name VARCHAR(256),
    name VARCHAR(256),
    address VARCHAR(256),
    position_lat REAL,
    position_lng REAL,
    banking INTEGER,
    bonus INTEGER,
    status VARCHAR(256),
    bike_stands INTEGER,
    available_bike_stands INTEGER,
    available_bikes INTEGER,
    last_update BIGINT,
    PRIMARY KEY (number)
    )
    """
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)
        
def createWeatherTable():
    """
    Creates table for storing historical weather information.
    The current Dublin weather forecast is appended to the table every 10 mins.
    Has a few thousand rows.
    """
    
    sql = """
    CREATE TABLE IF NOT EXISTS weather (
    main VARCHAR(256),
    description VARCHAR(256),
    temperature FLOAT(4),
    pressure INTEGER,
    wind_speed FLOAT(4),
    visibility DOUBLE,
    sunrise DOUBLE,
    sunset DOUBLE,
    time BIGINT
    )
    """
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)
    
def createForecastTable():
    """
    Creates table for storing current 5 day weather forecast.
    This table updates every 3 hours. Has 40 rows. 
    """
    
    sql = """
    CREATE TABLE IF NOT EXISTS forecast (
    main VARCHAR(256),
    description VARCHAR(256),
    temperature FLOAT(4),
    pressure INTEGER,
    wind_speed FLOAT(4),
    visibility DOUBLE,
    sunrise DOUBLE,
    sunset DOUBLE,
    time BIGINT
    )
    """
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)
      
def dropTable(tableName):
    """Function for dropping table from database."""
    
    sql = "DROP TABLE "+tableName
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)

def makeDF(input):
    """Loads JSON input and returns as pandas dataframe."""
    
    myJson = json.loads(input)
    df = json_normalize(myJson, sep='_')
    return df 

def write_to_static(input):
    """Writes JSON input to static table in RDB."""
    
    df = makeDF(input)
    df_static = df[['number', 'contract_name', 'name', 'address', 
                    'position_lat', 'position_lng', 'banking', 'bonus']]
    df_static.to_sql('static', engine, if_exists='replace', index=False)
    
def write_to_dynamic(input):
    """Writes JSON input to dynamic table in RDB."""
    
    df = makeDF(input)
    df_dynamic = df[['number', 'status', 'bike_stands', 'available_bike_stands', 
                     'available_bikes', 'last_update']]   
    df_dynamic.to_sql('dynamic', engine, if_exists='append', index=False)
    
def write_to_stationInformation(input):
    """Writes JSON input to stationInformation table in RDB."""
    
    df = makeDF(input)
    df_stationInformation = df[['number', 'contract_name', 'name', 'address', 
                    'position_lat', 'position_lng', 'banking', 'bonus', 'status', 'bike_stands', 'available_bike_stands', 
                     'available_bikes', 'last_update']] 
    df_stationInformation.to_sql('stationInformation', engine, if_exists='replace', index=False)

def write_to_weather(input):
    """Writes JSON input to weather table in RDB."""
    
    df = makeDF(input)
    df2 = json_normalize(df['weather'][0])
    df2 = df2[['main', 'description']]
    df1 = df[['main_temp', 'main_pressure', 'wind_speed', 'visibility', 'sys_sunrise', 'sys_sunset', 'dt']]
    df_weather = pandas.concat([df2, df1], axis=1)
    df_weather = df_weather.rename(columns={'main_temp': 'temperature', 'main_pressure': 'pressure', 
                                            'sys_sunrise': 'sunrise', 'sys_sunset': 'sunset', 'dt': 'time'})
    df_weather.to_sql('weather', engine, if_exists='append', index=False)

def write_to_forecast(input):
    """Writes JSON input to forecast table in RDB."""
    
    myJson = json.loads(input)
    myJsonMain=[]
    myJsonWeather = []
    myJsonWind =[]
    myJsonDt = []
    count= myJson['cnt']
    for i in range(count):
        myJsonMain.append(myJson['list'][i]['main'])
        myJsonWeather.append(myJson['list'][i]['weather'][0])
        myJsonWind.append(myJson['list'][i]['wind'])   
        myJsonDt.append(myJson['list'][i])
    myJsonMain=json_normalize(myJsonMain)
    myJsonDt=json_normalize(myJsonDt)
    myJsonWeather=json_normalize(myJsonWeather)
    myJsonWind=json_normalize(myJsonWind)
    dfMain = myJsonMain[['temp', 'pressure', 'humidity']]
    dfWeather=myJsonWeather[['main', 'description', 'icon']]
    dfDt=myJsonDt[['dt', 'dt_txt']]
    dfWind= myJsonWind
    dfWind= dfWind.rename(columns={'speed': 'windSpeed'})
    dfWind=dfWind[['windSpeed']]
    df_weather = pandas.concat([dfDt,dfWeather, dfMain, dfWind], axis=1)
    df_weather.to_sql('forecast', engine, if_exists='replace', index=False)

