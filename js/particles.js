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
	var particleDepth = 256, particleCount = 16, particles = new THREE.Geometry();
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
	console.log(vShader.text(), fShader.text());
	var shaderMaterial = new THREE.ShaderMaterial({
		attributes : attributes,
		vertexShader : vShader.text(),
		fragmentShader : fShader.text()
	});

	var delta = particleDepth / particleCount;
	var offset = particleDepth / 2;
	// now create the individual particles on 3d grid pattern
	for ( var z = 0; z < particleCount; z++) {
		for ( var y = 0; y < particleCount; y++) {
			for ( var x = 0; x < particleCount; x++) {
				var particle = new THREE.Vector3(x * delta - offset, y * delta - offset, z * delta
						- offset);
				// add it to the geometry
				particles.vertices.push(particle);
				attributes.aColor.value.push(new THREE.Vector4(x / particleCount,
						y / particleCount, z / particleCount, 0.5));
			}
		}
	}

	// create the particle system
	var particleSystem = new THREE.ParticleSystem(particles, shaderMaterial);

	// sort the particle system so that z order is taken into account when
	// drawing
	particleSystem.sortParticles = true;

	// add it to the scene
	scene.add(particleSystem);

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
		particleSystem.rotation
				.set(this.rotX / 360 * 2 * Math.PI, this.rotY / 360 * 2 * Math.PI, 0);
	};

	function loop() {
		requestAnimationFrame(loop, renderer.domElement);
		renderer.render(scene, camera);
	}

	requestAnimationFrame(loop, renderer.domElement);
});
