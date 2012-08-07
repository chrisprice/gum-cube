define([ './jquery', './transform' ], function($, transform) {

	var SCALE = 0.5;

	function MouseControl(element) {
		this.element = $(element);
		this.rotationDamping = 0.02;
		this.rotX = this.rotY = 0;
		this.velX = this.velY = 0;
		this.loc = null;
		this.lastMove = null;
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
		this.velX = 0;
		this.velY = 0;
	};

	MouseControl.prototype.move = function(x, y) {
		if (!this.loc) {
			return;
		}
		this.velX = (this.loc.y - y) * SCALE;
		this.velY = (x - this.loc.x) * SCALE;
		this.loc = {
			x : x,
			y : y
		};
		this.lastMove = new Date().getTime();
		// apply mouse movement
		this.rotX += this.velX;
		this.rotY += this.velY;
		// clamp values
		this.rotX = this.clamp(this.rotX);
		this.rotY = this.clamp(this.rotY);
	};

	MouseControl.prototype.clamp = function(value) {
		var n = Math.floor(value / 360) * 360;
		if (value > 0) {
			value = value - n;
		} else if (value < 0) {
			value = 360 + (value - n);
		}
		return value;
	};

	MouseControl.prototype.stop = function(x, y) {
		this.loc = null;
		// clear momentum if the user held the last position
		if (new Date().getTime() - this.lastMove > 200) {
			this.velX = this.velY = 0;
		}
		this.lastMove = null;
	};

	MouseControl.prototype.onAnimationFrame = function() {
		requestAnimationFrame(this.onAnimationFrame.bind(this));

		if (!this.loc) {
			// apply momentum
			this.rotX += this.velX;
			this.rotY += this.velY;
			// clamp values
			this.rotX = this.clamp(this.rotX);
			this.rotY = this.clamp(this.rotY);
			// apply damping
			this.velX *= 1 - this.rotationDamping;
			this.velY *= 1 - this.rotationDamping;
		}

		this.element.clearTransform().rotateX(this.rotX).rotateY(this.rotY);
	};

	MouseControl.prototype.resetRotation = function() {
		this.rotX = this.rotY = 0;
		this.velX = this.velY = 0;
	};

	return MouseControl;
});