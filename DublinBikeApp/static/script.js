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
}

$(document).ready(function(){
	$('#toggle').click(function() {
		// clicks = True if button has been clicked before
		var clicks = $(this).data('clicks');
		// If clicks hasn't been clicked before...
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
		// Update clicks: if True, set False, if False, set True
		$(this).data("clicks", !clicks);
	});
});



