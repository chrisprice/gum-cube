require(
		[ './webcam', './jquery', './transform', './image-cube', './mouse-control', './dat.gui.min' ],
		function(webcam, $, transform, Cube, MouseControl) {
			var errorText = 'Your browser either does not support getUserMedia,'
					+ ' it is not enabled or you have denied access to the device. '
					+ '<a href="http://www.html5rocks.com/en/tutorials/getusermedia/intro/#toc-enabling">Instructions</a>.';

			var frameEmitter = null;
			var options = {
				background : '#000',
				opacity : 0.2,
				renderMovement : true,
				renderStatic : true,
				renderThreshold : 5,
				paused : false,
				pause : function() {
					if (frameEmitter.state() === 'pending') {
						frameEmitter.reject();
					} else {
						requestFrames(options.fps);
					}
				},
				perspective : 1000,
				fps : 10,
				frameCount : 10
			};

			var $body = $('body').preserve3d();
			$body.css('background', options.background);
			var cube = new Cube($('.cube'), 128, 96, 96, options.frameCount);
			var $container = $('.container');
			var mouseControl = new MouseControl($container);
			var webcamControl = null;
			webcam.create(128, 96).then(function(webcam) {
				webcamControl = webcam;
				// TODO: enable/disable
				$(webcamControl.video).css({
					width : 128,
					height : 96
				}).appendTo($body);

				requestFrames(options.fps);
			}, function(error) {
				$('footer').html(errorText);
			});

			function requestFrames(fps) {
				if (!webcamControl) {
					return;
				}

				var previousImageData = webcamControl.createImageData();
				var deltaImageData = webcamControl.createImageData();
				function onFrame() {
					if (options.paused) {
						return;
					}
					var imageData = webcamControl.getImageData();
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
					previousImageData = imageData;
					webcamControl.putImageData(deltaImageData);
					cube.add(webcamControl.canvas);

				}

				if (frameEmitter) {
					frameEmitter.reject();
				}
				frameEmitter = webcamControl.requestFrameNotifications(fps, 0).progress(onFrame);
			}

			function updateMisc() {
				$body.css('background', options.background).perspective(options.perspective);
				$container.css('opacity', options.opacity)
			}
			updateMisc();

			var gui = new dat.GUI();
			gui.addColor(options, 'background').onChange(updateMisc);
			gui.add(options, 'perspective', {
				'1,000,000' : 1000000,
				'    1,000' : 1000,
				'      500' : 500,
				'      100' : 100,
				'       50' : 50
			}).onChange(updateMisc);
			gui.add(options, 'opacity', 0, 1).onChange(updateMisc);
			gui.add(cube, 'scaleXY', 0, 10);
			gui.add(cube, 'scaleZ', {
				'    1,000' : 1000,
				'      500' : 500,
				'      100' : 100,
				'       50' : 50,
				'       10' : 10,
				'        5' : 5,
				'        1' : 1
			});
			gui.add(options, 'renderMovement');
			gui.add(options, 'renderStatic');
			gui.add(options, 'renderThreshold', 0, 255);
			gui.add(mouseControl, 'rotationDamping', 0, 1);
			gui.add(mouseControl, 'resetRotation');
			gui.add(options, 'pause');
			gui.add(options, 'fps', 1, 15).onFinishChange(requestFrames);
			gui.add(options, 'frameCount', 2, 200).onFinishChange(function(value) {
				cube.setCount(value);
			});
		});
