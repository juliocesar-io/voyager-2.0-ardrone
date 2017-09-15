from flask import Flask, render_template
from flask_socketio import SocketIO, emit
# local
from lidar import Lidar_Lite
from servo import Servo

app = Flask(__name__)
app.config['SECRET_KEY'] = '23dfgmdfgm345!'
socketio = SocketIO(app)

lidar = Lidar_Lite()
connected = lidar.connect(1)

servo = Servo()
connected = servo.connect(14)

def background_lidar_thread():
    while True:
        socketio.sleep(10)
        if connected < -1:
            socketio.emit('lidar_response', {'data': 'lidar_cm', 'cm': "Not Connected"})
        else:
            while (connected >= 0):
                dist = lidar.getDistance()
                print dist
        	if dist < 40:
        		print "Retroceder!"
            socketio.emit('lidar_response', {'data': 'lidar_cm', 'cm': dist})

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('goForward')
def test_message():
    print "GET IT!"

@socketio.on('connect')
def test_connect():
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_lidar_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})

if __name__ == '__main__':
    socketio.run(app)
