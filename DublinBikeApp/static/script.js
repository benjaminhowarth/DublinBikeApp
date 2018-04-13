// sidebar = true if sidebar is open
var sidebar = false;
//generate the initial chart
var localAddress = window.location.protocol

function openSidebar(){
//	$('#toggle').html("&lt;&lt;&lt;")
	$('aside').addClass('open');
	$('#toggleOpen').css("display", "none");
	$('#mapHeader').fadeOut()
	sidebar = true;
}

function closeSidebar() {
//	$('#toggle').html("&gt;&gt;&gt;")
	$('aside').removeClass('open');
	$('#mapHeader').fadeIn();
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

// Code from Traversy Media - Google Maps JavaScript API Tutorial
// https://www.youtube.com/watch?v=Zxf1mnP5zcw
var ChartStationNum;
var ChartStationAddress;

var dataMon;
var dataTue;
var dataWed;
var dataThu;
var DataFri;
var dataSat;
var dataSun; 

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
	            {"hue": "#1100ff"},
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
			map: map,
			icon: icon
		});


		marker.addListener('click', function(){
			if(infoWindow) {
				infoWindow.close();				
			}
			
			openSidebar();

			infoWindow = new google.maps.InfoWindow({
				content: '<a href="./chart/'+station.number+'">'+station.number+'</a>'+
							'<h3>'+station.address+'</h3>'+
							'<h4>Bike Stands = '+station.bike_stands+'</h4>'+
							'<h4>Available Bikes = '+station.available_bikes+'</h4>'+
							'<h4>Available Bike Stands = '+station.available_bike_stands+'</h4>'
			});

			infoWindow.open(map, marker);
			
			ChartStationNum = station.number;
			ChartStationAddress = station.address;
			$.getJSON(localAddress+"chart/"+ChartStationNum, function(externaldata){
				dataMon = Object.values(externaldata.mon);
				dataTue = Object.values(externaldata.tue);
				dataWed = Object.values(externaldata.wed);
				dataThu = Object.values(externaldata.thu);
				dataFri = Object.values(externaldata.fri);
				dataSat = Object.values(externaldata.sat);
				dataSun = Object.values(externaldata.sun);
				// Find a way to trigger button2 when these values are finished updating. 
				dataMon.unshift("Monday");
				dataTue.unshift("Tuesday");
				dataWed.unshift("Wednesday");
				dataThu.unshift("Thursday");
				dataFri.unshift("Friday");
				dataSat.unshift("Saturday");
				dataSun.unshift("Sunday");
			})	
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

$(document).ready(function(){
	$('#startUpMessage').fadeIn(3000).delay(3000).fadeOut(2000);
});
}

function initChart() {
	var chartBtn1 = document.getElementById("chartBtn1");
	var chartBtn2 = document.getElementById("chartBtn2");

	var chart = c3.generate({
		title:{
			text:"Bike availability"
		},
		bindto: "#chart",
		data:{
			json:{
				Monday: [0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10,0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10],
				Tuesday: [20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0],
				Wednesday: [0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20],
				Thursday: [30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0],
				Friday: [0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30,0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30],
				Saturday: [40,0,40,0, 40, 0, 40,0,40,0, 40, 0,40,0,40,0, 40, 0, 40,0,40,0, 40, 0],
				Sunday: [0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40,0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40]
			},
			type: 'spline'
		},
		point: {
	        show: false
			},
		zoom: {
			enabled: true
	}
});
	
	//change the data displayed on the chart with onclick events
	chartBtn1.onclick = function(){
		chart.load({
			unload: true,
			columns: [
				["Monday", 0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10,0,10,0, 10, 0, 10, 0,10,0, 10, 0, 10],
				["Tuesday", 20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0, 20,0,20,0, 20, 0],
				["Wednesday", 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20, 0,20,0, 20, 0, 20],
				["Thursday", 30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0, 30,0,30,0, 30, 0],
				["Friday", 0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30,0,30,0, 30, 0, 30, 0,30,0, 30, 0, 30],
				["Saturday", 40,0,40,0, 40, 0, 40,0,40,0, 40, 0,40,0,40,0, 40, 0, 40,0,40,0, 40, 0],
				["Sunday", 0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40,0,40,0, 40, 0, 40, 0,40,0, 40, 0, 40]
				
			], unload: ['data1', 'data2' , 'data3'], 
		});
	}
	
	chartBtn2.onclick = function(){
		chart.load({
				columns:[
					dataMon,
					dataTue,
					dataWed,
					dataThu,
					dataFri,
					dataSat,
					dataSun
				]
		});
	}	
}

function showWeather(){
	var x = document.getElementById("weather")
		$.getJSON(localAddress+"/weather", null, function(results) {
			x.innerHTML ="<h1>Forecast</h1>"
			if ('weatherlist' in results) {
				var weather = results.weatherlist;
				for (var i=0; i < 5; i++){
					var string =weather[i].dt_txt;
					var res = string.slice(11, 16);
					x.innerHTML += "<div>Time: "+res+" <img style='height:30px;width:30px;' id='icon' src=http://openweathermap.org/img/w/"+weather[i].icon+".png>"+ weather[i].description+" <div>"
				};
				x.innerHTML += "</table>"
			};
		});
}
