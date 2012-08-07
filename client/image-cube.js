define([ './jquery', './transform' ], function($, css3) {

	function Cube(container) {
		this.container = container;
	}

	Cube.prototype.add = function(image) {
		var ctx;
		for ( var i = this.children.length - 1; i > 0; i--) {
			ctx = this.children[i].getContext('2d');
			ctx.clearRect(0, 0, this.width, this.height);
			ctx.drawImage(this.children[i - 1], 0, 0);
		}
		ctx = this.children[0].getContext('2d');
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.drawImage(image, 0, 0);
	};

	Cube.prototype.setDimensions = function(width, height, depth, count) {
		this.width = width;
		this.height = height;

		this.container.empty();
		this.children = [];

		var delta = Math.round(depth / count);
		for ( var z = Math.round(depth / 2); z >= -Math.round(depth / 2); z -= delta) {
			var canvas = $('<canvas/>').width(this.width).height(this.height).attr({
				width : this.width,
				height : this.height
			}).css({
				position : 'absolute',
				top : '50%',
				left : '50%',
				marginTop : -this.height / 2,
				marginLeft : -this.width / 2
			}).translate(0, 0, z);
			this.container.append(canvas);
			this.children.push(canvas[0]);
		}
	};

	return Cube;
});
