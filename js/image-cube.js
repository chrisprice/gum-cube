define([ './jquery', './Three' ], function($, THREE__) {

	// set the scene size
	var WIDTH = 800, HEIGHT = 600;

	var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

	var VERTEX_SHADER = [
			"uniform sampler2D uData;",
			"attribute vec2 aUV;",
			"varying vec4 vColor;",
			"void main() {",
			"	float radius = 1.0 / 256.0;",
			"	vColor = texture2D(uData, aUV);",
			"	vec4 color;",
			"	color += texture2D(uData, vec2(aUV.x - radius, aUV.y - radius)) *  0.5;",
			"	color += texture2D(uData, vec2(aUV.x         , aUV.y - radius)) *  1.0;",
			"	color += texture2D(uData, vec2(aUV.x + radius, aUV.y - radius)) *  0.5;",
			"	color += texture2D(uData, vec2(aUV.x - radius, aUV.y         )) *  1.0;",
			"	color += texture2D(uData, vec2(aUV.x         , aUV.y         )) * -6.0;",
			"	color += texture2D(uData, vec2(aUV.x + radius, aUV.y         )) *  1.0;",
			"	color += texture2D(uData, vec2(aUV.x - radius, aUV.y + radius)) *  0.5;",
			"	color += texture2D(uData, vec2(aUV.x         , aUV.y + radius)) *  1.0;",
			"	color += texture2D(uData, vec2(aUV.x + radius, aUV.y + radius)) *  0.5;",
			"	vColor.a = abs((color.r + color.g + color.b) / 3.0) * 2.0;",
			"	gl_Position = projectionMatrix *",
			"		modelViewMatrix *",
			"		vec4(position,1.0);",
			"	gl_PointSize = 1.0;",
			"}",
	].join("\n");

	var FRAGMENT_SHADER = [
			"varying vec4 vColor;",
			"void main(void) {",
			"	gl_FragColor = vColor;",
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
		this.camera.position.z = 300;
		// add the camera to the scene
		this.scene.add(this.camera);

		// create a WebGL renderer, camera
		this.renderer = new THREE.WebGLRenderer();
		// start the renderer
		this.renderer.setSize(WIDTH, HEIGHT);
		// attach the render-supplied DOM element
		this.container.append(this.renderer.domElement);

		requestAnimationFrame(this.onAnimationFrame.bind(this), this.renderer.domElement);
	}

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
		var delta = -this.depth / count;
		var z = this.depth / 2;
		if (count % 2 === 0) {
			z += delta / 2;
		}
		var geometry = this.createPlaneGeometry();
		var textureMap = this.createTextureMap();
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
					attributes : {
						aUV : {
							type : "v2",
							value : textureMap
						}
					},
					vertexShader : VERTEX_SHADER,
					fragmentShader : FRAGMENT_SHADER
				});
				plane = new THREE.ParticleSystem(geometry, shaderMaterial);
				this.cube.add(plane);
			}
			plane.position.z = z;
			z += delta;
		}
		for (i = count; i < this.cube.children.length; i++) {
			this.cube.remove(this.cube.children[i]);
		}
	};

	Cube.prototype.createPlaneGeometry = function() {
		var geo = new THREE.Geometry();
		var offsetX = -this.width / 2;
		var offsetY = -this.height / 2;
		for ( var y = 0; y < this.height; y++) {
			for ( var x = 0; x < this.width; x++) {
				geo.vertices.push(new THREE.Vector3(offsetX + x, offsetY + y, 0));
			}
		}
		return geo;
	};

	Cube.prototype.createTextureMap = function() {
		var textureMap = [];
		for ( var y = 0; y < this.height; y++) {
			for ( var x = 0; x < this.width; x++) {
				textureMap.push(new THREE.Vector2(x / this.width, 1 - (y / this.height), 0));
			}
		}
		return textureMap;
	};

	Cube.prototype.onAnimationFrame = function() {
		requestAnimationFrame(this.onAnimationFrame.bind(this), this.renderer.domElement);
		this.renderer.render(this.scene, this.camera);
	};

	return Cube;
});
