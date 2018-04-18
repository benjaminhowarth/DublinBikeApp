var sidebar = false; // sidebar = true if sidebar is open
var localAddress = window.location.protocol // Local url

function openSidebar(){
	$('#toggle').html("&lt;&lt;&lt;")
	$('aside').addClass('open');
	$('#toggleOpen').css("display", "none");
	$('#mapHeader').fadeOut()
	$('#startUpMessage').css("display", "none");
	$('#searchBar').fadeOut()
	sidebar = true;
}

function closeSidebar() {
	$('#toggle').html("&gt;&gt;&gt;")
	$('aside').removeClass('open');
	$('#mapHeader').fadeIn()
	$('#searchBar').fadeIn();
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
    $('#startUpMessage').delay(2000).fadeIn(2000);
    $('#startUpMessage').delay(2000).fadeOut(2000);
    $('#searchBar').delay(1000).fadeIn(2000);
    $('#mapHeader').fadeIn(1000);
   
   
    }, 3000);
  
  
  
  
  
}

var chartGenerated = false;

function initChart(ChartStationNum, ChartStationAddress) {
	document.getElementById("chart-loading-div").style.display = 'flex';
	document.getElementById("buttonDiv").style.display = 'flex'

	$.getJSON(localAddress+"chart/"+ChartStationNum, function(json){
	
		var Mon = json['Monday'];
		var Tue = json['Tuesday'];
		var Wed = json['Wednesday'];
		var Thu = json['Thursday'];
		var Fri = json['Friday'];
		var Sat = json['Saturday'];
		var Sun = json['Sunday'];
	
		if (chartGenerated == true){
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
			
			document.getElementById('stationChartTitle').innerHTML = "Available Bikes at " + ChartStationAddress;
			chartGenerated = true;
		}
		
		chartBtn1.onclick = function(){
			chart.load({
				columns:[
					['Monday'].concat(Mon),
					['Tuesday'].concat(Tue),
					['Wednesday'].concat(Wed),
					['Thursday'].concat(Thu),
					['Friday'].concat(Fri),
					['Saturday'].concat(Sat),
					['Sunday'].concat(Sun)
				],
				title: {
					text: "hello"
				}
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
		
	});
	
	document.getElementById("chart-loading-div").style.display = 'none';
	


	
	
	
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