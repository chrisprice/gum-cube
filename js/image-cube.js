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
			"uniform float uOpacity;",
			"uniform float uThreshold;",
			"uniform sampler2D uTexture;",
			"uniform sampler2D uTexture2;",
			"varying vec2 vUv;",
			"void main(void) {",
			"	vec4 color = texture2D(uTexture, vUv);",
			"	vec4 old = texture2D(uTexture2, vUv);",
			"	float delta = (abs(old.r - color.r) + abs(old.g - color.g)",
			"		+ abs(old.b - color.b))/3.0;",
			"	if (delta < uThreshold) discard;",
			"	gl_FragColor = color;",
			"	gl_FragColor.a = uOpacity;",
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
		var recycledTexture = lastChild.material.uniforms.uTexture2.texture;
		// loop backwards through the children rippling the texture
		for ( var i = this.cube.children.length - 1; i > 0; i--) {
			var child = this.cube.children[i];
			var pChild = this.cube.children[i - 1];
			child.material.uniforms.uTexture2.texture = child.material.uniforms.uTexture.texture;
			child.material.uniforms.uTexture.texture = pChild.material.uniforms.uTexture.texture;
		}
		// update the recycled texture
		recycledTexture.image.data = imageData.data;
		recycledTexture.needsUpdate = true;
		// and slap it on the front
		var fChild = this.cube.children[0];
		fChild.material.uniforms.uTexture2.texture = fChild.material.uniforms.uTexture.texture;
		fChild.material.uniforms.uTexture.texture = recycledTexture;
		this.needsUpdate = true;
	};

	Cube.prototype.setDimensions = function(width, height, depth, count) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.setCount(count);
	};

	Cube.prototype.createBlankTexture = function(count) {
		return new THREE.DataTexture([], this.width, this.height, THREE.RGBAFormat);
	};

	Cube.prototype.setCount = function(count) {
		count = Math.round(count);
		var delta = -this.depth / count;
		var z = (this.depth + delta) / 2;
		for ( var i = 0; i < count; i++) {
			var plane = this.cube.children[i];
			if (!plane) {
				var texture = texture2 || this.createBlankTexture();
				var texture2 = this.createBlankTexture();
				var shaderMaterial = new THREE.ShaderMaterial({
					uniforms : {
						uOpacity : {
							type : "f",
							value : 0.1
						},
						uThreshold : {
							type : "f",
							value : 0.1
						},
						uTexture : {
							type : "t",
							value : 0,
							texture : texture
						},
						uTexture2 : {
							type : "t",
							value : 1,
							texture : texture2
						},
					},
					vertexShader : VERTEX_SHADER,
					fragmentShader : FRAGMENT_SHADER,
					transparent : true
				});
				plane = new THREE.Mesh(this.createPlaneGeometry(), shaderMaterial);
				plane.doubleSided = true;
				this.cube.add(plane);
			}
			plane.position.z = z;
			z += delta;
		}
		for (i = this.cube.children.length - 1; i >= count; i--) {
			var plane = this.cube.children[i];
			this.cube.remove(plane);
			this.renderer.deallocateTexture(plane.material.uniforms.uTexture2.texture);
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
		if (this.needsUpdate) {
			this.renderer.render(this.scene, this.camera);
			this.needsUpdate = false;
		}
	};

	return Cube;
});
