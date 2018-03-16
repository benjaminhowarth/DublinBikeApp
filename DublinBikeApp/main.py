from flask import Flask
from flask import render_template
from . import *

@app.route('/')
def index():
    return render_template('index.html')
    return "Welcome to Dublin Bike Planner"
