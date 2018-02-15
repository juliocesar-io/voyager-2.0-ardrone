var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path'),
    firebase = require("firebase-admin"),
    serviceAccount = require("./firebasekey.json"),
    EventSource = require('eventsource');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://voyager01.firebaseio.com"
});

var refS = firebase.database().ref('samples/')

http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});



app.use('/static', express.static('static'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/templates/data.html');
});


app.get('/data.json', function(req, res) {
  res.sendFile(__dirname + '/data.json');
});

app.get('/graph', function(req, res) {
  res.sendFile(__dirname + '/templates/graph.html');
});


var sockets = {};

io.on('connection', (socket) => {
  sockets[socket.id] = socket;
  console.log("Clientes conectados ", Object.keys(sockets).length);
});

function writeSampleData(json) {
  refS.push(json);
}


function connectToParticle(deviceID, accessToken) {
    console.log('Conectando a Particle ..')

    const API_URL = 'https://api.spark.io/v1/devices/'

    var eventSource = new EventSource(API_URL + deviceID + "/events/?access_token=" + accessToken);

    eventSource.addEventListener('open', (e) => {
        console.log("Opened!"); },false)

    eventSource.addEventListener('error', (e) => {
        console.log("Errored!"); },false)

    eventSource.addEventListener('onData', (e) => {
        var rawData = JSON.parse(e.data);
        var parsedData = JSON.parse(rawData.data);
        console.log('Nueva muestra', parsedData)
        writeSampleData(parsedData);
    }, false)

    return eventSource
}


// Conectarse a el API de particle, obtener Token en https://build.particle.io
connectToParticle('TuDeviceID', 'TuAccessToken');

