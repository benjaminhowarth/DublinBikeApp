// sidebar = true if sidebar is open
var sidebar = false;
//generate the initial chart
var localAddress = window.location.protocol

function openSidebar(){
	$('#toggle').html("&lt;&lt;&lt;")
	$('aside').addClass('open');
	$('#toggleOpen').css("display", "none");
	$('#mapHeader').fadeOut()
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

// Code from Traversy Media - Google Maps JavaScript API Tutorial
// https://www.youtube.com/watch?v=Zxf1mnP5zcw
function initMap() {
	var dublin = {lat: 53.3484906, lng: -6.2551201};
	var infoWindow;

	// Create Map
	var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 14,
	center: dublin,
	mapTypeControl: false
	});
	
	function addMarker(station){
		var marker = new google.maps.Marker({
			position: {
                lat : station.position_lat,
                lng : station.position_lng
            },
			map: map
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

function initChart() {
	var chartBtn1 = document.getElementById("chartBtn1");
	var chartBtn2 = document.getElementById("chartBtn2");

	var chart = c3.generate({
		bindto: '#chart',
		data: {
			columns:[
				['data1', 100, 400, 100, 300, 150],
				['data2', 50, 20, 40, 400, 50]
			]
		}
	});
	
	//change the data displayed on the chart with onclick events
	chartBtn1.onclick = function(){
		chart.load({
			columns: [
				['data1', 300, 100, 750, 200, 400],
				['data2', 100, 400, 50, 300, 650],
				['data3', 450, 150, 200, 400, 100]
			], unload: ['data1', 'data2' , 'data3'], 
		});
	}

	//go into support center and ask about this 
	chartBtn2.onclick = function(){
		$.getJSON(localAddress+"/chart/1", function(externaldata){
			alert('in getJson')
			chart = c3.generate({
				title:{
					text:"json data for station 1"
				},
				bindto: "#chart",
				data:{
					json: externaldata["chart"],
					keys: {
						value: ["available_bikes"],
						
					},
				}
			})
		});
}
}

