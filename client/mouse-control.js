define([ './jquery', './transform' ], function($, __transform) {

	function MouseControl(element) {
		this.element = $(element);
		this.rot = {
			x : 0,
			y : 0
		};
		this.loc = null;
		this.element.origin('50%', '50%').mousedown(function(e) {
			this.start(e.pageX, e.pageY);
			e.preventDefault();
		}.bind(this));
		$(document).bind("mouseleave mouseup", function(e) {
			this.stop();
		}.bind(this));
		$(document).mousemove(function(e) {
			this.move(e.pageX, e.pageY);
		}.bind(this));
	}

	MouseControl.prototype.start = function(x, y) {
		this.loc = {
			x : x,
			y : y
		};
	};

	MouseControl.prototype.move = function(x, y) {
		if (!this.loc) {
			return;
		}
		var xrel = x - this.loc.x;
		var yrel = this.loc.y - y;
		this.loc = {
			x : x,
			y : y
		};
		this.rot.x += yrel * 0.5;
		this.rot.y += xrel * 0.5;
		this.update();
	};

	MouseControl.prototype.stop = function() {
		this.loc = null;
	};

	MouseControl.prototype.update = function() {
		this.element.clearTransform().rotateX(this.rot.x).rotateY(this.rot.y);
	};

	MouseControl.prototype.resetRotation = function() {
		this.rot = {
			x : 0,
			y : 0
		};
		this.update();
	};

	return MouseControl;
});