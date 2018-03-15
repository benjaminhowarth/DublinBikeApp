import sqlalchemy
from sqlalchemy import *
import traceback
import glob
import os
import json
import pandas
from pandas.io.json import json_normalize

# Code taken from Aonghus's Notes

URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"
  
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)


def create_database():
    sql = """
    CREATE DATABASE IF NOT EXISTS dublinbikedb;     
    """
    try:   
        engine.execute(sql)
    except Exception as e:
        print(e)

def createStaticTable():     
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
        
def createWeatherTable():
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
        
def dropTable(tableName):
    sql = "DROP TABLE "+tableName
    try:
        engine.execute(sql)
    except Exception as e:
        print(e)

def openFile(file):
    if os.path.isfile(file) == True:
        myFile = open(file, 'r')
        myFile = myFile.read()
        return myFile
    else:
        print("Error - file path incorrect.")
        
def makeDF(input):
    myJson = json.loads(input)
    df = json_normalize(myJson, sep='_')
    return df

def write_to_static(df):
    df_static = df[['number', 'contract_name', 'name', 'address', 
                    'position_lat', 'position_lng', 'banking', 'bonus']]
    df_static.to_sql('static', engine, if_exists='replace', index=False)
    
def write_to_dynamic(df):
    df_dynamic = df[['number', 'status', 'bike_stands', 'available_bike_stands', 
                     'available_bikes', 'last_update']]   
    df_dynamic.to_sql('dynamic', engine, if_exists='append', index=False)

def write_to_weather(df):
    df2 = json_normalize(df['weather'][0])
    df2 = df2[['main', 'description']]
    df1 = df[['main_temp', 'main_pressure', 'wind_speed', 'visibility', 'sys_sunrise', 'sys_sunset', 'dt']]
    df_weather = pandas.concat([df2, df1], axis=1)
    df_weather = df_weather.rename(columns={'main_temp': 'temperature', 'main_pressure': 'pressure', 
                                            'sys_sunrise': 'sunrise', 'sys_sunset': 'sunset', 'dt': 'time'})
    df_weather.to_sql('weather', engine, if_exists='append', index=False)
    

    

