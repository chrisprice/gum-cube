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
	var depth = 256, width = 256, segmentsDepth = 16, segmentsWidth = 16;
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
		aColor : {
			type : "v4",
			value : []
		}
	};
	var shaderMaterial = new THREE.ShaderMaterial({
		attributes : attributes,
		vertexShader : vShader.text(),
		fragmentShader : fShader.text()
	});
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color : 0xCC0000
	});
	var radius = 50, segments = 16, rings = 16; // 16 segments means 17 vertices
	var sphere = new THREE.SphereGeometry(radius, segments, rings);
	var mesh = new THREE.Mesh(plane, shaderMaterial);
	console.log(mesh.geometry.vertices.length);
	for ( var i = 0; i < mesh.geometry.vertices.length; i++) {
		attributes.aColor.value.push(new THREE.Vector4(i % 2 == 1, i % 2 == 0, 0.5, i % 2 == 1));
	}

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

	function loop() {
		requestAnimationFrame(loop, renderer.domElement);
		renderer.render(scene, camera);
	}

	requestAnimationFrame(loop, renderer.domElement);
});
