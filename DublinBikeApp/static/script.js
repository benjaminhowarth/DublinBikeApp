var map;
var market = null;

function initMap() {
	var DublinPosition = {lat: 53.3484906, lng: -6.2551201};
	map = new google.maps.Map(document.getElementById('map'), {zoom:10, center: DublinPosition});
	var marker = new google.maps.Marker({position: DublinPosition, map: map});
}

function placeMarker(location, title){
	marker = new google.maps.Marker({
		position: location, 
		animation: google.maps.Animation.BOUNCE,
		title: title,draggable:true
		});
	marker.setMap(map);
	asdfasdfasdf
}

var lagLang = [
	{lat: -25.403, lng: 131.044 },
	{lat: -25.403, lng: 135.044 },
	{lat: -25.403, lng: 139.044 },
	{lat: -25.403, lng: 150.044 },
	{lat: -25.403, lng: 131.044 }
	];

for (var i=0; i<=lagLang.length; i++) {
        placeMarker(lagLang[i], "Marker Number " + i + 1)
}
