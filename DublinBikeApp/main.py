from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configure MySQL
URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB)

db = SQLAlchemy(app)

class Static(db.Model):
    __tablename__ = 'static'
    number = db.Column('number', db.Integer, primary_key=True)
    contract_name = db.Column('contract_name', db.Unicode)
    name = db.Column('name', db.Unicode)
    address = db.Column('address', db.Unicode)
    position_lat = db.Column('position_lat', db.Integer)
    position_lng = db.Column('position_lng', db.Integer)
    banking = db.Column('banking', db.Integer)
    bonus = db.Column('bonus', db.Integer)

@app.route('/')
def index():
    stations = Static.query.all()
    return render_template('index.html', stations=stations)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)