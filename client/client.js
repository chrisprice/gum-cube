require(
		[ './webcam', './jquery', './transform', './image-cube', './mouse-control', './dat.gui.min' ],
		function(webcam, $, transform, Cube, MouseControl) {
			var options = {
				background : '#000',
				renderMovement : true,
				renderStatic : true,
				renderThreshold : 5,
				paused : false,
				pause : function() {
					this.paused = !this.paused;
				},
				perspective : 1000000
			};

			var $body = $('body').preserve3d();
			var cube = new Cube($('.cube'), 128, 96, 128, 100);
			var $container = $('.container');
			var mouseControl = new MouseControl($container);

			webcam.create(128, 96).done(function(webcam) {

				var previousImageData = webcam.createImageData();
				var deltaImageData = webcam.createImageData();

				// request 5 fps indefinitely of imagedata objects
				// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
				webcam.requestFrameImageData(10, 0).progress(function(imageData) {
					if (options.paused) {
						return;
					}
					// manipulate the image
					var data = imageData.data;
					var previousData = previousImageData.data;
					var deltaData = deltaImageData.data;
					for ( var i = 0, l = data.length; i < l; i += 4) {
						var r = data[i];
						var g = data[i + 1];
						var b = data[i + 2];
						var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
						deltaData[i] = data[i];
						deltaData[i + 1] = data[i + 1];
						deltaData[i + 2] = data[i + 2];
						if (Math.abs(previousData[i] - v) > options.renderThreshold) {
							deltaData[i + 3] = options.renderMovement ? 255 : 0;
						} else {
							deltaData[i + 3] = options.renderStatic ? 255 : 0;
						}
						data[i] = data[i + 1] = data[i + 2] = v;
					}
					// draw the image back onto the canvas
					webcam.putImageData(deltaImageData);
					previousImageData = imageData;
					var $img = $("<img/>").attr('src', webcam.toDataURL())/*
																			 * .css({
																			 * outline :
																			 * '1px
																			 * solid
																			 * white',
																			 * width :
																			 * 128,
																			 * height :
																			 * 96 })
																			 */;
					cube.add($img);
					$body.css('background', options.background).perspective(options.perspective);
				});
			});

			var gui = new dat.GUI();
			gui.add(cube, 'opacity', 0, 1);
			gui.add(cube, 'scaleX', 0, 10);
			gui.add(cube, 'scaleY', 0, 10);
			gui.add(cube, 'scaleZ', 0, 100);
			gui.addColor(options, 'background');
			gui.add(options, 'renderMovement');
			gui.add(options, 'renderStatic');
			gui.add(options, 'renderThreshold', 0, 255);
			gui.add(options, 'pause');
			gui.add(mouseControl, 'resetRotation');
			gui.add(options, 'perspective', {
				'1,000,000' : 1000000,
				'1,000' : 1000,
				'500' : 500,
				'100' : 100,
				'50' : 50
			});
			// momentum
		});
