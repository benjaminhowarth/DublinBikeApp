import sqlalchemy
from sqlalchemy import *
import traceback
import glob
import os
import requests
import time
import json

# Code taken from Aonghus's Notes

URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"
  
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)


def create_tables():
    sql = """
    CREATE DATABASE IF NOT EXISTS dublinbikedb;
     
    """     
    engine.execute(sql)
     
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
        res = engine.execute(sql)
        print(res.fetchall())
    except Exception as e:
        print(e)
     
    sql = """
    CREATE TABLE IF NOT EXISTS dynamic (
    number INTEGER,
    status VARCHAR(256),
    bike_stands INTEGER,
    available_bike_stands INTEGER,
    available_bikes INTEGER,
    last_update INTEGER
    )
    """
    try:
        res = engine.execute(sql)
        print(res.fetchall())
    except Exception as e:
        print(e)

file = "./data/bikes_2018-03-12_14:18:22.696111"

def write_to_db(file):
    if os.path.isfile(file) == True:
        myFile = open(file, 'r')
        myFile = myFile.read()
        myJson = json.loads(myFile)
        count = 0
        while count < len(myJson):
            write_to_static(myJson[count])
            count += 1    
    else:
        print("Error - file path incorrect.")

def write_to_static(myJson):
    metadata = MetaData(bind=engine)
    static = Table('static', metadata, autoload=True)

    ins = static.insert()
    ins.execute(number=myJson['number'], contract_name=myJson['contract_name'], name=myJson['name'], 
                address=myJson['address'], position_lat=myJson['position']['lat'], position_lng=myJson['position']['lng'], 
                banking=myJson['banking'], bonus=myJson['bonus'])
        
write_to_db(file)

#

