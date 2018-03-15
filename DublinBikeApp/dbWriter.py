import sqlalchemy
from sqlalchemy import *
import traceback
import glob
import os
import requests
import time
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
    current_temperature FLOAT(4),
    pressure INTEGER,
    wind_speed FLOAT(4),
    visibility DOUBLE,
    sunrise DOUBLE,
    sunset DOUBLE
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

file = "./data/bikes_2018-03-12_14:33:30.218089"

def write_to_db(file):
    if os.path.isfile(file) == True:
        myFile = open(file, 'r')
        myFile = myFile.read()
        myJson = json.loads(myFile)
        df = json_normalize(myJson, sep='_')
        write_to_static(df)
    else:
        print("Error - file path incorrect.")

def write_to_static(df):
    df_static = df[['number', 'contract_name', 'name', 'address', 
                    'position_lat', 'position_lng', 'banking', 'bonus']]
    df_static.to_sql('static', engine, if_exists='replace', index=False)
    
def write_to_dynamic(df):
    df_dynamic = df[['number', 'status', 'bike_stands', 'available_bike_stands', 
                     'available_bikes', 'last_update']]   
    df_dynamic.to_sql('dynamic', engine, if_exists='append', index=False)
        
write_to_db(file)

#

