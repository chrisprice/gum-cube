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

			Controller.prototype.setFrameCount = function() {
				this.imageCube.setCount(this.options.frameCount);
			};

			Controller.prototype.togglePreview = function() {
				$([ this.webcam.video, this.webcam.canvas ]).toggle(this.options.preview);
			};

			Controller.prototype.onAnimationFrame = function onAnimationFrame(timestamp) {
				requestAnimationFrame(onAnimationFrame.bind(this));

				this.body.css('background', this.options.background);

				this.imageCube.setOptions(options);

				if ((timestamp - this.lastFrameTimestamp >= 1000 / this.options.fps)
						&& !this.options.paused) {
					this.webcam.snapshot();
					this.imageCube.add(this.webcam.getImageData());
					this.lastFrameTimestamp = timestamp;
				}
			};

			var options = {
				background : '#000',
				opacity : 0.2,
				renderMovement : true,
				renderStatic : false,
				renderThreshold : 10,
				paused : false,
				perspective : 1000000,
				fps : 10,
				frameCount : 100,
				scaleXY : 2,
				scaleZ : 5,
				width : 256,
				height : 192,
				depth : 256,
				preview : false
			};

			var body = $('body').preserve3d();
			var container = $('.container').preserve3d();
			var cube = $('.cube').preserve3d();
			var imageCube = new ImageCube(cube);
			var mouseControl = new MouseControl(container);
			mouseControl.apply = function() {
				imageCube.cube.rotation.set(-this.rotX / 360 * 2 * Math.PI, this.rotY / 360 * 2
						* Math.PI, 0);
				imageCube.needsUpdate = true;
			};

			(function() {
				var gui = new dat.GUI();
				var cube = gui.addFolder('Cube');
				cube.addColor(options, 'background');
				cube.add(options, 'perspective', {
					'1,000,000' : 1000000,
					'    1,000' : 1000,
					'      500' : 500,
					'      100' : 100,
					'       50' : 50
				});
				cube.add(options, 'opacity', 0, 1);
				cube.add(options, 'scaleXY', 0, 10);
				cube.add(options, 'scaleZ', {
					'    1,000' : 1000,
					'      500' : 500,
					'      100' : 100,
					'       50' : 50,
					'       10' : 10,
					'        5' : 5,
					'        1' : 1
				});
				var rot = gui.addFolder('Rotation');
				rot.add(mouseControl, 'rotationDamping', {
					'None' : 0,
					'Low' : 0.01,
					'High' : 0.05,
					'Critical' : 1
				});
				rot.add(mouseControl, 'rotX', 0, 360).listen();
				rot.add(mouseControl, 'rotY', 0, 360).listen();
				var webcam = gui.addFolder('Webcam');
				webcam.add(options, 'renderMovement');
				webcam.add(options, 'renderStatic');
				webcam.add(options, 'renderThreshold', 0, 255);
				webcam.add(options, 'paused');
				webcam.add(options, 'fps', 1, 30);
				webcam.add(options, 'preview').onChange(function() {
					if (window.ctrl) {
						ctrl.togglePreview();
					}
				});
				gui.add(options, 'frameCount', 2, 200).onChange(function() {
					if (window.ctrl) {
						ctrl.setFrameCount();
					}
				});
			}());

			webcam.create().then(function(webcam) {
				var ctrl = new Controller(options, webcam, imageCube, body, container, cube);
				ctrl.resetDimensions();
				ctrl.onAnimationFrame(0);
				// removing the video from the body stops it
				$([ webcam.video, webcam.canvas ]).hide().prependTo(body);
				window.ctrl = ctrl;
			}, showError);
		});
