import requests
import traceback
import datetime
import time
APIKEY="6ea4678acfb75dfd8022fbb67f5170e2ba8bfcdc"
CONTRACT="Dublin"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"

# Code taken from Aonghus's Notes

def write_to_file(text, now):
    with open("data/bikes_{}".format(now).replace(" ", "_"), "w") as f:
        f.write(text)
        
def write_to_db(text):
    query = "INSERT INTO  VALUES (%s, %s, %s);"

def main():
    while True:
        try:
            now = datetime.datetime.now()
            r = requests.get(STATIONS, params={"apiKey": APIKEY, "contract": CONTRACT})
            print(r, now)
            write_to_file(r.text, now)                
            time.sleep(5*60)
        except:
            print(traceback.format_exc())
    return

main()

if __name__ == "__scraper__":
    main()