window.onload = function () {

	var file = document.getElementById("audioFile");
	var audio = document.getElementById("audio");

	file.onchange = function () {
		var files = this.files;
		console.log(files);
		audio.src = URL.createObjectURL(files[0]);
		audio.load();
		audio.play();
		var context = new AudioContext();
		var src = context.createMediaElementSource(audio);
		var analyser = context.createAnalyser();

		var canvas = document.getElementById("sound");
		canvas.width = window.innerWidth;
		canvas.height = 300;
		var ctx = canvas.getContext("2d");

		src.connect(analyser);
		analyser.connect(context.destination);

		analyser.fftSize = 1024;

		var bufferLength = analyser.frequencyBinCount;

		var dataArray = new Uint8Array(bufferLength);

		var width = canvas.width;
		var height = canvas.height;

		var barWidth = (width / bufferLength) * 2.5;
		var barHeight;
		var x = 0;

		function renderFrame() {
			requestAnimationFrame(renderFrame);

			x = 0;

			analyser.getByteFrequencyData(dataArray);

			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);

			for (var i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i];

				var r = barHeight + (25 * (i / bufferLength));
				var g = 250 * (i / bufferLength);
				var b = 100;

				ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
				ctx.fillRect(x, height - barHeight, barWidth, barHeight);

				x += barWidth + 1;
			}
		}

		audio.play();
		renderFrame();
	};
};


