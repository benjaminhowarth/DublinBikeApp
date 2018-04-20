from flask import Flask, g, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask import url_for
import json
import sqlite3
import functools
import pandas as pd
import time
from sklearn.externals import joblib
import sys
import collections

app = Flask(__name__)

# Configure MySQL
URI="dublinbikedb.c3n1hjxadqkf.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikeDB"
PASSWORD = "password"

def connect_to_database():
    """Create engine for connecting to RDB."""

    engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                           .format(USER, PASSWORD, URI, PORT, DB), echo=True) 
    return engine


def get_db():
    """Connect to RDB."""
    
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db


@app.route("/stations")
@functools.lru_cache(maxsize=128)
def stations():
    """Creates JSON for station information."""
    
    engine = get_db()
    stations = engine.execute("SELECT * FROM dublinbikedb.stationInformation;")
    stationJson = []
    for i in stations:
        stationJson.append(dict(i)) 
    return jsonify(stationJson=stationJson)


@app.route("/weather")
@functools.lru_cache(maxsize=128)
def weather():
    """Creates JSON for weather information."""
    
    engine=get_db()
    weatherlist=[]
    weather = engine.execute("SELECT * FROM dublinbikedb.forecast LIMIT 5;")
    for i in weather:
        weatherlist.append(dict(i))
        
    return jsonify(weatherlist=weatherlist)


@app.route("/chart/<int:station_number>")
@functools.lru_cache(maxsize=128)
def chart(station_number):
    """Creates JSON for average bike occupancy chart."""
    
    engine = get_db()
    sql = """
    SELECT available_bikes, last_update
    FROM dublinbikedb.dynamic
    WHERE number = {};
    """.format(station_number)
    df = pd.read_sql(sql, engine)
    
    # Convert last_update from unix timestamp to date time format.
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    # Set date time as index
    df.set_index(df["last_update"],inplace=True, drop=True)
    df.drop(['last_update'], axis=1).head(5)
    
    # Group station occupancy by weekday and hour and get average.
    group = pd.DataFrame(df.groupby([df.index.dayofweek, df.index.hour]).mean().unstack(level=0))
    group.columns.set_levels(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],level=1,inplace=True)
    
    groupJson = {}
    for day in group['available_bikes'].columns:
        # Create list of average occupancy on selected day. Convert averages from floats to ints.
        # Store list in dictionary of weekdays.
        groupJson[str(day)] = group['available_bikes'][day].astype(int).tolist()
         
    return json.dumps(groupJson)


@app.route('/forecastModel/<int:station_number>')
@functools.lru_cache(maxsize=128)
def forecastModel(station_number):
    """Creates JSON for prediction chart."""
    
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
    if station_number ==50:
        idealShape.pop(-1)
        idealShape.pop(-1)
    # ensure that the size of the forecast data matches the data the model was trained on
    for i in idealShape:
        if i not in currentShape:
            prediction[i]=0
    prediction=prediction[idealShape]
    cfl=joblib.load('../DublinBikeApp/predictions/'+str(station_number)+'prediction.pkl')
    result=cfl.predict(prediction)
    listresult=result.tolist()
    ResultsDict= collections.defaultdict(dict)
    count=0
    for i in listresult:
        ResultsDict[str(forecastDf['weekday'][count])][str(forecastDf['hour'][count])]=i
        count += 1
    return jsonify(ResultsDict)


@app.route("/pastWeather")
def pastWeather():
    """Generates historical weather data used for creating prediction model pickle files."""
    
    engine=get_db()
    weathersql = "SELECT * FROM dublinbikedb.weather;"
    df2 = pd.read_sql(weathersql, engine)

    df2['time'] =  pd.to_datetime((df2['time']), unit='s')
    df2['weekday'] = df2['time'].dt.weekday_name
    df2['dayofyear'] = df2['time'].dt.dayofyear
    df2['hour'] = df2['time'].dt.hour
    
    return df2.to_json()


@app.route("/predictions/<int:station_number>")
@functools.lru_cache(maxsize=128)
def predictions(station_number):
    """Generates station occupancy data for creating prediction model pickle files."""
    
    station_number=station_number
    engine = get_db()
    sql = """
    SELECT available_bikes, last_update
    FROM dublinbikedb.dynamic
    WHERE number = {};
    """.format(station_number)
    
    df = pd.read_sql(sql, engine)
    df['last_update'] =  pd.to_datetime((df['last_update']//1000), unit='s')
    df['weekday'] = df['last_update'].dt.weekday_name
    df['dayofyear'] = df['last_update'].dt.dayofyear
    df['hour']=df['last_update'].dt.hour
    
    return df.to_json() 


@app.route('/')
@functools.lru_cache(maxsize=128)
def index():
    """Renders index template."""
    
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    
