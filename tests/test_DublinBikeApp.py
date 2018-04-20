#!/usr/bin/env python
# -*- coding: utf-8 -*-


"""Tests for `DublinBikeApp` package."""
import sys
import os
import unittest
from click.testing import CliRunner
from idlelib.idle_test.test_query import ModuleNameTest
from urllib.request import urlopen
import requests
from flask import Flask, jsonify
from flask_testing import TestCase
from flask_testing import LiveServerTestCase

""" Run main.py before running tests"""
# code modified from https://pythonhosted.org/Flask-Testing/
class MyTest(LiveServerTestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True

        # Set to 0 to have the OS pick the port.
        app.config['LIVESERVER_PORT'] = 0

        return app
    def test_server_is_up_and_running(self):

        response = urlopen('http://localhost:5000')
        # Check that localhost:5000 is running 
        self.assertEqual(response.code, 200)
        
    # test that these app routings return json
    def test_some_chart_json(self):
        response = requests.get("http://localhost:5000/chart/8")
        self.assertIsInstance(response.json(), dict)
        
    def test_some_pastWeather_json(self):
        response = requests.get("http://localhost:5000/pastWeather")
        self.assertIsInstance(response.json(), dict)
    
    def test_some_stations_json(self):
        response = requests.get("http://localhost:5000/stations")
        self.assertIsInstance(response.json(), dict)
    
    def test_some_predictions_json(self):
        response = requests.get("http://localhost:5000/predictions/2")
        self.assertIsInstance(response.json(), dict)
        
    def test_some_forecast_json(self):
        response = requests.get("http://localhost:5000/forecastModel/1")
        self.assertIsInstance(response.json(), dict)
    
    def check_installation_files_exist(self):
        self.check_installation_files_exist()
        

if __name__ == '__main__':
    unittest.main()

