import pandas as pd
import numpy as np
import requests
import json
from pandas.io.json import json_normalize
from sklearn import metrics
from sklearn.tree import export_graphviz
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.externals import joblib


def makePrediction(stationNumber):
    #read in databases
    chart1 = requests.get("http://localhost:5000/predictions/"+str(stationNumber))
    chart2 = requests.get("http://localhost:5000/pastWeather")
    #load as json
    mainJson= json.loads(chart1.text)
    weatherJson =json.loads(chart2.text)
    #flatten the weather json
    dayofyear, description, weekday, hour=[],[],[],[]
    for i in weatherJson['dayofyear']:
        dayofyear.append(weatherJson['dayofyear'][i])
    for i in weatherJson['description']:
        description.append(weatherJson['description'][i])
    for i in weatherJson['weekday']:
        weekday.append(weatherJson['weekday'][i])
    for i in weatherJson['hour']:
        hour.append(weatherJson['hour'][i])
    weatherDict={}
    weatherDict['Dayofyear']= dayofyear
    weatherDict['description'] = description
    weatherDict['hour']=hour
    available_bikes,mainDayofyear,weekday,hour=[],[],[],[]
    for i in mainJson['available_bikes']:
        available_bikes.append(mainJson['available_bikes'][i])
    for i in mainJson['dayofyear']:
        mainDayofyear.append(mainJson['dayofyear'][i])
    for i in mainJson['weekday']:
        weekday.append(mainJson['weekday'][i])
    for i in mainJson['hour']:
        hour.append(mainJson['hour'][i])
    #append to dict, for making dataframe
    mainDict = {}
    mainDict['Dayofyear']= mainDayofyear
    mainDict['availableBikes']= available_bikes
    mainDict['weekday']= weekday
    mainDict['hour']=hour

    #change types for join
    mainDf = pd.DataFrame.from_dict(mainDict)
    mainDf['Dayofyear']=mainDf['Dayofyear'].astype(float)
    mainDf.drop_duplicates()
    mainDf.reset_index(drop=True)
    mainDf.dtypes

    # drop duplicates that share an hour and day 
    weatherDf=pd.DataFrame.from_dict(weatherDict)
    weatherDf.drop_duplicates()
    weatherDf= weatherDf.drop_duplicates(['hour','Dayofyear'])

    #change types for merging the two tables
    weatherDf['Dayofyear']=weatherDf['Dayofyear'].astype(str)
    weatherDf['hour']=weatherDf['hour'].astype(str)
    weatherDf['period'] = weatherDf[['Dayofyear', 'hour']].apply(lambda x: ''.join(x), axis=1)

    #change data types to allow merging tables
    mainDf['hour']=mainDf['hour'].astype(float)
    mainDf.head()
    mainDf['Dayofyear']=mainDf['Dayofyear'].astype(str)
    mainDf['hour']=mainDf['hour'].astype(str)
    mainDf['period'] = mainDf[['Dayofyear', 'hour']].apply(lambda x: ''.join(x), axis=1)
    newMain= mainDf.groupby([mainDf["Dayofyear"],mainDf['period'],mainDf['weekday'], mainDf["hour"]]).mean().round()
    newMain.reset_index(inplace=True)
    # merge tables
    newdf= pd.merge(newMain, weatherDf, how='right', left_on='period', right_on = 'period')
    # drop duplicate columns and period column
    newdf = newdf.drop('hour_y', 1)
    newdf = newdf.drop('period', 1)
    newdf = newdf.drop('Dayofyear_y', 1)
    # tidy up data types and names
    newdf['dayOfYear']=newdf['Dayofyear_x'].astype(float)
    newdf['availableBikes']=newdf['availableBikes'].astype(float)
    newdf['hour']=newdf['hour_x'].astype(float)
    newdf = newdf.drop('hour_x', 1)
    newdf = newdf.drop('Dayofyear_x', 1)
    newdf.head()
    # remove all NaN columsn from target feature
    newdf = newdf[np.isfinite(newdf['availableBikes'])]
    # set categorical features
    newdf['description'].astype('category')
    newdf.dtypes
    newdf = newdf[newdf.description !='light shower snow']
    newdf = newdf[newdf.description !='description_light snow']
    # decided not to use dayofyear as a continuous feature
    df_cont_feat = newdf[['hour']]
    df_dummies_weekday = pd.get_dummies(newdf[['weekday']])
    df_dummies_weather=pd.get_dummies(newdf[['description']])
    # Add dummies to the other continuous features
    X = pd.concat([df_cont_feat, df_dummies_weekday, df_dummies_weather], axis =1)
    y = newdf[['availableBikes']]
    # Train RF with 100 trees
    rfc = RandomForestClassifier(n_estimators=1000, max_depth=7, max_features='auto', oob_score=True, random_state=1)
    # Fit model on full dataset
    rfc.fit(X, y.values.ravel())
    #Dump the model to a local file
    joblib.dump(rfc, str(stationNumber)+'prediction.pkl')
    
    print('Done!',X.columns.tolist()) 

for i in range(1,105):
    try:
        makePrediction(i)
    except:
        print('error')