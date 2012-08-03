define([ './jquery', './transform' ], function($, transform) {

	var SCALE = 0.5;

	function MouseControl(element) {
		this.element = $(element);
		this.rotationDamping = 0.01;
		this.rot = {
			x : 5,
			y : 45
		};
		this.vel = {
			x : 0,
			y : 0
		};
		this.loc = null;
		this.element.origin('50%', '50%').mousedown(function(e) {
			this.start(e.pageX, e.pageY);
			e.preventDefault();
		}.bind(this));
		$(document).bind("mouseup", function(e) {
			this.stop(e.pageX, e.pageY);
		}.bind(this));
		$(document).mousemove(function(e) {
			this.move(e.pageX, e.pageY);
		}.bind(this));
		requestAnimationFrame(this.onAnimationFrame.bind(this));
	}

	MouseControl.prototype.start = function(x, y) {
		this.loc = {
			x : x,
			y : y
		};
		this.vel = {
			x : 0,
			y : 0
		};
	};

	MouseControl.prototype.move = function(x, y) {
		if (!this.loc) {
			return;
		}
		this.vel = {
			x : (this.loc.y - y) * SCALE,
			y : (x - this.loc.x) * SCALE
		};
		this.loc = {
			x : x,
			y : y
		};
		this.rot.x += this.vel.x;
		this.rot.y += this.vel.y;
	};

	MouseControl.prototype.stop = function(x, y) {
		this.loc = null;
	};

	MouseControl.prototype.onAnimationFrame = function() {
		requestAnimationFrame(this.onAnimationFrame.bind(this));

		if (!this.loc) {
			this.rot.x += this.vel.x;
			this.vel.x *= 1 - this.rotationDamping;
			this.rot.y += this.vel.y;
			this.vel.y *= 1 - this.rotationDamping;
		}

		this.element.clearTransform().rotateX(this.rot.x).rotateY(this.rot.y);
	};

	MouseControl.prototype.resetRotation = function() {
		this.rot = {
			x : 0,
			y : 0
		};
		this.vel = {
			x : 0,
			y : 0
		};
	};

	return MouseControl;
});