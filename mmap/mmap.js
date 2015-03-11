// The core of Assignment 3 for Comp 20.
//
// Script that renders a map using the google maps API,
// finds the user's current location, as well as the stored
// location of all participating users, and plots all of them
// on the map.
//
// Author: Carter Casey

var map; // Make it global, like document

// Called after page loads - renders map, finds user
function init() {
	var tufts_pos = new google.maps.LatLng(0,0); //42.4069,
										        //-71.1198);
	var options = {zoom: 16, center: tufts_pos};
	var map_canvas = document.getElementById("map-canvas");
	map = new google.maps.Map(map_canvas, options);
	locate();
}

function showMe(my_pos) {
	var my_icon = { size: new google.maps.Size(75, 75),
        	  scaledSize: new google.maps.Size(75, 75),
        	  	  origin: new google.maps.Point(0, 0),
        	  	  anchor: new google.maps.Point(50, 75),
        			 url: "kirby.png"};

	var my_marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: my_pos, map: map,
		title: "This is you. You are RichardDrake. RichardDrake is here.",
    	icon: my_icon
    });

	var my_info = new google.maps.InfoWindow;

	google.maps.event.addListener(my_marker, 'click',
		function() {
			my_info.setContent(my_marker.title);
			my_info.open(map, my_marker);
		}
	);
}

// Function to be called when
// getCurrentPosition succeeds
function findMe(pos) {
	var my_pos = new google.maps.LatLng(pos.coords.latitude,
										pos.coords.longitude);
	map.panTo(my_pos);
	showMe(my_pos);

	// findOthers(my_pos); // make datastore request
}

// Function to be called when
// getCurrentPosition fails
function lostMe(err) {
	alert("Error: " + err.message);
}

// Find my location
function locate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(findMe, lostMe,
			{enableHighAccuracy: false, timeout: 15000, maximumAge: 0});
			// If it takes more than 15 seconds, it's taking too long
	}
}

