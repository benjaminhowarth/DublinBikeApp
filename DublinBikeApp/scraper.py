import requests
import traceback
import datetime
import time
from dbWriter import makeDF, write_to_static, write_to_dynamic, write_to_latestDynamic
APIKEY="6ea4678acfb75dfd8022fbb67f5170e2ba8bfcdc"
CONTRACT="Dublin"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"

# Code taken from Aonghus's Notes

def write_to_file(text, now):
    with open("data/bikes_{}".format(now).replace(" ", "_"), "w") as f:
        f.write(text)

def main():
    count = 0
    while True:
        try:
            now = datetime.datetime.now()
            response = requests.get(STATIONS, params={"apiKey": APIKEY, "contract": CONTRACT})
            print(response, now)
            write_to_dynamic(response.text)             
            write_to_latestDynamic(response.text)            
            time.sleep(5*60)
            count += 1
            # Once a day, update static table
            if count >= 288:
                write_to_static(makeDF(response.text))
                count = 0
        except:
            print(traceback.format_exc())
    return

main()

if __name__ == "__scraper__":
    main()