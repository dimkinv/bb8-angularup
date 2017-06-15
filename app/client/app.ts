var DEBOUNCE_TIME = 500;

if (window.DeviceOrientationEvent) {
    document.getElementById('title').innerHTML = 'Connecting...'
    connectToSocket();
} else {
    document.getElementById("title").innerHTML = "Not supported."
}

function waitForTurn() {
    document.getElementById("title").innerHTML = "Connected! wait for your turn";
}

function play(socket) {
    document.getElementById("title").innerHTML = "Go PLaY!";

    let accelleration = 0;
    let img = document.getElementById('go');
    img.addEventListener('touchstart', function(){
        accelleration = 1;
    });
    img.addEventListener('touchend', function(){
        accelleration = 0;
    });

    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function (eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        var tiltLR = eventData.gamma;

        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;

        // alpha is the compass direction the device is facing in degrees
        var dir = eventData.alpha

        // call our orientation event handler
        visualHandler(tiltLR, tiltFB, dir);
        
        // document.getElementById('transAngle').innerHTML = calcAngle(tiltLR, tiltFB, dir);
        if(tiltFB < -20 && accelleration > 0){
            socket.emit('move', { direction:  dir})
        }
        
    }, false);
}

function disconenct() {
    window.removeEventListener('deviceorientation');
    let img = document.getElementById('go');
    img.removeEventListener('touchstart');
    img.removeEventListener('touchend');
   

    document.getElementById("title").innerHTML = "Cio...";
}

function visualHandler(tiltLR, tiltFB, dir) {
    document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR).toString();
    document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB).toString();
    document.getElementById("doDirection").innerHTML = Math.round(dir).toString();
    // Apply the transform to the image
    var logo = document.getElementById("imgLogo");
    logo.style.webkitTransform =
        "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + (tiltFB * -1) + "deg)";
    logo.style.MozTransform = "rotate(" + tiltLR + "deg)";
    logo.style.transform =
        "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + (tiltFB * -1) + "deg)";
}

function connectToSocket() {
    var socket = io('http://192.168.193.132:3000');
    socket.on('connect', function () {
        waitForTurn();
    });

    socket.on('play', function (data) { 
        play(socket);
    });

    socket.on('disconnect', function () {
        disconenct();
    });
}

function calcAngle(tiltLR, tiltFB, dir) {
    // tiltLR is the left-to-right tilt in degrees, where right is positive 
    // tiltFB is the front-to-back tilt in degrees, where front is positive -90 - 90
    // dir is the compass direction the device is facing in degrees 0-360

    // 0-90, -20 - 20 -> 0 right
    // 0, -90 -> 90 FW
    // -90 - 0, -20 - 20 -> 180 left
    // 0, 90 -> 270 back


    if(tiltFB < -20){
        return dir;
    }
    return 0;
}

function round(num){
    return Math.round(num * 100) / 100;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if ( !immediate ) {
				func.apply(context, args);
			}
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait || 200);
		if ( callNow ) { 
			func.apply(context, args);
		}
	};
};