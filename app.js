var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http)


  io.sockets.on('connection', function (socket) {

       socket.on('lidar_response', function (data) {
         console.log("Lidar: " + data);
       });
  });
