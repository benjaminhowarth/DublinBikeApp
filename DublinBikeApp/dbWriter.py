import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
import requests
import time

# Code taken from Aonghus's Notes

URI="dublinbikedb.cm66ft6swiuh.us-west-2.rds.amazonaws.com"
PORT="3306"
DB = "dublinbikes"
USER = "dublinbikedb"
PASSWORD = "password"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}"
                       .format(USER, PASSWORD, URI, PORT, DB), echo=True)


sql = """
CREATE DATABASE IF NOT EXISTS dublinbikes;
"""


engine.execute(sql)