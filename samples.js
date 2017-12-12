
var firebase = require("firebase-admin");
var sleep = require('sleep')

var serviceAccount = require("./firebasekey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://voyager01.firebaseio.com"
});

var refS = firebase.database().ref('samples/')

function writeSampleData(sample, timestamp, lat, lon, cpm, temp, elev, uv, img, lidar) {

 refS.push({
  	sample: sample,
    timestamp: timestamp,
    lat: lat,
    lon: lon,
    cpm: cpm,
    temp: temp,
    elev: elev,
    uv: uv,
    img: img,
    lidar: lidar
  });
 sleep.sleep(1);
}

for (var i = 25; i >= 0; i--) {
	var d = new Date().toString();
	console.log(d);
	writeSampleData(i, d , "8.7544583","-75.8713815", 120 + i, 35 + i, 200 + i, 19 + i, "null", "OK");

}


