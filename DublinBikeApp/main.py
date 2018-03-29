from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql.schema import ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import func
from sqlalchemy import and_
app = Flask(__name__)

# Configure MySQL
URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikedb"
USER = "dublinbikedb"
PASSWORD = "password"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB)

  
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)
Session = sessionmaker(bind=engine)
session = Session()
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
    
    
class Dynamic(db.Model):
    __tablename__ = 'dynamic'
    number = db.Column('number', db.Integer, ForeignKey('static.number'))
    static = relationship("Static")
    status = db.Column('status', db.Unicode)
    bike_stands = db.Column('bike_stands', db.Integer)
    available_bike_stands = db.Column('available_bike_stands', db.Integer)
    available_bikes = db.Column('available_bikes', db.Integer)
    last_update = db.Column('last_update', db.Integer, primary_key=True)

class LatestDynamic(db.Model):
    __tablename__ = 'latestDynamic'
    number = db.Column('number', db.Integer, ForeignKey('static.number'))
    static = relationship("Static")
    status = db.Column('status', db.Unicode)
    bike_stands = db.Column('bike_stands', db.Integer)
    available_bike_stands = db.Column('available_bike_stands', db.Integer)
    available_bikes = db.Column('available_bikes', db.Integer)
    last_update = db.Column('last_update', db.Integer, primary_key=True)
       
@app.route('/')
def index():
    stations= (session.query(Static, LatestDynamic)
        .join(LatestDynamic, and_(Static.number == LatestDynamic.number))
        .order_by(LatestDynamic.last_update.desc())
#        .limit(100)
        ).all()

    return render_template('index.html', stations=stations)


if __name__ == "__main__":

    app.run(host='0.0.0.0', port=5000, debug=True)
