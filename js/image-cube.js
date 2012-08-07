define([ './jquery', './transform' ], function($, css3) {

	function Cube(container) {
		this.container = container;
	}

	Cube.prototype.add = function(image) {
		var children = this.container.children();
		var ctx;
		for ( var i = children.length - 1; i > 0; i--) {
			ctx = children[i].getContext('2d');
			ctx.clearRect(0, 0, this.width, this.height);
			ctx.drawImage(children[i - 1], 0, 0);
		}
		ctx = children[0].getContext('2d');
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.drawImage(image, 0, 0);
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
		console.log(delta, z);
		var children = this.container.children();

		for ( var i = 0; i < count; i++) {
			var canvas = children.eq(i);
			if (!canvas.length) {
				canvas = $('<canvas/>').width(this.width).height(this.height).attr({
					width : this.width,
					height : this.height
				}).css({
					position : 'absolute',
					top : '50%',
					left : '50%',
					marginTop : -this.height / 2,
					marginLeft : -this.width / 2
				}).appendTo(this.container);
			}
			canvas.clearTransform().translate(0, 0, z);
			z += delta;
		}
		for (i = count; i < children.length; i++) {
			children.eq(i).remove();
		}
	};

	return Cube;
});
