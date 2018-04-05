// sidebar = true if sidebar is open
var sidebar = false;

// Code from Traversy Media - Google Maps JavaScript API Tutorial
// https://www.youtube.com/watch?v=Zxf1mnP5zcw
function initMap() {
	var dublin = {lat: 53.3484906, lng: -6.2551201};

	// Create Map
	var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 14,
	center: dublin,
	mapTypeControl: false
	});
	
	function addMarker(args){
		var marker = new google.maps.Marker({
			position: args.coords,
			map: map
		});

		// Check for content
		if(args.content){
			marker.addListener('click', function(){
				if(infoWindow) {
					infoWindow.close();				
				}
				
				openSidebar();

				infoWindow = new google.maps.InfoWindow({
					content: args.content
				});

				infoWindow.open(map, marker);
			});
		}
	}

	var infoWindow;
	for(var i = 0; i < markers.length; i++){
		addMarker(markers[i]);
	};

	map.addListener('click', function() {
		if(infoWindow ) {
			infoWindow.close();
			closeSidebar()
		}
	});
	
	//generate the initial chart
	
	var chart = c3.generate({
		bindto: '#chart',
		data: {
			columns:[
				['data1', 100, 400, 100, 300, 150],
				['data2', 50, 20, 40, 400, 50]
			]
		}
	});
	
	var chartBtn1 = document.getElementById("chartBtn1");
	var chartBtn2 = document.getElementById("chartBtn2");
	
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
	
//	chartBtn2.onclick = function(){
//		chart.load({
//			columns: [
//				['data1', 100, 200, 250, 250, 400],
//				['data2', 400, 200, 100, 200, 350],
//				['data3', 150, 250, 350, 100, 50],
//				['data4', 300, 350, 400, 250, 300]
//			]
//		});
//	}

// go into support center and ask about this 
	chartBtn2.onclick = function(){
		$.getJSON("http://0.0.0.0:5000/chart/1", function(externaldata){
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

