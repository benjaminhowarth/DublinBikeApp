// Code from Traversy Media - Google Maps JavaScript API Tutorial
// https://www.youtube.com/watch?v=Zxf1mnP5zcw
function initMap() {
    var dublin = {lat: 53.3484906, lng: -6.2551201};
    
    // Create Map
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: dublin
    });
	
	function addMarker(args){
		var marker = new google.maps.Marker({
			position: args.coords,
			map: map
		});
		
		// Check for content
		if(args.content){
			var infoWindow = new google.maps.InfoWindow({
				content: args.content
			});
			
			marker.addListener('click', function(){
				infoWindow.open(map, marker);
			});
		}
	}
	
	var markers = [
		{
			coords:{lat: 53.3484906, lng: -6.2551201},
			content:'<h3>Station 1</h3>'
		},
		{
			coords:{lat: 53.3234324, lng: -6.2234234},
			content:'<h3>Station 2</h3>'
		}
	];
	
	for(var i = 0; i < markers.length; i++){
		addMarker(markers[i]);
	};
}


