from flask import Flask
from flask import render_template
from .DublinBikeModule import main
from . import *

@app.route('/')
def index():
    return render_template('index.html')
    return "Welcome to Dublin Bike Planner"
def displayTest(): 
	return "Test passed: " + main()

@app.route('/test')
def test():
	return "<h1>Test is good</h1>"

	
