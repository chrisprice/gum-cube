require([ './comms', './webcam', './jquery', './transform', './image-cube' ], function(comms,
		webcam, $, transform, Cube) {

	// very basic UI to deal with incoming messages
	var $container = $('<div/>').appendTo('body').css({
		webkitTransition : 'webkit-transform 0.3s linear'
	});
	var cube = new Cube($container, 128, 96, 500, 100);
	transform.useMouseRotationControl();

	webcam.create(128, 96).done(function(webcam) {

		var previousImageData = webcam.createImageData();
		var deltaImageData = webcam.createImageData();

		// request 5 fps indefinitely of imagedata objects
		// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
		webcam.requestFrameImageData(10, 0).progress(function(imageData) {
			// manipulate the image
			var data = imageData.data;
			var previousData = previousImageData.data;
			var deltaData = deltaImageData.data;
			for ( var i = 0, l = data.length; i < l; i += 4) {
				var r = data[i];
				var g = data[i + 1];
				var b = data[i + 2];
				// CIE luminance for the RGB
				// The human eye is bad at seeing red and blue, so we
				// de-emphasize them.
				var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
				v = Math.round(v / 16) * 16;
				// if (v < 200) {
				// if (Math.abs(previousData[i] - v) > 10) {
				deltaData[i] = data[i];
				deltaData[i + 1] = data[i + 1];
				deltaData[i + 2] = data[i + 2];
				deltaData[i + 3] = 255;
				// } else {
				// deltaData[i] = deltaData[i + 1] = deltaData[i + 2] = 0;
				// deltaData[i + 3] = 0;
				// }
				data[i] = data[i + 1] = data[i + 2] = v;
			}
			// draw the image back onto the canvas
			webcam.putImageData(deltaImageData);
			previousImageData = imageData;
			var $img = $("<img/>").attr('src', webcam.toDataURL()).scale(5).css('opacity', 0.2);
			cube.add($img);
		});
	});

});
