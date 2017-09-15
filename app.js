
const socket = require('socket.io-client')('http://0.0.0.0:8080');

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

socket.on('connect', () => {
    console.log('Connected to Socket');
    socket.emit('ping', {});
});

socket.on('lidar_response', (data) =>

  console.log(data.cm)

  if (data.cm < 40) {
    client.back()
  }
);

socket.on('takeoff', () =>
  client.takeoff();
);

socket.on('land', () =>
  client.land();
);

socket.on('up', () =>
  client.up();
);

socket.on('down', () =>
  client.down();
);
socket.on('left', () =>
  client.left();
);

socket.on('right', () =>
  client.right();
);

console.log('Started');
