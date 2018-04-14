from flask import Flask, g, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask import url_for
import json
import sqlite3
import functools
import pandas as pd

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
#

@app.route("/chart/<int:station_number>")
@functools.lru_cache(maxsize=128)
def chart(station_number):
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
    
    mon = df.loc[df.weekday =='Monday'][['available_bikes', 'last_update']]
    tue = df.loc[df.weekday =='Tuesday'][['available_bikes', 'last_update']]
    wed = df.loc[df.weekday =='Wednesday'][['available_bikes', 'last_update']]
    thu = df.loc[df.weekday =='Thursday'][['available_bikes', 'last_update']]
    fri = df.loc[df.weekday =='Friday'][['available_bikes', 'last_update']]
    sat = df.loc[df.weekday =='Saturday'][['available_bikes', 'last_update']]
    sun = df.loc[df.weekday =='Sunday'][['available_bikes', 'last_update']]
    
    mon_av = pd.DataFrame(mon.groupby(mon.last_update.dt.hour).mean().round())
    tue_av = pd.DataFrame(tue.groupby(tue.last_update.dt.hour).mean().round())
    wed_av = pd.DataFrame(wed.groupby(wed.last_update.dt.hour).mean().round())
    thu_av = pd.DataFrame(thu.groupby(thu.last_update.dt.hour).mean().round())
    fri_av = pd.DataFrame(fri.groupby(fri.last_update.dt.hour).mean().round())
    sat_av = pd.DataFrame(sat.groupby(sat.last_update.dt.hour).mean().round())
    sun_av = pd.DataFrame(sun.groupby(sun.last_update.dt.hour).mean().round())
    
    mon_av.reset_index(drop=True, inplace=True)
    tue_av.reset_index(drop=True, inplace=True)
    wed_av.reset_index(drop=True, inplace=True)
    thu_av.reset_index(drop=True, inplace=True)
    fri_av.reset_index(drop=True, inplace=True)
    sat_av.reset_index(drop=True, inplace=True)
    sun_av.reset_index(drop=True, inplace=True)
    
    
    
    
    df = pd.concat([mon_av, tue_av, wed_av, thu_av, fri_av, sat_av, sun_av], axis=1)
    df.columns = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    
    return df.to_json()

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
    pastWeather =engine.execute("SELECT * FROM dublinbikedb.weather")
    for row in pastWeather:
        pastWeatherList.append(dict(row))
    return jsonify(pastWeatherList=pastWeatherList)

@app.route('/')
#@functools.lru_cache(maxsize=128)
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    
