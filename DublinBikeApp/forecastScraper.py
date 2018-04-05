import requests
import traceback
import datetime
import time
from dbWriter import makeDF, write_to_forecast
APIID="85d28fa8606703e0e0527150fd64610d"
CITYID="7778677"
APIREQUEST="http://api.openweathermap.org/data/2.5/forecast"

# Code taken from Aonghus's Notes

def write_to_file(text, now):
    with open("weatherData/weather_{}".format(now).replace(" ", "_"), "w") as f:
        f.write(text)
        
#http://api.openweathermap.org/data/2.5/forecast?id=7778677&appid=85d28fa8606703e0e0527150fd64610d
def main():
    while True:
        try:
            now = datetime.datetime.now()
            response = requests.get(APIREQUEST, params={ "id": CITYID, "appid": APIID})
            print(response, now)
            write_to_forecast(response.text)   
            # update the forecast every 3 hours       
            time.sleep(3*60*60)
    
        except:
            print(traceback.format_exc())
                
        return

main()

if __name__ == "__forecastScraper__":
    main()