import requests
import traceback
import datetime
import time
APIID="85d28fa8606703e0e0527150fd64610d"
CITYID="7778677"
APIREQUEST="http://api.openweathermap.org/data/2.5/weather"

# Code taken from Aonghus's Notes

def write_to_file(text, now):
    with open("weatherData/weather_{}".format(now).replace(" ", "_"), "w") as f:
        f.write(text)
        
def write_to_db(text):
    pass
#http://api.openweathermap.org/data/2.5/weather?id=7778677&appid=85d28fa8606703e0e0527150fd64610d
def main():
    while True:
        try:
            now = datetime.datetime.now()
            r = requests.get(APIREQUEST, params={ "id": CITYID, "appid": APIID})
            print(r, now)
            write_to_file(r.text, now)                
            time.sleep(5*60)
        except:
            print(traceback.format_exc())
    return

main()

if __name__ == "__weatherscraper__":
    main()