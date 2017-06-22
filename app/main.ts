import * as Cylon from 'cylon';
import * as http from 'http';
import * as express from 'express';
import * as io from 'socket.io';
import * as mqtt from 'mqtt';

const app = express()
const server = http.createServer(app);

let queue = [{}];
let currentTimeout = null;
let bot;

const DIRECTIONS = {
    FORWARD: 0,
    RIGHT: 90,
    BACKWARDS: 180,
    LEFT: 270
};

let colors = {
    red: "#FF0000",
    blue: "#0000D9",
    lime: "#00FF00",
    yellow: "#FFFF00",
    white: "#FFFFFF",
    purple: "#FF00FF",
    cyan: "#03ECEC",
    green: "#016601"
};

let client  = mqtt.connect('mqtt://test.mosquitto.org:1883');
 
client.on('connect', function (data) {
    client.subscribe('flow-bb8-output');
})
 
client.on('message', function (topic, message) {
    message = JSON.parse(message);

    switch(message.command) {
        case 'roll':
            bot.bb8.roll(60, message.value);
        break;
        case 'stop':
            bot.bb8.stop();
            clearInterval(currentTimeout);
        break;
        case 'color':
            bot.bb8.color(colors[message.value]);
        break;
        case 'disco':
            disco();
        break;
        case 'desk-buddy':
            moveHead();
        break;
    }
})

function disco(){
    currentTimeout = setInterval(() => {
        bot.bb8.randomColor();
    }, 200);
}

function moveHead(){
    currentTimeout = setInterval(() => {
        bot.bb8.roll(0, Math.floor(Math.random() * 180));
    }, 3000);
}

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
        console.log('stoppped');
        bot.bb8.stop();
        currentTimeout = null;
    }, 600);
}

function connectTobb8() {
    Cylon.robot({
        connections: {
            bluetooth: {
                adaptor: "central",
                uuid: 'd544f74c30f6',
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


connectTobb8();

server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});