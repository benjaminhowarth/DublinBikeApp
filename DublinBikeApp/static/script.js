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
				if(infoWindow) 
					infoWindow.close();

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
		if(infoWindow ) 
			infoWindow.close();
	});
	
	
	var spaceData;
	function setup() {
		createCanvas(200, 200);
		loadJSON("http://api.open-notify.org/astros.json", gotData, 'jsonp');
		
	}
	
	function gotData(data){
		spaceData = data;
	}
	
	function draw(){
		background(0);
		if (spaceData){
			randomSeed(4);
		for (var i = 0; i < spaceData.number; i++){
			fill(255);
			ellipse(random(width), random(height), 16, 16);
		}
	}
	}
	
//generate the chart
	var chart = c3.generate({
	    bindto: '#chart',
	    data: {
	      columns: [
	        ['data1', 100, 400, 100, 400, 100, 400,100, 400,],
	        ['data2', 50, 20, 10, 40, 15, 25]
	      ]
	    }
	});
	
	var chartBtn1 = document.getElementById("chartBtn1");
	var chartBtn2 = document.getElementById("chartBtn2");
	
	chartBtn1.onclick = function() {
		chart.load({
			columns: [
				['data1', 300, 100, 250, 150, 300, 150, 500],
			    ['data2', 100, 200, 150, 50, 100, 250, 250],
				['data3', 500, 450, 400, 400, 350, 200, 200] 
			]
		});
	}	
	chartBtn2.onclick = function() {
		chart.load({
			columns: [
				['data1', 100, 500, 200, 300, 450, 150, 500],
			    ['data2', 100, 200, 600, 50, 150, 250, 100],
				['data3', 50, 450, 400, 400, 350, 50, 200],
				[]
			]
		});
	}	o}um$(document).ready(function(){
	$('#toggle').click(function() {
		var clicks = $(this).data('clicks');
		if (!clicks) {
			$(this).html("&lt;&lt;&lt;")
			$('aside').addClass('open');
			$('#toggleOpen').css("display", "none");
			$('#mapHeader').fadeOut()
		} else {
			$(this).html("&gt;&gt;&gt;")
			$('aside').removeClass('open');
			$('#mapHeader').fadeIn()
		}
		$(this).data("clicks", !clicks);
	});
});


//chart//
//chartBtn2.onclick = function() {
//	
//	chart.unload({
//		done: function(){
//			chart.load({
//				columns: [
//					['data1', 100, 500, 200, 300, 450, 150, 500],
//				    ['data2', 100, 200, 600, 50, 150, 250, 100],
//					['data3', 50, 450, 400, 400, 350, 50, 200] 
//					]
//				});
//			}})
//		}
//
//
//



//// 
//
