// Initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
var mongo = require('mongodb');
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization and connect to database
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
        db = databaseConnection;
});

//1. A POST /sendLocation API
app.post('/sendLocation', function(request, response) {

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    db.collection("locations", function (error2, locations){
        var newlogin = request.body.login;
        var newlat = parseFloat(request.body.lat);
        var newlng = parseFloat(request.body.lng);
        var newcreated_at = Date.now();
        var entry = {
            "login": validator.escage(newlogin),
            "lat": newlat,
            "lng": newlng,
            "created_at": newcreated_at
        };

        //check for undefined fields
        if ( newlogin == undefined || newlat == undefined || newlng == undefined ) {
            response.send({"error":"Whoops, something is wrong with your data!"});  
            return;
        } 
        //check for duplicates & enter new if none
        locations.update({"login":newlogin}, entry, {upsert: true}, function(err, coll){ 
            if (!err) {
                //need to return a JSON string that is an array of objects
                locations.find().toArray(function (error, results){
                    if (!error) {
                        response.send(results);
                    }
                });
            } else {
                response.send({"error":"Whoops, something is wrong with your data!"});
            }
        }); 
    });

});

//2. GET /location.json API
app.get('/location.json', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    var loginsearch = request.query.login;
    //if specific login not found, send blank string
    if ( loginsearch == null || loginsearch == undefined ) {
        response.send('{}'); 
    } else {
        db.collection('locations', function(err, collection){
            collection.find({"login":loginsearch}).toArray(function(errorQuery, result){
                //if specific login not found, send blank string
                if (errorQuery) {
                    response.send('{}');
                } else {
                    response.send(result[0]); //check
                }
            }); 
        });
    }
});


//3. Home, the root, the index in HTML, need to show list of all check-ins for all logins sorted in descending order by timestamp
app.get('/', function(request, response) {
    //Allow CORS
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    //toRender holds HTML text for a response.
    toRender = "<!DOCTYPE html><html><head><title>The Server for the Real Marauder's Map</title></head><body><h1>Where all the people at?</h1>";

    db.collection("locations", function (err2, coll){
        //check this
        coll.find({}).sort({"created_at":-1}).toArray(function(a, x) {
            console.log(x);
            for( var i = 0; i < x.length; i++) {
                console.log("iterating over x" + x[i]);
                var add = "<p>" + x[i].login + " checked in at " + x[i].lat + ", " + x[i].lng + " on " + x[i].created_at + ".</p>" ;
                toRender = toRender + add;
            }
            toRender = toRender + "</body></html>"
            response.send(toRender);
        });

    });

});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);
