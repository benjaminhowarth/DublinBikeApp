import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
import requests
import time

# Code taken from Aonghus's Notes

URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)


sql = """
CREATE DATABASE IF NOT EXISTS dublinbikedb;

"""

engine.execute(sql)

sql = """
CREATE TABLE IF NOT EXISTS static (
number INTEGER,
contract_name VARCHAR(256),
name VARCHAR(256),
address VARCHAR(256),
position_lat REAL,
position_lng REAL,
banking INTEGER,
bonus INTEGER
)
"""
try:
    res = engine.execute("DROP TABLE IF EXISTS static")
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

