
const socket = require('socket.io-client')('http://0.0.0.0:8080');

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

socket.on('connect', () => {
    console.log('Connected to Socket');
    socket.emit('ping', {});
});

socket.on('lidar_response', (data) => {

  console.log(data.cm)

  if (data.cm < 40) {
    console.log("back!");
  }
});

socket.once('takeoff', () => {
  client.takeoff();
});

socket.once('land', () => {
  client.land();
});

socket.once('up', () => {
  client.up();
});

socket.once('down', () => {
  client.down();
});
socket.once('left', () => {
  client.left();
});

socket.once('right', () =>  {
  client.right();
});

console.log('Started');
