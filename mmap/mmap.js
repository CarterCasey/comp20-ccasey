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

// Function to be called when
// getCurrentPosition succeeds
function findMe(pos) {
	var my_pos = new google.maps.LatLng(pos.coords.latitude,
										pos.coords.longitude);
	map.panTo(my_pos)
	// TODO: add marker for myself
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
			{enableHighAccuracy: false, timeout: 10000, maximumAge: 0});
			// If it takes more than 10 seconds, it's taking too long
	}
}

