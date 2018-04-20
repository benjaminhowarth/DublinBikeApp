var sidebar = false; // sidebar = true if sidebar is open
var localAddress = window.location.protocol // Local url

function openSidebar() {

	$('aside').addClass('open');
	$('#mapHeader').fadeOut()
	$('#startUpMessage').css("display", "none");
	$('#searchBar').fadeOut()
	sidebar = true;
}

function closeSidebar() {

	$('aside').removeClass('open');
	$('#mapHeader').fadeIn()
	$('#searchBar').fadeIn();
	sidebar = false;
}

function initMap() {
	var dublin = {
		lat: 53.3484906,
		lng: -6.2551201
	};
	var infoWindow;
	var icon = 'http://icons.iconarchive.com/icons/elegantthemes/beautiful-flat-one-color/32/bike-icon.png';
	// Create Map
	
	$.get( 'static/mapStyle.js', function( data ) {
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 14,
			center: dublin,
			mapTypeControl: false,
			// styles the map
			styles: JSON.parse(data)
		});
	
		function addMarker(station) {
			var marker = new google.maps.Marker({
				position: {
					lat: station.position_lat,
					lng: station.position_lng
				},
				label: "" + station.available_bikes,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 5 + station.bike_stands / 1.8,
					strokeWeight: 0,
					fillColor: 'red',
					fillOpacity: 0.2 + (station.available_bikes / station.bike_stands) / 2
				},
				map: map,
			});
	
			marker.addListener('click', function () {
				document.getElementById("predChartBtn").innerHTML = "Loading...";
				if (infoWindow) {
					infoWindow.close();
				}
				openSidebar();
				infoWindow = new google.maps.InfoWindow({
					content: '<h3>' + station.address + '</h3>' +
						'<h4>Available Bikes = ' + station.available_bikes + '</h4>' +
						'<h4>Available Bike Stands = ' + station.available_bike_stands + '</h4>'
				});
	
				infoWindow.open(map, marker);
				document.getElementById("avgChartBtn").innerHTML = "Loading...";
				document.getElementById("avgChartBtn").disabled = true;
				document.getElementById("predChartBtn").innerHTML = "Loading...";
				document.getElementById("predChartBtn").disabled = true;
				document.getElementById("stationChartTitle").innerHTML = "Loading...";
	
				initChart(station.number, station.address)
			});
		}
		
	
		$.getJSON(localAddress + "/stations", null, function (data) {
			
			
			if ('stationJson' in data) {
				var stations = data.stationJson;
				for (var i = 0; i < stations.length; i++) {
					addMarker(stations[i]);
				};
			};
		});
	
		map.addListener('click', function () {
			if (infoWindow) {
				infoWindow.close();
			}
			closeSidebar()
		});
	
		// Unfocus search bar when the map zooms
		google.maps.event.addListener(map, 'zoom_changed', function () {
			document.getElementById("searchBar").blur();
		});
	
		// Creating a search bar
		// From: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
		var input = document.getElementById('searchBar');
		var searchBox = new google.maps.places.SearchBox(input);
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	
		searchBox.addListener('places_changed', function () {
			var places = searchBox.getPlaces();
	
			if (places.length == 0) {
				return;
			}
	
			var bounds = new google.maps.LatLngBounds();
			
			places.forEach(function (place) {
				if (!place.geometry) {
					console.log("Returned place contains no geometry");
					return;
				}
	
				if (place.geometry.viewport) {
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			map.fitBounds(bounds);
		});
	
		map.addListener('bounds_changed', function () {
			searchBox.setBounds(map.getBounds());
		});
	
		$("#startUpMessage").css('display', 'none');
		$("#searchBar").css('display', 'none');
		$("#mapHeader").css('display', 'none');  
		setTimeout(function () {
			if (!sidebar) { 
				$('#startUpMessage').fadeIn(2000);
			 	$('#startUpMessage').delay(1000).fadeOut(2000);
				
			}; 
		}, 3400);
		
		setTimeout(function () {
			if (!sidebar) { 
				$('#searchBar').fadeIn(2000); 
				
			}; 
		}, 3000);
		
		setTimeout(function () {
			if (!sidebar) { 
				$('#mapHeader').fadeIn(2000);
			}; 
		}, 2500);
	});
}

var chartGenerated = false;
var viewingAvgChart = true;

function initChart(ChartStationNum, ChartStationAddress) {

	document.getElementById("buttonDiv").style.display = 'flex'
		
	$.getJSON(localAddress + "chart/" + ChartStationNum, function (json) {
	
		document.getElementById("avgChartBtn").innerHTML = "Average";
		document.getElementById("avgChartBtn").disabled = false;

		// If the user is viewing the average chart and the chart has already been generated, load new data into the chart (the chart lines will move)
		if (chartGenerated == true && viewingAvgChart == true) {
			chart.load({
				columns: [
					// The first element of a c3.js column is the name of the column
					['Monday'].concat(json['Monday']),
					['Tuesday'].concat(json['Tuesday']),
					['Wednesday'].concat(json['Wednesday']),
					['Thursday'].concat(json['Thursday']),
					['Friday'].concat(json['Friday']),
					['Saturday'].concat(json['Saturday']),
					['Sunday'].concat(json['Sunday'])
				]
			});
			document.getElementById('stationChartTitle').innerHTML = "Available Bikes at " + ChartStationAddress;
		} else {
			chart = c3.generate({
				bindto: document.getElementById("chart"),
				data: {
					json: {
						Monday: json['Monday'],
						Tuesday: json['Tuesday'],
						Wednesday: json['Wednesday'],
						Thursday: json['Thursday'],
						Friday: json['Friday'],
						Saturday: json['Saturday'],
						Sunday: json['Sunday']
					},
					type: 'spline'
				},
				axis: {
					x: {
						label: 'Hours'
					},
					y: {
						label: 'Average Available Bikes'
					}
				},
				point: {
					show: false
				},
				zoom: {
					enabled: true
				}
			});
		}
		
		document.getElementById('stationChartTitle').innerHTML = "Average Available Bikes at " + ChartStationAddress;
		chartGenerated = true;
		
		avgChartBtn.onclick = function () {
			viewingAvgChart = true;
			chart = c3.generate({
				bindto: document.getElementById("chart"),
				data: {
					json: {
						Monday: json['Monday'],
						Tuesday: json['Tuesday'],
						Wednesday: json['Wednesday'],
						Thursday: json['Thursday'],
						Friday: json['Friday'],
						Saturday: json['Saturday'],
						Sunday: json['Sunday']
					},
					type: 'spline'
				},
				axis: {
					x: {
						label: 'Hours'
					},
					y: {
						label: 'Average Available Bikes'
					}
				},
				point: {
					show: false
				},
				zoom: {
					enabled: true
				}
			});

			document.getElementById('stationChartTitle').innerHTML = "Average Available Bikes at " + ChartStationAddress;
		};

		// Once the average chart has loaded or generated, begin fetching data for each day of the predicted chart and storing the data in arrays
		$.getJSON(localAddress + "forecastModel/" + ChartStationNum, function (jsonP) {
	
			var predDays = ["Monday", "Tuesday", "Wednesday", "Thursday","Friday","Saturday", "Sunday"];
			var actualDays = []
			
			for (i=0; i<predDays.length; i++){
				if (jsonP[predDays[i]] != undefined){
					actualDays.push(predDays[i]);
				}
			}
		
			var chartDict = {}
			for (i = 0; i< actualDays.length; i++ ) {
				chartDict[actualDays[i]] = Object.values(jsonP[actualDays[i]])
			}
			
			document.getElementById("predChartBtn").innerHTML = "Predicted";
			document.getElementById("predChartBtn").disabled = false;

			predChartBtn.onclick = function () {
				viewingAvgChart = false;
				chart = c3.generate({
					bindto: document.getElementById("chart"),
					data: {
						json: chartDict,
						type: 'spline'
					},
					axis: {
						x: {
							label: 'Hours',
							type: 'category',
							categories: ['0', '3', '6', '9', '12', '15', '18', '21']
						},
						y: {
							label: 'Predicted Available Bikes'
						}
					},
					point: {
						show: false
					},
					zoom: {
						enabled: true
					}
				});

				document.getElementById('stationChartTitle').innerHTML = "Predicted Available Bikes at " + ChartStationAddress;
				chartGenerated = true;;
			};
		});
	});
}

function showWeather() {
	var weatherDiv = document.getElementById("weather")
	$.getJSON(localAddress + "/weather", null, function (results) {
		if ('weatherlist' in results) {
			var weather = results.weatherlist;
			var weatherHTML = "";
			for (var i = 0; i < 5; i++) {
				var string = weather[i].dt_txt;
				var weatherTime = string.slice(11, 16);
				weatherHTML += '<div><div>' +
					'<img title="' + weather[i].description + '"' +
					'class="icon" src="../static/icons/' + weather[i].icon + '.png">' +
					'</div>' + weatherTime + '</div>';
			};
			weatherDiv.innerHTML = "";
			weatherDiv.innerHTML = weatherHTML;
		};
	});
}
