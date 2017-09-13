define(
  ['./jsfeat'],
  function (jsfeat) {

    function Processing() {
      this.blurRadius = 2;
      this.lowThreshold = 20;
      this.highThreshold = 50;
    }

    Processing.prototype.process = function (imageData) {
      var data = imageData.data;

      this.buffer = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.U8C1_t);

      jsfeat.imgproc.grayscale(data, this.buffer.cols, this.buffer.rows, this.buffer);

      jsfeat.imgproc.gaussian_blur(this.buffer, this.buffer, this.blurRadius, 0);

      jsfeat.imgproc.canny(this.buffer, this.buffer, this.lowThreshold, this.highThreshold);

      var array = new Uint32Array(data.buffer);
      var alpha = (0xff << 24);
      var i = this.buffer.cols * this.buffer.rows, pix = 0;
      while (--i >= 0) {
        pix = this.buffer.data[i];
        array[i] = alpha | (pix << 16) | (pix << 8) | pix;
      }

      return imageData;
    }

    return Processing;
  });