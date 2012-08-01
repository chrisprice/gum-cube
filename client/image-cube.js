define([ './jquery', './transform' ], function($, css3) {

	function Cube(container, width, height, depth, count) {
		this.container = $(container).css({
			position : 'absolute',
			top : 0,
			bottom : 0,
			left : 0,
			right : 0
		}).preserve3d();
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.count = count;
		this.delta = Math.round(depth / count);
		this.imgDepthCounter = Math.round(depth / 2);
		this.containerDepthCounter = 0;
	}

	Cube.prototype.add = function(element) {
		var $element = $(element).css({
			position : 'absolute',
			top : '50%',
			left : '50%',
			marginTop : -this.height / 2,
			marginLeft : -this.width / 2
		}).translate(0, 0, this.imgDepthCounter);
		this.imgDepthCounter += this.delta;
		this.container.append($element).clearTransform()
				.translate(0, 0, this.containerDepthCounter);
		this.containerDepthCounter -= this.delta;
		if (this.container.children().length > this.count) {
			this.container.children().first().remove();
		}
	};

	return Cube;
});