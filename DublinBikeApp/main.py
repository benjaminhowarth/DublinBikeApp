from flask import Flask, g, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask import url_for
import json
import sqlite3
import functools
import pandas as pd
import time
import sys

app = Flask(__name__)

# Configure MySQL
URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"

def connect_to_database():
    engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                           .format(USER, PASSWORD, URI, PORT, DB), echo=True) 
    return engine

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

"""
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
"""
@app.route("/chartData/<int:station_number>")
@functools.lru_cache(maxsize=128)
def chartData(station_number):
    
    engine = get_db()
#     chartData = []
#    rows = engine.execute("SELECT available_bikes, bike_stands, DAYNAME(FROM_UNIXTIME(last_update/1000)) as Day, CONCAT(HOUR(FROM_UNIXTIME(last_update/1000)),':', MINUTE(FROM_UNIXTIME(last_update/1000))) as Time FROM dublinbikedb.static JOIN dublinbikedb.dynamic ON dublinbikedb.static.number = dublinbikedb.dynamic.number where dublinbikedb.static.number = '{}'".format(station_number))
    sql = """
    SELECT available_bikes, last_update
    FROM dublinbikedb.static 
    JOIN dublinbikedb.dynamic ON dublinbikedb.static.number = dublinbikedb.dynamic.number 
    WHERE dublinbikedb.static.number = '{}'
    """.format(station_number)
    
    df = pd.read_sql(sql, engine)
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    df['weekday'] = df['last_update'].dt.weekday_name
    df['dayofyear'] = df['last_update'].dt.dayofyear
    df['hour']=df['last_update'].dt.hour
    return df.to_json() 


@app.route("/chart/")
@functools.lru_cache(maxsize=128)
def chart():
    engine = get_db()
    sql = """
    SELECT dublinbikedb.static.number, available_bikes, last_update
    FROM dublinbikedb.static 
    JOIN dublinbikedb.dynamic ON dublinbikedb.static.number = dublinbikedb.dynamic.number 
    """
    
    df = pd.read_sql(sql, engine)
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    df.set_index(df["last_update"],inplace=True, drop=True)
    group = pd.DataFrame(df.groupby([df.number, df.index.dayofweek, df.index.hour]).mean().unstack(level=1))
    group.columns.set_levels(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],level=1,inplace=True)
    
    groupJson = {}
    
    for number, new_df in group.groupby(level=0):
        groupJson[str(number)] = {}
        for day in group['available_bikes'].columns:
            groupJson[str(number)][str(day)] = new_df['available_bikes'][day].reset_index(drop=True).tolist() 
    
    return json.dumps(groupJson)

@app.route("/stations")
@functools.lru_cache(maxsize=128)
def stations():
    engine = get_db()
    stations = engine.execute("SELECT * FROM dublinbikedb.newLatestDynamic")
    stationJson = []
    for i in stations:
        stationJson.append(dict(i)) 
    return jsonify(stationJson=stationJson)   

@app.route("/weather")
@functools.lru_cache(maxsize=128)
def weather():
    engine=get_db()
    weatherlist=[]
    weather = engine.execute("SELECT * FROM dublinbikedb.forecast")
    for i in weather:
        weatherlist.append(dict(i))
    return jsonify(weatherlist=weatherlist)

@app.route("/pastWeather")
def pastWeather():
    engine=get_db()
    pastWeatherList=[]
    weathersql = """
    SELECT * FROM dublinbikedb.weather
    """
    df2 = pd.read_sql(weathersql, engine)
    df2['time'] =  pd.to_datetime((df2['time']), unit='s')
    df2['weekday'] = df2['time'].dt.weekday_name
    df2['dayofyear'] = df2['time'].dt.dayofyear
    df2['hour'] = df2['time'].dt.hour
    return df2.to_json()

@app.route('/')
#@functools.lru_cache(maxsize=128)
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    
