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
				if(infoWindow) infoWindow.close();
				
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
		if(infoWindow ) infoWindow.close();
	    });
	
	// Get the modal
	var modal = document.getElementById('myModal');

	// Get the button that opens the modal
	var btn = document.getElementById("myBtn");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal 
	btn.onclick = function() {
	    modal.style.display = "block";
	}

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
}
