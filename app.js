
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
  client.up(0.2);
});

socket.once('down', () => {
  client.down(0.2);
});
socket.once('left', () => {
  client.left(0.2);
});

socket.once('right', () =>  {
  client.right(0.2);
});

socket.once('eme', () =>  {
  client.disableEmergency()
});




console.log('Started');
