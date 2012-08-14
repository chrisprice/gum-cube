require([ './webcam', './jquery', './mouse-control', './transform', './Three' ], function(webcam,
		$, MouseControl, transform__, THREE__) {

	// set the scene size
	var WIDTH = 800, HEIGHT = 600;

	// set some camera attributes
	var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

	// get the DOM element to attach to
	// - assume we've got jQuery to hand
	var $container = $('.container');

	// create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer();

	var scene = new THREE.Scene();

	// create the particle variables
	// 16 segments means 17 vertices
	var VERTEX_WIDTH = 256, VERTEX_HEIGHT = 192;
	var depth = VERTEX_HEIGHT, width = VERTEX_WIDTH;
	var segmentsDepth = VERTEX_HEIGHT - 1, segmentsWidth = VERTEX_WIDTH - 1;
	var plane = new THREE.PlaneGeometry(width, depth, segmentsWidth, segmentsDepth);
	// var pMaterial = new THREE.ParticleBasicMaterial({
	// color : 0xFFFFFF,
	// size : 1
	// });
	// var pMaterial = new THREE.ParticleBasicMaterial({
	// color : 0xFFFFFF,
	// size : 20,
	// map : THREE.ImageUtils.loadTexture("images/particle.png"),
	// blending : THREE.AdditiveBlending,
	// transparent : true
	// });
	var vShader = $('#shader-vs');
	var fShader = $('#shader-fs');
	var attributes = {
		aIndex : {
			type : "v2",
			value : []
		}
	};
	var texture = new THREE.DataTexture(new Uint8Array(4 * 256 * 192), 256, 192, THREE.RGBAFormat);
	var uniforms = {
		uData : {
			type : "t",
			value : 0,
			texture : texture
		},
		uInt : {
			type : "i",
			value : 0
		}
	};
	var shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		attributes : attributes,
		vertexShader : vShader.text(),
		fragmentShader : fShader.text()
	});
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color : 0xCC0000
	});
	var radius = 50, segments = 16, rings = 16;
	var sphere = new THREE.SphereGeometry(radius, segments, rings);
	var mesh = new THREE.Mesh(plane, shaderMaterial);
	console.log(mesh.geometry.vertices.length);
	for ( var i = 0; i < mesh.geometry.vertices.length; i++) {
		attributes.aIndex.value.push(new THREE.Vector2(i % VERTEX_WIDTH / VERTEX_WIDTH, Math
				.floor(i / VERTEX_WIDTH)
				/ VERTEX_WIDTH));
	}
	console.log(attributes.aIndex.value);

	// add it to the scene
	scene.add(mesh);

	// create a point light
	var pointLight = new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	scene.add(pointLight);

	var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.z = 300;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	$container.append(renderer.domElement);

	new MouseControl($container).apply = function() {
		mesh.rotation.set(this.rotX / 360 * 2 * Math.PI, this.rotY / 360 * 2 * Math.PI, 0);
	};

	webcam.create().then(function(webcam) {
		webcam.setSize(256, 192);
		setInterval(function() {
			webcam.snapshot();
			texture.image.data = webcam.getImageData().data;
			texture.needsUpdate = true;
		}, 50);
	});

	function loop() {
		requestAnimationFrame(loop, renderer.domElement);
		renderer.render(scene, camera);
	}

	requestAnimationFrame(loop, renderer.domElement);

	// webcam.create().then(function(webcam) {
	// setInterval(function() {
	// webcam.snapshot();
	// var imageData = webcam.getImageData();
	//
	// });
	// });
});