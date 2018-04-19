var sidebar = false; // sidebar = true if sidebar is open
var localAddress = window.location.protocol // Local url

function openSidebar(){

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



$(document).ready(function(){
	$('#startUpMessage').delay(3000).fadeOut(2000);
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
	            {"visibility": "simplified"}
	        ]
	    },
	    
	    {"featureType": "road.highway",
	        "elementType": "labels",
	        "stylers": [
	            {"visibility": "off"}
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
                fillOpacity: 0.2 + (station.available_bikes/station.bike_stands)/2
                },     
			map: map,		
		});
		
		marker.addListener('click', function(){
			document.getElementById("chartBtn2").innerHTML = "Loading...";
			if(infoWindow) {
				infoWindow.close();				
			}
			openSidebar();
			infoWindow = new google.maps.InfoWindow({
				content: 
						'<h3>'+station.address+'</h3>'+
						'<h4>Available Bikes = '+station.available_bikes+'</h4>'+
						'<h4>Available Bike Stands = '+station.available_bike_stands+'</h4>'
			});

			infoWindow.open(map, marker);
			document.getElementById("chartBtn1").innerHTML = "Loading...";
			document.getElementById("chartBtn1").disabled = true;
			document.getElementById("chartBtn2").innerHTML = "Loading...";
			document.getElementById("chartBtn2").disabled = true;
			document.getElementById("stationChartTitle").innerHTML = "Loading...";

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
	
	// Unfocus search bar when the map zooms
	google.maps.event.addListener(map, 'zoom_changed', function() {
		document.getElementById("searchBar").blur();
	});
	
	// Creating a search bar
	// From: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
	var input = document.getElementById('searchBar');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();
		
		if (places.length == 0) {
		  return;
		}
		
		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			if (!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}
		   
			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
  });
  
  map.addListener('bounds_changed', function() {
	  searchBox.setBounds(map.getBounds());
  }); 

  	$("#startUpMessage").css('display', 'none');
  	$("#searchBar").css('display', 'none');
  	$("#mapHeader").css('display', 'none');
  	   
    setTimeout(function(){
	  if(!sidebar){
    $('#startUpMessage').delay(000).fadeIn(2000);
    $('#startUpMessage').delay(00).fadeOut(2000);
    $('#searchBar').delay(300).fadeIn(2000);
    $('#mapHeader').fadeIn(2000);
	  };
    }, 2500);
}

var chartGenerated = false;
var viewingAverage = true;

function initChart(ChartStationNum, ChartStationAddress) {

	document.getElementById("buttonDiv").style.display = 'flex'

	$.getJSON(localAddress+"chart/"+ChartStationNum, function(json){
		
		var Mon = json['Monday'];
		var Tue = json['Tuesday'];
		var Wed = json['Wednesday'];
		var Thu = json['Thursday'];
		var Fri = json['Friday'];
		var Sat = json['Saturday'];
		var Sun = json['Sunday'];
		document.getElementById("chartBtn1").innerHTML = "Average";
		document.getElementById("chartBtn1").disabled = false;
		
		if (chartGenerated == true && viewingAverage == true){
			chart.load({
				columns:[
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
	
		chartBtn1.onclick = function(){
			viewingAverage = true;
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
		
		$.getJSON(localAddress+"forecastModel/"+ChartStationNum, function(jsonP){
			
			var MondayArray = [];
			for (i in jsonP["Monday"]){
				var keyMon = jsonP["Monday"][i];
				MondayArray.push(keyMon);
			}
					
			var TuesdayArray = [];
			for (i in jsonP["Tuesday"]){
				var keyTue = jsonP["Tuesday"][i];
				TuesdayArray.push(keyTue);
			}
			
			var WednesdayArray = [];
			for (i in jsonP["Wednesday"]){
				
				var keyWed = jsonP["Wednesday"][i];
				WednesdayArray.push(keyWed);
			}
			
			var ThursdayArray = [];
			for (i in jsonP["Thursday"]){
				
				var keyThu = jsonP["Thursday"][i];
				ThursdayArray.push(keyThu);
			}
			
			var FridayArray = [];
			for (i in jsonP["Friday"]){
				
				var keyFri = jsonP["Friday"][i];
				FridayArray.push(keyFri);
			}
			var SaturdayArray = [];
			for (i in jsonP["Saturday"]){
				var keySat = jsonP["Saturday"][i];
				SaturdayArray.push(keySat);
			}
			
			var SundayArray = [];
			for (i in jsonP["Sunday"]){
				var keySun = jsonP["Sunday"][i];
				SundayArray.push(keySun);
			}
			document.getElementById("chartBtn2").innerHTML = "Predicted";
			document.getElementById("chartBtn2").disabled = false;
			chartBtn2.onclick = function(){
			viewingAverage = false;
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
				           categories:  ['0', '3', '6', '9', '12', '15', '18', '21']		
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

function showWeather(){	
	var weatherDiv = document.getElementById("weather")
	$.getJSON(localAddress+"/weather", null, function(results) {
		if ('weatherlist' in results) {
			var weather = results.weatherlist;
			var weatherHTML = "";
			for (var i=0; i < 5; i++){
				var string =weather[i].dt_txt;
				var weatherTime = string.slice(11, 16);
				weatherHTML += '<div><div>'+
					'<img title="'+weather[i].description+'"'+
					'class="icon" src="../static/icons/'+weather[i].icon+'.png">'+
					'</div>'+weatherTime+'</div>';
			};
			weatherDiv.innerHTML = "";
			weatherDiv.innerHTML = weatherHTML;
		};
	});
}