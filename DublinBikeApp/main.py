from flask import Flask, g, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask import url_for
import json
import sqlite3
import functools

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

@app.route("/chart/<int:station_number>")
@functools.lru_cache(maxsize=128)
def chart(station_number):
    engine = get_db()
    chartData = []
#    rows = engine.execute("SELECT available_bikes, bike_stands, DAYNAME(FROM_UNIXTIME(last_update/1000)) as Day, CONCAT(HOUR(FROM_UNIXTIME(last_update/1000)),':', MINUTE(FROM_UNIXTIME(last_update/1000))) as Time FROM dublinbikedb.static JOIN dublinbikedb.dynamic ON dublinbikedb.static.number = dublinbikedb.dynamic.number where dublinbikedb.static.number = '{}'".format(station_number))
    sql = """
    SELECT available_bikes,
    FROM_UNIXTIME(last_update/1000) as timestamp
    FROM dublinbikedb.static 
    JOIN dublinbikedb.dynamic ON dublinbikedb.static.number = dublinbikedb.dynamic.number 
    WHERE dublinbikedb.static.number = '{}'
    """.format(station_number)
    
    rows = engine.execute(sql)
    for row in rows: 
        chartData.append(dict(row))
    
    return jsonify(chart=chartData)  

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
@app.route('/')
@functools.lru_cache(maxsize=128)
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    
