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
URI="dublinbikedb.c3n1hjxadqkf.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikeDB"
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
    WHERE dublinbikedb.static.number = '{}';
    """.format(station_number)
    
    df = pd.read_sql(sql, engine)
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    df['weekday'] = df['last_update'].dt.weekday_name
    df['dayofyear'] = df['last_update'].dt.dayofyear
    df['hour']=df['last_update'].dt.hour
    return df.to_json() 


@app.route("/chart/<int:station_number>")
@functools.lru_cache(maxsize=128)
def chart(station_number):
    start = time.time()
    engine = get_db()
    sql = """
    SELECT available_bikes, last_update
    FROM dublinbikedb.dynamic
    WHERE number = {};
    """.format(station_number)
    
    # For feeding SQL data to jupyter notebook 2.
    df = pd.read_sql(sql, engine)
    sql_time = time.time()
    print("Make SQL query and load response runtime:",sql_time - start)
    
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    df.set_index(df["last_update"],inplace=True, drop=True)
    df.drop(['last_update'], axis=1).head(5)
    group = pd.DataFrame(df.groupby([df.index.dayofweek, df.index.hour]).mean().unstack(level=0))
    group.columns.set_levels(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],level=1,inplace=True)

    pandas_time = time.time()
    print("Pandas manipulation time:",pandas_time - sql_time)  
    
    groupJson = {}
    for day in group['available_bikes'].columns:
        groupJson[str(day)] = group['available_bikes'][day].astype(int).tolist()
    
    json_time = time.time()
    print("Creating json time:",json_time - pandas_time)
    print("Total runtime: ", json_time - start)
         
    return json.dumps(groupJson)
    
#     return json.dumps(groupJson)

@app.route("/stations")
@functools.lru_cache(maxsize=128)
def stations():
    engine = get_db()
    stations = engine.execute("SELECT * FROM dublinbikedb.stationInformation;")
    stationJson = []
    for i in stations:
        stationJson.append(dict(i)) 
    return jsonify(stationJson=stationJson)   

@app.route("/weather")
@functools.lru_cache(maxsize=128)
def weather():
    engine=get_db()
    weatherlist=[]
    weather = engine.execute("SELECT * FROM dublinbikedb.forecast LIMIT 5;")
    for i in weather:
        weatherlist.append(dict(i))
    return jsonify(weatherlist=weatherlist)

@app.route("/pastWeather")
def pastWeather():
    engine=get_db()
    pastWeatherList=[]
    weathersql = """
    SELECT * FROM dublinbikedb.weather;
    """
    df2 = pd.read_sql(weathersql, engine)
    df2['time'] =  pd.to_datetime((df2['time']), unit='s')
    df2['weekday'] = df2['time'].dt.weekday_name
    df2['dayofyear'] = df2['time'].dt.dayofyear
    df2['hour'] = df2['time'].dt.hour
    return df2.to_json()

@app.route('/forecastModel/<int:station_number>')
@functools.lru_cache(maxsize=128)
def forecastModel(station_number):
    engine=get_db()
    weatherlist=[]
    weather = "SELECT description, dt FROM dublinbikedb.forecast"
    forecastDf=pd.read_sql(weather, engine)
    forecastDf['dt'] =  pd.to_datetime((forecastDf['dt']), unit='s')
    forecastDf['weekday'] = forecastDf['dt'].dt.weekday_name
    forecastDf['hour'] = forecastDf['dt'].dt.hour
    forecastDf.drop('dt', axis=1, inplace=True)
    prediction_dummies_weekday = pd.get_dummies(forecastDf[['weekday']])
    prediction_dummies_weather=pd.get_dummies(forecastDf[['description']])
    prediction=pd.concat([forecastDf['hour'], prediction_dummies_weekday, prediction_dummies_weather], axis =1)
    currentShape=prediction.columns.tolist()
    idealShape=['hour','weekday_Friday','weekday_Monday','weekday_Saturday','weekday_Sunday','weekday_Thursday',
    'weekday_Tuesday','weekday_Wednesday','description_broken clouds','description_clear sky',
     'description_few clouds','description_fog','description_light intensity drizzle','description_light intensity drizzle rain',
     'description_light intensity shower rain','description_light rain','description_light snow','description_mist',
     'description_moderate rain','description_overcast clouds','description_scattered clouds','description_shower rain',
     'description_shower sleet','description_shower snow']
    # ensure that the size of the forecast data matches the data the model was trained on
    for i in idealShape:
        if i not in currentShape:
            prediction[i]=0
    prediction=prediction[idealShape]
    cfl=joblib.load('../DublinBikeApp/predictions/'+str(station_number)+'prediction.pkl')
    result=cfl.predict(prediction)
    return jsonify(result.tolist())

@app.route('/')
#@functools.lru_cache(maxsize=128)
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    
