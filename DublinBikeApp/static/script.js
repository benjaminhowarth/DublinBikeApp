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
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 14,
		center: dublin,
		mapTypeControl: false,
		// styles the map
		styles: [
			{
				"featureType": "landscape.natural",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"visibility": "on"
					},
					{
						"color": "#e0efef"
					}
	        ]
	    },
			{
				"featureType": "poi",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"visibility": "on"
					},
					{
						"hue": "#1900ff"
					},
					{
						"color": "#c0e8e8"
					}
	        ]
	    },
			{
				"featureType": "road",
				"elementType": "geometry",
				"stylers": [
					{
						"lightness": 100
					},
					{
						"visibility": "simplified"
					}]
	    },
			{
				"featureType": "poi",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "off"
					}]
	    },
			{
				"featureType": "road",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "simplified"
					}
	        ]
	    },

			{
				"featureType": "road.highway",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "off"
					}
	            ]
	    },

			{
				"featureType": "road.highway.controlled_access",
				"stylers": [
					{
						"visibility": "off"
	          }
	        ]
	      },

			{
				"featureType": "road.arterial",
				"stylers": [
					{
						"visibility": "off"
	          }
	        ]
	      },


			{
				"featureType": "transit",
				"elementType": "labels.icon",
				"stylers": [
					{
						"visibility": "off"
					}
	        ]
	    },
			{
				"featureType": "transit.line",
				"elementType": "geometry",
				"stylers": [
					{
						"visibility": "on"
					},
					{
						"lightness": 700
					}]
	    },
			{
				"featureType": "water",
				"elementType": "all",
				"stylers": [
					{
						"color": "#99ddff"
					}]
	    }]
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
	// From:
	// https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
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
	
}

var chartGenerated = false;
var viewingAvgChart = true;

function initChart(ChartStationNum, ChartStationAddress) {

	document.getElementById("buttonDiv").style.display = 'flex'

	$.getJSON(localAddress + "chart/" + ChartStationNum, function (json) {

		var Mon = json['Monday'];
		var Tue = json['Tuesday'];
		var Wed = json['Wednesday'];
		var Thu = json['Thursday'];
		var Fri = json['Friday'];
		var Sat = json['Saturday'];
		var Sun = json['Sunday'];
		document.getElementById("avgChartBtn").innerHTML = "Average";
		document.getElementById("avgChartBtn").disabled = false;

		// If the user is viewing the average chart and the chart has already been generated, load new data into the chart (the chart lines will move)
		if (chartGenerated == true && viewingAvgChart == true) {
			chart.load({
				columns: [
					['Monday'].concat(Mon),
					['Tuesday'].concat(Tue),
					['Wednesday'].concat(Wed),
					['Thursday'].concat(Thu),
					['Friday'].concat(Fri),
					['Saturday'].concat(Sat),
					['Sunday'].concat(Sun)
				]
			});
			document.getElementById('stationChartTitle').innerHTML = "Available Bikes at " + ChartStationAddress;
		} else {
			chart = c3.generate({
				bindto: document.getElementById("chart"),
				data: {
					json: {
						Monday: Mon,
						Tuesday: Tue,
						Wednesday: Wed,
						Thursday: Thu,
						Friday: Fri,
						Saturday: Sat,
						Sunday: Sun
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
						Monday: Mon,
						Tuesday: Tue,
						Wednesday: Wed,
						Thursday: Thu,
						Friday: Fri,
						Saturday: Sat,
						Sunday: Sun
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

			var MondayArray = [];
			// If there is no JSON object for a day (the object is undefined) and the object is indexed, this will throw an error. 
			if (jsonP["Monday"] != undefined) {
				for (i = 0; i <= 21; i += 3) {
					// All arrays must be of equal length for C3.js to correctly generate a chart
					if (jsonP["Monday"][i] == undefined) {
						MondayArray.push(null);
					} else {
						var keyMon = jsonP["Monday"][i];
						MondayArray.push(keyMon);
					}
				}
			}

			var TuesdayArray = [];
			if (jsonP["Tuesday"] != undefined) {
				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Tuesday"][i] == undefined) {
						TuesdayArray.push(null);
					} else {
						var keyTue = jsonP["Tuesday"][i];
						TuesdayArray.push(keyTue);
					}
				}
			}

			var WednesdayArray = [];
			if (jsonP["Wednesday"] != undefined) {
				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Wednesday"][i] == undefined) {
						WednesdayArray.push(null);
					} else {
						var keyWed = jsonP["Wednesday"][i];
						WednesdayArray.push(keyWed);
					}
				}
			}

			var ThursdayArray = [];
			if (jsonP["Thursday"] != undefined) {

				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Thursday"][i] == undefined) {
						ThursdayArray.push(null);
					} else {
						var keyThu = jsonP["Thursday"][i];
						ThursdayArray.push(keyThu);
					}
				}
			}

			var FridayArray = [];
			if (jsonP["Friday"] != undefined) {

				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Friday"][i] == undefined) {
						FridayArray.push(null);
					} else {
						var keyFri = jsonP["Friday"][i];
						FridayArray.push(keyFri);
					}
				}
			}

			var SaturdayArray = [];
			if (jsonP["Saturday"] != undefined) {

				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Saturday"][i] == undefined) {
						SaturdayArray.push(null);
					} else {
						var keySat = jsonP["Saturday"][i];
						SaturdayArray.push(keySat);
					}
				}
			}

			var SundayArray = [];
			if (jsonP["Sunday"] != undefined) {

				for (i = 0; i <= 21; i += 3) {
					if (jsonP["Sunday"][i] == undefined) {
						SundayArray.push(null);
					} else {
						var keySun = jsonP["Sunday"][i];
						SundayArray.push(keySun);
					}
				}
			}

			document.getElementById("predChartBtn").innerHTML = "Predicted";
			document.getElementById("predChartBtn").disabled = false;
			
			predChartBtn.onclick = function () {
				viewingAvgChart = false;
				chart = c3.generate({
					bindto: document.getElementById("chart"),
					data: {
						json: {
							Monday: MondayArray,
							Tuesday: TuesdayArray,
							Wednesday: WednesdayArray,
							Thursday: ThursdayArray,
							Friday: FridayArray,
							Saturday: SaturdayArray,
							Sunday: SundayArray
						},
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
