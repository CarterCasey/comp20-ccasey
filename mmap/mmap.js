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
var line_connector; // An addition I thought would be interesting

var request; // I don't like doing this, but
			 // for the callback to work, it
			 // has to have a global scope.

var my_pos;  // Again, hate doing this, but
			 // have to communicate with the
			 // other user markers to get
			 // distance

// Called after page loads - renders map, finds user
function init() {
	// Initialize to Tufts' position.
	var tufts_pos = new google.maps.LatLng(42.4069,
										  -71.1198);
	var options = {zoom: 17, center: tufts_pos};
	var map_canvas = document.getElementById("map-canvas");
	
	map = new google.maps.Map(map_canvas, options);
	info_window = new google.maps.InfoWindow;
	line_connector = new google.maps.Polyline({
		geodesic: true, map: map, strokeColor: "#00B8FF"
	});

	// Remove line if user clicks on the info_window's "x" button
    google.maps.event.addListener(info_window, "closeclick", function () {
    	line_connector.setMap(null);
    });

    // Close info_window and remove line if user clicks outside of it
	google.maps.event.addListener(map, "click", function () {
		info_window.close();
		line_connector.setMap(null);
	});

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
	my_pos = new google.maps.LatLng(pos.coords.latitude,
									pos.coords.longitude);
	map.panTo(my_pos);
	showMe(my_pos);

	findOthers(my_pos); // make datastore request, then show on map
}

// Display marker and set up
// info window for user
function showMe(my_pos) {
	var my_icon = { size: new google.maps.Size(75, 75),
        	  scaledSize: new google.maps.Size(75, 75),
        	  	  origin: new google.maps.Point(0, 0),
        	  	  anchor: new google.maps.Point(52, 6),
        			 url: "kirby-icon.png"};

	var my_marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: my_pos, map: map,
		title: "This is you. You are RichardDrake. RichardDrake is here.",
    	icon: my_icon
    });

	google.maps.event.addListener(my_marker, 'click',
		function() {
			info_window.close();
	    	line_connector.setMap(null);
			var content = document.createElement("div");
			content.innerHTML = "<h3>You (RichardDrake)</h3>\n<p>" +
								my_marker.title + "</p>"

			info_window.setContent(content);
			info_window.open(map, my_marker);
		}
	);
}

// Make Ajax request for user
// positions (and names) in datastore
function findOthers(user_pos) {
	var login = "RichardDrake";

	request = new XMLHttpRequest;
	request.open("POST", "https://mmap-db.herokuapp.com/sendLocation");
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
		alert("Error finding other users:" + other_locs["error"]);
		return;
	}

	for (i in other_locs) {
		if (other_locs[i]["login"] != "RichardDrake") {
			showUser(other_locs[i]);
		}
	}
}

// Display other member with location
// and Haversine distance from user.
function showUser(data) {
	var their_icon = { size: new google.maps.Size(57, 75),
        		 scaledSize: new google.maps.Size(57, 75),
        	  		 origin: new google.maps.Point(0, 0),
        	  		 anchor: new google.maps.Point(0, 0),
        				url: "waddle-dee-icon.png"};

    var their_pos = new google.maps.LatLng(data["lat"], data["lng"]);

	var their_marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: their_pos, map: map,
		title: "This is " + data["login"] + ". " + data["login"] + " is here.",
    	icon: their_icon
    });

	google.maps.event.addListener(their_marker, "click",
		function() {
			info_window.close();
			var their_pos = their_marker.getPosition();
			var distance = haversine(their_pos, my_pos);

			var name = data["login"];
			var content = document.createElement("div");
			var header  = document.createElement("h3");
			header.innerHTML = name;
			content.appendChild(header);
			var description = document.createElement("p");
			description.innerHTML = distance.toFixed(4) +
									" miles away from you";
			content.appendChild(description);

			info_window.setContent(content);
			info_window.open(map, their_marker);

			line_connector.setPath([my_pos, their_pos]);
			line_connector.setMap(map);
		}
	);
}

// Calculate distance from other user
// to current user.
function haversine(their_pos, my_pos) {
	var my_lat = my_pos.lat();
	var my_lng = my_pos.lng();
	var their_lat = their_pos.lat();
	var their_lng = their_pos.lng();

	var R = 3958.755866; // miles
	var their_phi = their_lat.toRad();
	var delta_phi = my_lat.toRad();
	var delta_phi = (their_lat - my_lat).toRad();
	var delta_lambda = (their_lng - my_lng).toRad();

	var a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
	        Math.cos(their_phi) * Math.cos(delta_phi) *
	        Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}
// Convert degrees to radians
if (Number.prototype.toRad === undefined) {
    Number.prototype.toRad = function() { return this * Math.PI / 180; };
}

