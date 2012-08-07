require(
		[ './webcam', './jquery', './transform', './image-cube', './mouse-control', './dat.gui.min' ],
		function(webcam, $, transform, ImageCube, MouseControl) {
			function showError(html) {
				$('footer').html(html);
			}

			function Controller(options, webcam, imageCube, body, container, cube) {
				this.options = options;
				this.webcam = webcam;
				this.imageCube = imageCube;
				this.body = body;
				this.container = container;
				this.cube = cube;
				this.lastFrameTimestamp = 0;
			}

			Controller.prototype.resetDimensions = function() {
				this.webcam.setSize(this.options.width, this.options.height);
				this.previousImageData = this.webcam.createImageData();
				this.deltaImageData = this.webcam.createImageData();
				this.imageCube.setDimensions(this.options.width, this.options.height,
						this.options.depth, this.options.frameCount);
			};

			Controller.prototype.thresholdCanvas = function() {
				var webcamImageData = this.webcam.getImageData();
				var webcamData = webcamImageData.data;
				var previousData = this.previousImageData.data;
				var deltaData = this.deltaImageData.data;
				for ( var i = 0, l = webcamData.length; i < l; i += 4) {
					var r = webcamData[i];
					var g = webcamData[i + 1];
					var b = webcamData[i + 2];
					var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
					deltaData[i] = webcamData[i];
					deltaData[i + 1] = webcamData[i + 1];
					deltaData[i + 2] = webcamData[i + 2];
					if (Math.abs(previousData[i] - v) >= this.options.renderThreshold) {
						deltaData[i + 3] = this.options.renderMovement ? 255 : 0;
					} else {
						deltaData[i + 3] = this.options.renderStatic ? 255 : 0;
					}
					webcamData[i] = webcamData[i + 1] = webcamData[i + 2] = v;
				}
				this.previousImageData = webcamImageData;
				this.webcam.putImageData(this.deltaImageData);
			};

			Controller.prototype.onAnimationFrame = function onAnimationFrame(timestamp) {
				requestAnimationFrame(onAnimationFrame.bind(this));

				this.body.css('background', this.options.background).perspective(
						this.options.perspective);
				this.container.css('opacity', this.options.opacity);
				this.cube.clearTransform().scale(this.options.scaleXY, this.options.scaleXY,
						this.options.scaleZ);

				if ((timestamp - this.lastFrameTimestamp >= 1000 / this.options.fps)
						&& !this.options.paused) {
					this.webcam.snapshot();
					if (!this.options.renderMovement || !this.options.renderStatic) {
						this.thresholdCanvas();
					}
					this.imageCube.add(this.webcam.canvas);
					this.lastFrameTimestamp = timestamp;
				}
			};

			// TODO: enable/disable
			/*
			 * $(webcamControl.video).css({ width : 128, height : 96
			 * }).appendTo($body);
			 */
			var options = {
				background : '#000',
				opacity : 0.2,
				renderMovement : true,
				renderStatic : true,
				renderThreshold : 5,
				paused : false,
				perspective : 1000000,
				fps : 10,
				frameCount : 10,
				scaleXY : 5,
				scaleZ : 5,
				width : 128,
				height : 96,
				depth : 128
			};

			var body = $('body').preserve3d();
			var container = $('.container').preserve3d();
			var mouseControl = new MouseControl(container);
			var cube = $('.cube').preserve3d();

			var gui = new dat.GUI();
			gui.addColor(options, 'background');
			gui.add(options, 'perspective', {
				'1,000,000' : 1000000,
				'    1,000' : 1000,
				'      500' : 500,
				'      100' : 100,
				'       50' : 50
			});
			gui.add(options, 'opacity', 0, 1);
			gui.add(options, 'scaleXY', 0, 10);
			gui.add(options, 'scaleZ', {
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
			gui.add(mouseControl, 'rotX', 0, 360).listen();
			gui.add(mouseControl, 'rotY', 0, 360).listen();
			gui.add(options, 'paused');
			gui.add(options, 'fps', 1, 30);
			gui.add(options, 'frameCount', 2, 200).onFinishChange(function() {
				if (window.ctrl) {
					ctrl.resetDimensions();
				}
			});

			webcam.create().then(
					function(webcam) {
						$('body').append(webcam.video).append(webcam.canvas);
						var ctrl = new Controller(options, webcam, new ImageCube(cube), body,
								container, cube);
						ctrl.resetDimensions();
						ctrl.onAnimationFrame(0);
						window.ctrl = ctrl;
					}, showError);
		});
