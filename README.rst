===============
Dublin Bike App
===============

Overview
--------
A web application which displays real time occupancy and weather information for Dublin Bikes.

Set Up
------
To view the app on your machine, clone this GitHub repository: https://github.com/benjaminhowarth/DublinBikeApp
Run the main.py file and navigate to port 5000 using your web browser.

Requirements
-------
The Python modules that need to be installed are listed in requirements_dev.txt.

Testing
-------

To run the unit tests, run test_DublinBikeApp.py. as a pyton unittest.  


Features
--------
This application provides real time, historical and predicted occupancy information for Dublin Bike stations. 

The map displays the location of each station and the current number of bikes at that station. 
The size of a station's marker represents the total bike stands at the station and the intensity of the color
represents the percentage of the stands that are holding bikes.
Clicking on a station will open a sidebar displaying the historical average for each day of a station.
Clicking the "Predicted" button will load a chart displaying the predicted accuracy for that station. 
To minimise the sidebar click anywhere on the map. 




* Free software: GNU General Public License v3
* Documentation: https://DublinBikeApp.readthedocs.io.

This package was created with Cookiecutter_ and the audreyr/cookiecutter-pypackage_ project template.

.. _Cookiecutter: https://github.com/audreyr/cookiecutter
.. _audreyr/cookiecutter-pypackage: https://github.com/audreyr/cookiecutter-pypackage