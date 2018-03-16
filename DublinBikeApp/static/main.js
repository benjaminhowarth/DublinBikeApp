var dailyJSON = null;
var detailedJSON = null;

var getParsedJSON = function (url, callback){ 
	
	var request = new XMLHttpRequest();
	
	request.onreadystatechange = function(){
		if (request.readyState == 4 && request.status == 200){
			dailyJSON = JSON.parse(request.responseText);
			detailedJSON = JSON.parse(request.responseText)
			callback();
		}
	}

	request.open("GET", url, true);
	request.send(null);
} //lecture slides




function callDisplay(){
	
	if (dailyJSON == null){
		getParsedJSON('Daily.json', displayJSON);
	}
	else{
		displayJSON();
	}
}






function displayJSON(){
	
    var day = document.getElementById("mySelect");
	
	var num_day = parseInt(day.value);
	
    var arrDaily = dailyJSON.list;
	
	var pressCheck = document.getElementById("pressCheck").checked;
	
	var humCheck = document.getElementById("humCheck").checked;
	
	var windCheck = document.getElementById("windCheck").checked; //w3schools
	
	
   
    var dailyInfo = "<table>";
	
    dailyInfo += "<tr><th>Click for day breakdown!</th><th>Day</th><th>Visual</th><th>Daytime Temp</th><th>Minimum Temp</th><th>Maximum Temp</th><th>Night-time Temp</th><th>Evening Temp</th><th>Morning Temp</th><th>Wind Direction</th><th>Clouds</th><th>Rain</th>"; 
	
	if (pressCheck == true){
		dailyInfo += "<th>Pressure</th>";}
	
		if (humCheck == true){
		dailyInfo += "<th>Humidity (Relative)</th>";}
		
		if (windCheck == true){
		dailyInfo += "<th>Wind Speed</th>";}
	
    for (var i=0; i < num_day; i++){
		
		var dayNumber = i+1;
        var tempDay = arrDaily[i].temp.day;
        var tempMin = arrDaily[i].temp.min;
		var tempMax = arrDaily[i].temp.max;
        var tempNight = arrDaily[i].temp.night;
		var tempEve = arrDaily[i].temp.eve;
        var tempMorn = arrDaily[i].temp.morn;
        var deg = arrDaily[i].deg;
		var clouds = arrDaily[i].clouds;
        var rain = arrDaily[i].rain;
		var pressure = arrDaily[i].pressure;
		var humidity = arrDaily[i].humidity;
		var speed = arrDaily[i].speed;
		var icon = arrDaily[i].weather[0].icon;
		
        dailyInfo += "<tr><td><button onclick='parseDetailed(" + i + ")'>Details</button></td><td>" + dayNumber + "</td><td>" + "<img id='icon' src='http://openweathermap.org/img/w/" + icon + ".png'>" + "</td><td>" + tempDay + "° Celsius</td><td>" + tempMin + "° Celsius</td><td>" + tempMax + "° Celsius</td><td>" + tempNight + "° Celsius" + "</td><td>" + tempEve + "° Celsius</td><td>" + tempMorn + "° Celsius</td><td>" + deg + "°" +"</td><td>" + clouds + "</td><td>" + rain + " mm" +"</td>";
		
		if (pressCheck == true){
		dailyInfo += "<td>"+ pressure +" mb</td>";}
	
		if (humCheck == true){
		dailyInfo += "<td>"+ humidity +"%</td>";}
		
		if (windCheck == true){
		dailyInfo += "<td>"+ speed +" kn</td>";}
				
    }

    	dailyInfo += "</table>";
    
    	document.getElementById("id01").innerHTML = dailyInfo;
}






function parseDetailed(buttonNum){
	
		var detailsNum = buttonNum;
	
		var xmlhttp = new XMLHttpRequest();
	
		var url = "Detailed.json";
	
		xmlhttp.onreadystatechange = function() {
			
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				var parsedDetails = JSON.parse(xmlhttp.responseText);
				displayDetailedJSON(detailsNum, parsedDetails);
			}
		}
		
		xmlhttp.open("GET", url, true);
	
		xmlhttp.send();
}






function displayDetailedJSON(detailsNum,parsedDetails){
	
	var detailsNum2 = detailsNum*8;
		
	var arrHourly = parsedDetails.list;
	
	var hourlyInfo = "<table>";
	
	hourlyInfo += "<tr><th>Time</th><th>Visual</th><th>Description</th><th>Daytime Temp</th><th>Minimum Temp</th><th>Maximum Temp</th><th>Sea Level</th><th>Ground Level</th><th>Cloud Coverage</th><th>Pressure</th><th>Humidity (Relative)<th>Wind Speed</th><th>Wind Direction</th></tr>";
	
	
	if (detailsNum2 != 0){
		
		var x = detailsNum2-4;
		var y = detailsNum2+4;}
	
	else if(detailsNum2 == 0){
		var x = 0;
		var y = 4;
	} //stack exchange on conditional variables
		
		for (var i=x; i < y; i++){

			var dayTemp = arrHourly[i].main.temp;
			var minTemp = arrHourly[i].main.temp_min; 
			var maxTemp = arrHourly[i].main.temp_max;
			var seaLevel = arrHourly[i].main.sea_level; 
			var grndLevel = arrHourly[i].main.grnd_level;
			var description = arrHourly[i].weather[0].description; 
			var icon = arrHourly[i].weather[0].icon; 
			var clouds = arrHourly[i].clouds.all; 
			var windSpeed = arrHourly[i].wind.speed; 
			var windDegrees = arrHourly[i].wind.deg; 
			var pressure = arrHourly[i].main.pressure;
			var humidity = arrHourly[i].main.humidity; 
			var timeDate = arrHourly[i].dt_txt.slice(11, -3); //stack exchange forum on slicing


			hourlyInfo += "<tr><td>" + timeDate + "</td><td>" + "<img id='icon' src='http://openweathermap.org/img/w/" + icon + ".png'></td><td>" + description + "</td><td>" + dayTemp + "° Celsius</td><td>" + minTemp + "° Celsius</td><td>" + maxTemp + "° Celsius</td><td>" + seaLevel + "</td><td>" + grndLevel + "</td><td>" + clouds + "%</td><td>" + pressure + " mb" + "</td><td>" + humidity + "%</td><td>" + windSpeed + " kn</td><td>" + windDegrees + "°</td></tr>";
	}
	
		hourlyInfo += "</table>";
	
		document.getElementById('id02').innerHTML = hourlyInfo;
	
	}
