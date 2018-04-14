var sidebar = false; // sidebar = true if sidebar is open
var localAddress = window.location.protocol // Local url

function openSidebar(){
	$('#toggle').html("&lt;&lt;&lt;")
	$('aside').addClass('open');
	$('#toggleOpen').css("display", "none");
	$('#mapHeader').fadeOut()
	$('#startUpMessage').css("display", "none");
	sidebar = true;
}

function closeSidebar() {
	$('#toggle').html("&gt;&gt;&gt;")
	$('aside').removeClass('open');
	$('#mapHeader').fadeIn()
	sidebar = false;
}

$(document).ready(function(){
	$('#toggle').click(function() {
		// If sidebar is not open...
		if (!sidebar) {
			openSidebar()
		} else {
			closeSidebar()
		}
	});
});

function initMap() {
	var dublin = {lat: 53.3484906, lng: -6.2551201};
	var infoWindow;
	var icon='http://icons.iconarchive.com/icons/elegantthemes/beautiful-flat-one-color/32/bike-icon.png';

	// Create Map
	var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 14,
	center: dublin,
	mapTypeControl: false,
	// styles the map
	styles: [
	    {"featureType": "landscape.natural",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {"visibility": "on"},
	            {"color": "#e0efef"}
	        ]
	    },
	    {"featureType": "poi",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {"visibility": "on"},
	            {"hue": "#1900ff"},
	            {"color": "#c0e8e8"}
	        ]
	    },
	    {"featureType": "road",
	        "elementType": "geometry",
	        "stylers": [
	            {"lightness": 100},
	            {"visibility": "simplified"}]
	    },
	    {"featureType": "poi",
	        "elementType": "labels",
	        "stylers": [
	            {"visibility": "off"}]
	    },
	    {"featureType": "road",
	        "elementType": "labels",
	        "stylers": [
	            {"visibility": "off"}
	        ]
	    },
	    {"featureType": "transit",
	        "elementType": "labels.icon",
	        "stylers": [
	            {"visibility": "off"}
	        ]
	    },
	    {"featureType": "transit.line",
	        "elementType": "geometry",
	        "stylers": [
	            {"visibility": "on"},
	            { "lightness": 700}]
	    },
	    {"featureType": "water",
	        "elementType": "all",
	        "stylers": [
	            { "color": "#99ddff"}]
	    }]});
	
	function addMarker(station){
		var marker = new google.maps.Marker({
			position: {
                lat : station.position_lat,
                lng : station.position_lng
            },
            label: ""+station.available_bikes,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5 + station.bike_stands/1.8,
                strokeWeight: 0,
                fillColor: 'red',
                fillOpacity:.2 + (station.available_bikes/station.bike_stands)/2
                },
                
			map: map,
			
			
		});


		marker.addListener('click', function(){
			if(infoWindow) {
				infoWindow.close();				
			}
			
			openSidebar();

			infoWindow = new google.maps.InfoWindow({
				content: 
						'<h3>'+station.address+'</h3>'+
						'<h4>Bike Stands = '+station.bike_stands+'</h4>'+
						'<h4>Available Bikes = '+station.available_bikes+'</h4>'+
						'<h4>Available Bike Stands = '+station.available_bike_stands+'</h4>'
			});

			infoWindow.open(map, marker);
			
			initChart(station.number, station.address)
		});
	}

	$.getJSON(localAddress+"/stations", null, function(data) {
		if ('stationJson' in data) {
			var stations = data.stationJson;
			for (var i=0; i < stations.length; i++){
				addMarker(stations[i]);
			};
		};
	});

	map.addListener('click', function() {
		if(infoWindow ) {
			infoWindow.close();
		}
		closeSidebar()
	});
}

$(document).ready(function(){
	$('#startUpMessage').delay(3000).fadeOut(2000);
});




var chartGenerated = false;
function initChart(ChartStationNum, ChartStationAddress) {
//	document.getElementById("chart-loading-div").style.display = 'flex';
//	document.getElementById("chart").style.display = 'none'
	document.getElementById("buttonDiv").style.display = 'flex'
	
	$.getJSON(localAddress+"chart/"+ChartStationNum, function(externaldata){
		
		dataMon = Object.values(externaldata.mon);
		dataTue = Object.values(externaldata.tue);
		dataWed = Object.values(externaldata.wed);
		dataThu = Object.values(externaldata.thu);
		dataFri = Object.values(externaldata.fri);
		dataSat = Object.values(externaldata.sat);
		dataSun = Object.values(externaldata.sun);
		
		if (chartGenerated == true){
			
		
			chart.load({
				columns:[
					['Monday'].concat(dataMon),
					['Tuesday'].concat(dataTue),
					['Wednesday'].concat(dataWed),
					['Thursday'].concat(dataThu),
					['Friday'].concat(dataFri),
					['Saturday'].concat(dataSat),
					['Sunday'].concat(dataSun)
				]
			});
		}
		else{
			chart = c3.generate({
				title: {
					text:"Available Bikes at " + ChartStationAddress
				},
				bindto: document.getElementById("chart"),
				data: {
					json: {
						Monday: dataMon,
						Tuesday: dataTue,
						Wednesday: dataWed,
						Thursday: dataThu,
						Friday: dataFri,
						Saturday: dataSat,
						Sunday: dataSun
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
			chartGenerated = true;
		}

	})
	
	chartBtn1.onclick = function(){
		chart.load({
			columns:[
				['Monday'].concat(dataMon),
				['Tuesday'].concat(dataTue),
				['Wednesday'].concat(dataWed),
				['Thursday'].concat(dataThu),
				['Friday'].concat(dataFri),
				['Saturday'].concat(dataSat),
				['Sunday'].concat(dataSun)
			]
		});
	}
	
	chartBtn2.onclick = function(){
		chart.load({
			columns: [
				["Monday", 0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10,0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10],
				["Tuesday", 20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0],
				["Wednesday", 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20],
				["Thursday", 30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0],
				["Friday", 0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30,0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30],
				["Saturday", 40,0,40,0, 40, 0, 40,0,40,0, 40, 0,40,0,40,0, 40, 0, 40,0,40,0, 40, 0],
				["Sunday", 0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40,0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40]
				
			] 
		});
	}
	
//	document.getElementById("chart-loading-div").style.display = 'none';
//	document.getElementById("chart").style.display = 'flex'
}

function showWeather(){	
	document.getElementById("weather-loading-div").style.display = 'flex';
	document.getElementById("weather").style.display = 'none'
	
	var weatherDiv = document.getElementById("weather")
	$.getJSON(localAddress+"/weather", null, function(results) {
		if ('weatherlist' in results) {
			var weather = results.weatherlist;
			for (var i=0; i < 5; i++){
				var string =weather[i].dt_txt;
				var weatherTime = string.slice(11, 16);
				weatherDiv.innerHTML += '<div><div>'+
					'<img title="'+weather[i].description+'"'+
					'class="icon" src="../static/icons/'+weather[i].icon+'.png">'+
					'</div>'+weatherTime+'<div>'
			};
		};
	});
	
	document.getElementById("weather-loading-div").style.display = 'none';
	document.getElementById("weather").style.display = 'flex'
}