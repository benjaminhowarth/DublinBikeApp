import requests
import traceback
import datetime
import time
from dbWriter import makeDF, write_to_weather
APIID="85d28fa8606703e0e0527150fd64610d"
CITYID="7778677"
APIREQUEST="http://api.openweathermap.org/data/2.5/weather"

# Code taken from Aonghus's Notes

def write_to_file(text, now):
    with open("weatherData/weather_{}".format(now).replace(" ", "_"), "w") as f:
        f.write(text)
        
#http://api.openweathermap.org/data/2.5/weather?id=7778677&appid=85d28fa8606703e0e0527150fd64610d
def main():
    """Requests JSON from openweathermap.org and writes it to database."""
    
    while True:
        try:
            now = datetime.datetime.now()
            response = requests.get(APIREQUEST, params={ "id": CITYID, "appid": APIID})
            print(response, now)
            write_to_weather(response.text)           
            time.sleep(10*60)
        except:
            # If error, write error to file.
            file = open("errors/weatherscraper_errors.txt","w")
            file.write(traceback.format_exc())
            
    return

main()

if __name__ == "__weatherscraper__":
    main()