// The core of Assignment 2 for Comp 20.
//
// Script that renders a map using the google maps API,
// finds the user's current location, as well as the stored
// location of all participating users, and plots all of them
// on the map.
//
// Author: Carter Casey

var map; // Make the map global, like document
var info_window; // Must have exactly one info window.

var request; // I don't like doing this, but
			 // for the callback to work, it
			 // has to have a global scope.

// Called after page loads - renders map, finds user
function init() {
	var tufts_pos = new google.maps.LatLng(42.4069,
										  -71.1198);
	var options = {zoom: 16, center: tufts_pos};
	var map_canvas = document.getElementById("map-canvas");
	
	map = new google.maps.Map(map_canvas, options);
	info_window = new google.maps.InfoWindow;

	locate();
}

// Find user's location
function locate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(findMe, lostMe,
			{enableHighAccuracy: false, timeout: 15000, maximumAge: 0});
			// If it takes more than 15 seconds, it's taking too long
	}
}

// Function to be called when
// getCurrentPosition fails
function lostMe(err) {
	alert("Error: " + err.message);
}

// Function to be called when
// getCurrentPosition succeeds
function findMe(pos) {
	var my_pos = new google.maps.LatLng(pos.coords.latitude,
										pos.coords.longitude);
	map.panTo(my_pos);
	showMe(my_pos);

	findOthers(my_pos); // make datastore request
}

// Display marker and set up
// info window for user
function showMe(my_pos) {
	var my_icon = { size: new google.maps.Size(300, 300),
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

	google.maps.event.addListener(my_marker, 'click',
		function() {
			info_window.close();
			info_window.setContent(my_marker.title);
			info_window.open(map, my_marker);
		}
	);
}

// Make Ajax request for user
// positions (and names) in datastore
function findOthers(user_pos) {
	var login = "RichardDrake";

	request = new XMLHttpRequest;
	request.open("POST", "https://secret-about-box.herokuapp.com/sendLocation");
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.onreadystatechange = parseResponse;

	var params = "login=" + login +
				 "&lat="  + user_pos.lat() +
				 "&lng="  + user_pos.lng() ;

	request.send(params);
}

// Wait for ready state of 4
// then attempt to parse JSON
function parseResponse() {
	if (request.readyState == 4) {
		if (request.status == 200) {
			showOthers(JSON.parse(request.responseText));
		} else {
			alert("Error(" + response.status +
						 "): Other user locations are unavailable.");
		}
	}
}

// Make markers and info windows
// for users found in datastore
function showOthers(other_locs) {
	// Hacky, but gives useful alert if
	// request is broken.
	if (Object.keys(other_locs)[0] == "error") {
		alert("Error:" + other_locs["error"]);
		return;
	}

	for (i in other_locs) {
		if (other_locs[i]["login"] != "RichardDrake") {
			showThem(other_locs[i]);
		}
	}
}

// Display other member with location
// and Haversine distance from user.
function showThem(data) {
	var their_icon = { size: new google.maps.Size(200, 265),
        		 scaledSize: new google.maps.Size(57, 75),
        	  		 origin: new google.maps.Point(0, 0),
        	  		 anchor: new google.maps.Point(51, 75),
        				url: "waddle_dee.png"};

    var their_pos = new google.maps.LatLng(data["lat"], data["lng"]);

	var their_marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: their_pos, map: map,
		title: "This is " + data["login"] + ". " + data["login"] + " is here.",
    	icon: their_icon
    });

	google.maps.event.addListener(their_marker, 'click',
		function() {
			info_window.close();
			info_window.setContent(their_marker.title);
			info_window.open(map, their_marker);
		}
	);
}

