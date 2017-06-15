import * as Cylon from 'cylon';
import * as express from 'express';

const app = express()
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

    app.get('/move', (req, res) => {
        res.send('ok');
        let directionAngle = DIRECTIONS[req.query.direction];
        console.log(`angle: ${directionAngle}`);
        move(directionAngle);

        // if (directionAngle !== 0 && !directionAngle) {
        //     return;
        // }

        // after(200, () => {
        //     
        // });

        // after(2000, () => {
        //     bot.bb8.stop();
        // });
    });
}


let currentTimeout = null;
function move(directionAngle) {
    if (currentTimeout) {
        clearTimeout(currentTimeout);
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
    }, 1100);
}

app.get('/stop', () => {
    bot.bb8.stop();
    console.log('stopped');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

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
            // bot.bb8.color(0x00FFFF);
            // after(500, function () {
            //     bot.bb8.roll(60, 0);
            // });

            // after(3000, function () {
            //     bot.bb8.stop();
            // });
        }
    }).start();
}