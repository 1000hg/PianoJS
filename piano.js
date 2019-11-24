const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const playBtn = document.getElementById('play-btn');



document.addEventListener('keydown', playing);

var MEDIA_ELEMENT_NODES = new WeakMap();
var context = new(window.AudioContext || window.webkitAudioContext)();

var analyser = context.createAnalyser();
analyser.fftSize = 256;


var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);


var recorder = [];
var checkRecord = false;
var stopMusic = false;
var src;

function playing(e) {

	const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
	const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);



	if (!key)
		return;

	//var context = new AudioContext();
	//console.log(audio);


	audio.oncanplay = function () {

		if (checkRecord) {
			recorder.push(Array.from(stopwatch.times));
			recorder.push(audio);
			//console.log(recorder);
		}

		if (MEDIA_ELEMENT_NODES.has(this)) {
			src = MEDIA_ELEMENT_NODES.get(this);
			//console.log("2");
		} else {
			src = context.createMediaElementSource(this);
			//console.log("1 : " + this);
			MEDIA_ELEMENT_NODES.set(this, src);
			//console.log(this + ", " + MEDIA_ELEMENT_NODES.has(this));			
		}

		//var src = context.createMediaElementSource(this);

		//console.log(analyser);

		src.connect(analyser);
		analyser.connect(context.destination);

	}

	var canvas = document.getElementById("canvas");

	canvas.width = window.innerWidth;
	canvas.height = 300;

	var ctx = canvas.getContext("2d");


	var Width = canvas.width;
	var Height = canvas.height;

	var barWidth = (Width / bufferLength) * 2;
	var barHeight;


	var x = 0

	function renderFrame() {
		requestAnimationFrame(renderFrame);

		x = 0;

		analyser.getByteFrequencyData(dataArray);

		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, Width, Height);

		for (var i = 0; i < bufferLength; i++) {
			barHeight = dataArray[i];

			var r = barHeight + (25 * (i / bufferLength));
			var g = 250 * (i / bufferLength);
			var b = 50;

			ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			ctx.fillRect(x, Height - barHeight, barWidth, barHeight);

			x += barWidth + 1;
		}
	}

	key.classList.add("pushKey");
	audio.currentTime = 0;
	audio.play();

	renderFrame();

	key.addEventListener("transitionend", removeTransition);
	context.resume();

}


function removeTransition(e) {
	this.classList.remove("pushKey");
}


class Stopwatch {

	constructor(display) {
		this.running = false;
		this.display = display;
		this.reset();
		this.print(this.times);
	}

	reset() {
		if (this.running) this.running = false;
		this.times = [0, 0, 0];
		this.print();
	}

	start() {
		if (!this.time) this.time = performance.now();

		if (!this.running) {
			this.running = true;
			requestAnimationFrame(this.step.bind(this));
		}
	}

	stop() {
		this.running = false;
		this.time = null;
	}

	step(timestamp) {
		if (!this.running) return;
		this.calculate(timestamp);
		this.time = timestamp;
		this.print();
		requestAnimationFrame(this.step.bind(this));
	}

	calculate(timestamp) {
		var diff = timestamp - this.time;
		this.times[2] += diff / 10;
		if (this.times[2] >= 100) {
			this.times[1] += 1;
			this.times[2] -= 100;
		}

		if (this.times[1] >= 60) {
			this.times[0] += 1;
			this.times[1] -= 60;
		}
	}

	print() {
		this.display.innerText = this.format(this.times);
	}

	format(times) {
		return `\
				${pad0(times[0], 2)}:\
				${pad0(times[1], 2)}:\
				${pad0(Math.floor(times[2]), 2)}`;
	}
}

function pad0(value, count) {
	var result = value.toString();
	for (; result.length < count; --count)
		result = '0' + result;
	return result;
}

let stopwatch = new Stopwatch(
	document.querySelector('.stopwatch')
)



startBtn.addEventListener('click', startRecord);
stopBtn.addEventListener('click', stopRecord);
resetBtn.addEventListener('click', resetRecord);
playBtn.addEventListener('click', playRecord);

function startRecord() {
	checkRecord = true;
	stopwatch.start();
}

function stopRecord() {
	checkRecord = false;
	stopwatch.stop();
}

function resetRecord() {
	checkRecord = false;
	stopwatch.reset();
	recorder = [];
}

function playRecord() {
	var delayTime;
	var checkPrev = false;

	for (let i = 0; i < recorder.length; i++) {
		if (i % 2 == 0) {
			delayTime = Math.round(recorder[i][2]) * 10 + recorder[i][1] * 1000 + recorder[i][0] * 10000;
			//console.log("11111 pre : " + prevWaitingTime + " curr : " + currentWaitingTime);
		} else {
			//console.log(delayTime);
			//console.log("22222 pre : " + prevWaitingTime + " curr : " + currentWaitingTime);
			startMusic(delayTime, i);
		}


	}

}

function startMusic(delayTime, i) {
	//console.log(delayTime);
	
	setTimeout(function () {
		recorder[i].currentTime = 0;
		recorder[i].play();
		
		//console.log(recorder[i]);
	}, delayTime);
}
