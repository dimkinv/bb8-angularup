import * as Cylon from 'cylon';
import * as http from 'http';
import * as express from 'express';
import * as io from 'socket.io';

const app = express()
const server = http.createServer(app);
const socket = io(server);

let queue = [{}];

server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

const DIRECTIONS = {
    FORWARD: 0,
    RIGHT: 90,
    BACKWARDS: 180,
    LEFT: 270
}
let bot;

connectTobb8();
initExpress();


function initExpress() {
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });
}

socket.on('connection', (client) => {
    console.log(`connected to ${client.id}`);
    client.emit('play');
    client.on('move', (payload: { direction: number }) => {
        console.log(`angle: ${payload.direction}`);
        // move(payload.direction);
    });
});

let currentTimeout = null;
function move(directionAngle: number) {
    if (currentTimeout) {
        clearTimeout(currentTimeout);
        bot.bb8.roll(60, directionAngle);
        setStopTimeout();
        return;
    }

    bot.bb8.roll(60, directionAngle);
    setStopTimeout();
}

function setStopTimeout() {
    currentTimeout = setTimeout(() => {
        console.log('stopped');
        bot.bb8.stop();
        currentTimeout = null;
    }, 600);
}

function connectTobb8() {
    Cylon.robot({
        connections: {
            bluetooth: {
                adaptor: "central",
                uuid: '1f7285a436eb4bfaa488a08eccc66ab0',
                module: "cylon-ble"
            }
        },
        devices: {
            bb8: { driver: "bb8", module: "cylon-sphero-ble" }
        },

        work: function (_bot) {
            bot = _bot;
            bot.bb8.color(0x00FFFF);
        }
    }).start();
}