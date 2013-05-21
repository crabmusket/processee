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
			return objToColor({red: Math.abs(sumR), green: Math.abs(sumG), blue: Math.abs(sumB)});
		}
	},

	combine: function(images, fn) {
		return function() {
			t = this.makeNewImage({copy: images[0]});
			for(var i = 1; i < images.length; i++) {
				this.setEachPixelOf({
					image: t,
					to: function(p) {
						p1 = this.getPixel({of: images[i], x: p.x, y: p.y});
						p.r = p.red = fn.call(this, p.red, p1.red);
						p.g = p.green = fn.call(this, p.green, p1.green);
						p.b = p.blue = fn.call(this, p.blue, p1.blue);
						return p;
					}
				});
			}
			return t;
		};
	},

	add: function(images) {
		return filters.combine(images, function(a, b) {
			return Math.min(255, a+b);
		});
	},

	sub: function(images) {
		return filters.combine(images, function(a, b) {
			return Math.max(0, a-b);
		});
	},
}
