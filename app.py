from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from threading import Lock
from lidar import Lidar_Lite
import os
import signal
import subprocess


async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = '23dfgmdfgm345!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None
servo_pro = None
thread_lock = Lock()

lidar = Lidar_Lite()
connected_l = lidar.connect(1)


def background_lidar_thread():
    while True:
        if connected_l < -1:
            socketio.emit('lidar_response', {'data': 'lidar_cm', 'cm': "Not Connected"})
        else:
            while (connected_l >= 0):
                dist = lidar.getDistance()
                socketio.sleep(0.1)
                socketio.emit('lidar_response', {'data': 'lidar_cm', 'cm': dist})
        	if dist < 40:
        		print "Retroceder!"


@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('ServoOn-Off')
def servo_control(estado):
    global servo_pro
    if estado and servo_pro is None:
        servo_pro = subprocess.Popen("./servo.py", stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid)
    else:
        os.killpg(os.getpgid(servo_pro.pid), signal.SIGTERM)
        servo_pro = None


@socketio.on('connect')
def test_connect():
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_lidar_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True, port=8080)
