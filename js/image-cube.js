define([ './jquery', './Three' ], function($, THREE__) {

	// set the scene size
	var WIDTH = 800, HEIGHT = 600;
	var DEPTH = 100000;
	var VIEW_ANGLE = 0.2, ASPECT = WIDTH / HEIGHT, NEAR = DEPTH - 500, FAR = DEPTH + 500;

	var VERTEX_SHADER = [
			"varying vec2 vUv;",
			"void main() {",
			"	vUv = uv;",
			"	gl_Position = projectionMatrix *",
			"		modelViewMatrix *",
			"		vec4(position,1.0);",
			"}",
	].join("\n");

	var FRAGMENT_SHADER = [
			"uniform sampler2D uData;",
			"varying vec2 vUv;",
			"void main(void) {",
			"	float radius = 1.0 / 256.0;",
			"//	vec4 color;",
			"//	color += texture2D(uData, vec2(vUv.x - radius, vUv.y - radius)) *  0.5;",
			"//	color += texture2D(uData, vec2(vUv.x         , vUv.y - radius)) *  1.0;",
			"//	color += texture2D(uData, vec2(vUv.x + radius, vUv.y - radius)) *  0.5;",
			"//	color += texture2D(uData, vec2(vUv.x - radius, vUv.y         )) *  1.0;",
			"//	color += texture2D(uData, vec2(vUv.x         , vUv.y         )) * -6.0;",
			"//	color += texture2D(uData, vec2(vUv.x + radius, vUv.y         )) *  1.0;",
			"//	color += texture2D(uData, vec2(vUv.x - radius, vUv.y + radius)) *  0.5;",
			"//	color += texture2D(uData, vec2(vUv.x         , vUv.y + radius)) *  1.0;",
			"//	color += texture2D(uData, vec2(vUv.x + radius, vUv.y + radius)) *  0.5;",
			"//	if (abs((color.r + color.g + color.b) / 3.0) < 0.3) discard;",
			"	gl_FragColor = texture2D(uData, vUv);",
			"	gl_FragColor.a = 0.5;",
			"}",
	].join("\n");

	function Cube(container) {
		this.container = container;
		this.scene = new THREE.Scene();

		this.cube = new THREE.Object3D();
		this.scene.add(this.cube);

		this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// the camera starts at 0,0,0
		// so pull it back
		this.camera.position.z = DEPTH;
		// add the camera to the scene
		this.scene.add(this.camera);

		// create a WebGL renderer, camera
		this.renderer = new THREE.WebGLRenderer();
		// start the renderer
		this.renderer.setSize(WIDTH, HEIGHT);
		// attach the render-supplied DOM element
		this.container.append(this.renderer.domElement);

		$(document).keydown(function(e) {
			if (e.keyCode == 27) {
				this.toggleAnimation();
			}
		}.bind(this));

		this.toggleAnimation();
	}

	Cube.prototype.toggleAnimation = function() {
		if (this.requestId) {
			cancelAnimationFrame(this.requestId);
			this.requestId = null;
		} else {
			this.requestId = requestAnimationFrame(this.onAnimationFrame.bind(this),
					this.renderer.domElement);
		}
	};

	Cube.prototype.add = function(imageData) {
		// grab a reference to the last texture
		var lastChild = this.cube.children[this.cube.children.length - 1];
		var recycledTexture = lastChild.material.uniforms.uData.texture;
		// loop backwards through the children rippling the texture
		for ( var i = this.cube.children.length - 1; i > 0; i--) {
			var child = this.cube.children[i];
			var previousChild = this.cube.children[i - 1];
			child.material.uniforms.uData.texture = previousChild.material.uniforms.uData.texture;
		}
		// update the recycled texture
		recycledTexture.image.data = imageData.data;
		recycledTexture.needsUpdate = true;
		// and slap it on the front
		var firstChild = this.cube.children[0];
		firstChild.material.uniforms.uData.texture = recycledTexture;
	};

	Cube.prototype.setDimensions = function(width, height, depth, count) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.setCount(count);
	};

	Cube.prototype.setCount = function(count) {
		count = Math.round(count);
		var delta = -this.depth / count;
		var z = (this.depth + delta) / 2;
		for ( var i = 0; i < count; i++) {
			var plane = this.cube.children[i];
			if (!plane) {
				var texture = new THREE.DataTexture([], this.width, this.height, THREE.RGBAFormat);
				var shaderMaterial = new THREE.ShaderMaterial({
					uniforms : {
						uData : {
							type : "t",
							value : 0,
							texture : texture
						},
					},
					vertexShader : VERTEX_SHADER,
					fragmentShader : FRAGMENT_SHADER,
					transparent : true
				});
				plane = new THREE.Mesh(this.createPlaneGeometry(), shaderMaterial);
				this.cube.add(plane);
			}
			plane.position.z = z;
			z += delta;
		}
		for (i = this.cube.children.length - 1; i >= count; i--) {
			var plane = this.cube.children[i];
			this.cube.remove(plane);
			this.renderer.deallocateTexture(plane.material.uniforms.uData.texture);
			this.renderer.deallocateObject(plane);
		}
	};

	Cube.prototype.createPlaneGeometry = function() {
		var geo = new THREE.Geometry();
		var plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
		var obj = new THREE.Mesh(plane);
		obj.rotation.x = Math.PI / 2;
		THREE.GeometryUtils.merge(geo, obj);
		return geo;
	};

	Cube.prototype.onAnimationFrame = function() {
		this.requestId = null;
		this.toggleAnimation();
		this.renderer.render(this.scene, this.camera);
	};

	return Cube;
});
