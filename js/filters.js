window.filters = {
	threshold: function(gray) {
		return function(pixel) {
			if(pixel.red + pixel.green + pixel.blue > gray * 3) {
				return {gray: 255};
			} else {
				return {gray: 0};
			}
		}
	},

	grayscale: function(pixel) {
		return {gray: (pixel.red + pixel.green + pixel.blue) / 3};
	},

	convolveWith: function(mat, scale) {
		if(typeof mat == 'object' && !mat.length) {
			scale = mat.scale;
			mat = mat.matrix || mat.mat;
		}
		if(scale === undefined) {
			scale = 1;
		}
		var diam = Math.sqrt(mat.length);
		if(parseFloat(diam) != parseInt(diam)) {
			throw {
				name: 'MatrixError',
				message: 'Matrix ' + mat + ' is not square!',
			};
			return;
		}
		return function(pixel) {
			var sumR = 0, sumG = 0, sumB = 0, i = 0;
			this.forEachNeighborOf(pixel, function(pix) {
				sumR += pix.red * mat[i] * scale;
				sumG += pix.green * mat[i] * scale;
				sumB += pix.blue * mat[i] * scale;
				i++;
			});
			return objToColor({red: sumR, green: sumG, blue: sumB});
		}
	},
}
