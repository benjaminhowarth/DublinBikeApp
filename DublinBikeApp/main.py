from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine

app = Flask(__name__)

# Configure MySQL
URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"
  
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)
          
@app.route('/')
def index():
    stations= engine.execute("SELECT * FROM dublinbikedb.newLatestDynamic")
    weather = engine.execute("SELECT * FROM dublinbikedb.forecast")
    weather = weather.first()
    return render_template('index.html', stations=stations, weather = weather)


if __name__ == "__main__":

    app.run(host='0.0.0.0', port=5000, debug=True)
